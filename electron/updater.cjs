const { autoUpdater } = require('electron-updater');
const { app } = require('electron');

let mainWindowRef = null;
let currentStatus = { status: 'idle', message: 'Ready' };

function sendStatusToWindow(statusObj) {
  currentStatus = statusObj;
  if (mainWindowRef && !mainWindowRef.isDestroyed()) {
    mainWindowRef.webContents.send('updater:status', statusObj);
  }
}

function initAutoUpdater(mainWindow) {
  mainWindowRef = mainWindow;

  // Configure logging
  autoUpdater.logger = console;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow({ status: 'checking', message: 'Checking for updates on GitHub...' });
  });

  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow({
      status: 'available',
      message: `Version ${info.version} is available!`,
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : '',
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow({
      status: 'not-available',
      message: 'You are on the latest version.',
      version: info.version || app.getVersion(),
    });
  });

  autoUpdater.on('error', (err) => {
    console.error('[WorkEasy Updater Error]:', err);
    sendStatusToWindow({
      status: 'error',
      message: err == null ? 'Unknown error checking for updates' : (err.message || String(err)),
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent || 0);
    const speedMb = ((progressObj.bytesPerSecond || 0) / (1024 * 1024)).toFixed(2);
    sendStatusToWindow({
      status: 'downloading',
      message: `Downloading update: ${percent}% (${speedMb} MB/s)...`,
      percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow({
      status: 'downloaded',
      message: `Version ${info.version} ready to install!`,
      version: info.version,
    });
  });

  // Automatically check 5 seconds after startup in production
  if (app.isPackaged) {
    setTimeout(() => {
      checkForUpdates().catch((err) => console.log('[WorkEasy] Initial update check:', err.message));
    }, 5000);
  }
}

async function checkForUpdates() {
  if (!app.isPackaged && process.env.NODE_ENV !== 'test_updater') {
    const devStatus = {
      status: 'dev-mode',
      message: 'Running in development mode (v' + app.getVersion() + '). Auto-updates run in packaged app.',
      version: app.getVersion(),
    };
    sendStatusToWindow(devStatus);
    return devStatus;
  }

  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, result };
  } catch (err) {
    console.error('[WorkEasy] Check for updates failed:', err);
    const errorStatus = {
      status: 'error',
      message: err.message || 'Failed to check for updates.',
    };
    sendStatusToWindow(errorStatus);
    return errorStatus;
  }
}

async function downloadUpdate() {
  try {
    sendStatusToWindow({ status: 'downloading', message: 'Starting download...', percent: 0 });
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (err) {
    const errStatus = { status: 'error', message: err.message || 'Download failed.' };
    sendStatusToWindow(errStatus);
    return errStatus;
  }
}

function quitAndInstall() {
  try {
    autoUpdater.quitAndInstall(false, true);
  } catch (err) {
    console.error('[WorkEasy] quitAndInstall failed:', err);
  }
}

function getCurrentStatus() {
  return currentStatus;
}

module.exports = {
  initAutoUpdater,
  checkForUpdates,
  downloadUpdate,
  quitAndInstall,
  getCurrentStatus,
};
