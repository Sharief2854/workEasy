const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('workEasyApi', {
  // Data Persistence
  getData: () => ipcRenderer.invoke('get-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  
  // File & Folder Pickers
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  
  // App Discovery
  detectInstalledApps: () => ipcRenderer.invoke('detect-installed-apps'),
  
  // Execution
  launchTemplate: (template, options) => ipcRenderer.invoke('launch-template', template, options),
  launchSingleItem: (item) => ipcRenderer.invoke('launch-single-item', item),
  
  // External Browser
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Backup / Import
  exportTemplates: () => ipcRenderer.invoke('export-templates'),
  importTemplates: () => ipcRenderer.invoke('import-templates'),

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
