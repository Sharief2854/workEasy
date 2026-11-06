const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('workEasyApi', {
  // Data Persistence
  getData: () => ipcRenderer.invoke('get-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  
  // File & Folder Pickers
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  
  // App Discovery & Browser Profiles & ThunderBoard
  detectInstalledApps: () => ipcRenderer.invoke('detect-installed-apps'),
  getBrowserProfiles: () => ipcRenderer.invoke('get-browser-profiles'),
  getThunderboardInfo: () => ipcRenderer.invoke('thunderboard:getInfo'),
  setThunderboardActiveBatch: (batchId) => ipcRenderer.invoke('thunderboard:setActiveBatch', batchId),
  
  // Execution
  launchTemplate: (template, options) => ipcRenderer.invoke('launch-template', template, options),
  launchSingleItem: (item) => ipcRenderer.invoke('launch-single-item', item),
  
  // External Browser & Extensions
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openExtensionFolder: () => ipcRenderer.invoke('open-extension-folder'),
  
  // Backup / Import
  exportTemplates: () => ipcRenderer.invoke('export-templates'),
  importTemplates: () => ipcRenderer.invoke('import-templates'),

  // Auto-Updater
  checkForUpdates: () => ipcRenderer.invoke('updater:check'),
  downloadUpdate: () => ipcRenderer.invoke('updater:download'),
  quitAndInstallUpdate: () => ipcRenderer.invoke('updater:install'),
  getUpdaterStatus: () => ipcRenderer.invoke('updater:getStatus'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onUpdaterStatus: (callback) => {
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on('updater:status', subscription);
    return () => {
      ipcRenderer.removeListener('updater:status', subscription);
    };
  },

  // Window & App Controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  quitApp: () => ipcRenderer.invoke('quit-app'),

  // Real-time launch events listener
  onLaunchProgress: (callback) => {
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on('launch-progress', subscription);
    return () => {
      ipcRenderer.removeListener('launch-progress', subscription);
    };
  },
});
