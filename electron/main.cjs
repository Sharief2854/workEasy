const { app, BrowserWindow, ipcMain, dialog, shell, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { loadData, saveData } = require('./store.cjs');
const { detectInstalledApps } = require('./appDetector.cjs');
const { getBrowserProfiles } = require('./browserProfiles.cjs');
const { getThunderboardInfo, setActiveThunderboardBatch } = require('./thunderboard.cjs');
const { initAutoUpdater, checkForUpdates, downloadUpdate, quitAndInstall, getCurrentStatus } = require('./updater.cjs');
const { launchTemplate, launchItem } = require('./launcher.cjs');

let mainWindow = null;
let tray = null;

const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

function createWindow() {
  const iconPath = path.join(__dirname, '../public/workeasy.ico');
  const pngIconPath = path.join(__dirname, '../public/workeasy.png');

  mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0b0f19',
    title: 'WorkEasy Pro - Developed by Sharief',
    icon: fs.existsSync(iconPath) ? iconPath : (fs.existsSync(pngIconPath) ? pngIconPath : undefined),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const distPath = path.join(__dirname, '../dist/index.html');
  
  if (isDev && process.env.VITE_DEV_SERVER === 'true') {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      if (fs.existsSync(distPath)) {
        mainWindow.loadFile(distPath);
      }
    });
  } else if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  // Prevent navigating away
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Initialize Auto-Updater
  try {
    initAutoUpdater(mainWindow);
  } catch (updErr) {
    console.error('Failed to initialize auto-updater:', updErr);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ==================== IPC HANDLERS ====================

ipcMain.handle('get-data', async () => {
  return loadData();
});

ipcMain.handle('save-data', async (_, data) => {
  return saveData(data);
});

ipcMain.handle('detect-installed-apps', async () => {
  return detectInstalledApps();
});

ipcMain.handle('get-browser-profiles', async () => {
  return getBrowserProfiles();
});

ipcMain.handle('thunderboard:getInfo', async () => {
  return getThunderboardInfo();
});

ipcMain.handle('thunderboard:setActiveBatch', async (_, batchId) => {
  return setActiveThunderboardBatch(batchId);
});

// ==================== AUTO-UPDATER IPC ====================
ipcMain.handle('updater:check', async () => {
  return checkForUpdates();
});

ipcMain.handle('updater:download', async () => {
  return downloadUpdate();
});

ipcMain.handle('updater:install', async () => {
  quitAndInstall();
  return true;
});

ipcMain.handle('updater:getStatus', async () => {
  return getCurrentStatus();
});

ipcMain.handle('get-app-version', async () => {
  return app.getVersion();
});

ipcMain.handle('select-file', async (_, options = {}) => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: options.title || 'Select Application or File',
    properties: ['openFile'],
    filters: options.filters || [
      { name: 'Executables & Scripts', extensions: ['exe', 'bat', 'cmd', 'lnk', 'ps1', 'vbs'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('select-folder', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Project Directory / Folder',
    properties: ['openDirectory'],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('launch-template', async (_, template, options = {}) => {
  const result = await launchTemplate(template, options, (progress) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('launch-progress', progress);
    }
  });

  if (options.minimizeOnLaunch && mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }

  return result;
});

ipcMain.handle('launch-single-item', async (_, item) => {
  return launchItem(item);
});

ipcMain.handle('open-external', async (_, url) => {
  if (url) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});

ipcMain.handle('open-extension-folder', async () => {
  const extPath = path.join(__dirname, '../extensions/workeasy-meet-helper');
  await shell.openPath(extPath);
  return extPath;
});

ipcMain.handle('export-templates', async () => {
  if (!mainWindow) return { success: false };
  const data = loadData();
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export WorkEasy Templates',
    defaultPath: 'workeasy-templates-backup.json',
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  });

  if (!result.canceled && result.filePath) {
    try {
      fs.writeFileSync(result.filePath, JSON.stringify(data.templates, null, 2), 'utf-8');
      return { success: true, filePath: result.filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, canceled: true };
});

ipcMain.handle('import-templates', async () => {
  if (!mainWindow) return { success: false };
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import WorkEasy Templates',
    properties: ['openFile'],
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const raw = fs.readFileSync(result.filePaths[0], 'utf-8');
      const imported = JSON.parse(raw);
      if (Array.isArray(imported)) {
        const current = loadData();
        // Merge or replace
        const newTemplates = [...imported, ...current.templates.filter(t => !imported.some(i => i.id === t.id))];
        saveData({ ...current, templates: newTemplates });
        return { success: true, count: imported.length, templates: newTemplates };
      }
      throw new Error('Invalid templates file structure');
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, canceled: true };
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('quit-app', () => {
  app.quit();
});
