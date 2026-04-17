const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printSilently: (options) => ipcRenderer.invoke('print-silent', options),
  isDesktop: true
});
