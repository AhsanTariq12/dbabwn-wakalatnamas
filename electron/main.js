const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function getStartUrl() {
  let url = '';
  if (!app.isPackaged) {
    url = process.env.ELECTRON_START_URL || 'http://localhost:3000';
  } else {
    url = 'https://dbabwn-wakalatnamas.vercel.app';
  }

  // Trim any accidental spaces and ensure no trailing slash for consistent concatenation
  url = url.trim();
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "DBABWN WakalatNamas",
    autoHideMenuBar: true,
  });
  // Hide the default Electron menu (eliminates "Create Next App" or "Electron" menu items)
  const { Menu } = require('electron');
  Menu.setApplicationMenu(null);

  const startUrl = getStartUrl();
  mainWindow.loadURL(startUrl);


  // Set a custom User Agent so the server can identify the desktop app
  mainWindow.webContents.setUserAgent(mainWindow.webContents.getUserAgent() + " WakalatDesktop");

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// IPC Handlers for Desktop-only Features
ipcMain.handle('get-printers', async () => {
  if (!mainWindow) return [];
  return await mainWindow.webContents.getPrintersAsync();
});

ipcMain.handle('print-silent', async (event, { url, deviceName }) => {
  return new Promise((resolve) => {
    // Safety timeout: if anything hangs, resolve after 30 seconds
    const timeout = setTimeout(() => {
      if (printWindow) printWindow.close();
      resolve({ success: false, error: 'Print job timed out' });
    }, 30000);

    let printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        offscreen: true
      }
    });

    const fullUrl = getStartUrl() + url;
    printWindow.loadURL(fullUrl);

    printWindow.webContents.on('did-finish-load', async () => {
      // Small timeout to ensure styles (Tailwind/CSS) and dynamic content (Microtext) are fully applied
      setTimeout(async () => {
        try {
          // Check if print returns a promise (newer Electron) or uses a callback
          const printOptions = {
            silent: true,
            printBackground: true,
            deviceName: deviceName,
          };

          const result = printWindow.webContents.print(printOptions, (success, errorType) => {
            // This callback is for older Electron versions
            clearTimeout(timeout);
            if (!printWindow.isDestroyed()) printWindow.close();
            resolve({ success, error: errorType });
          });

          // If result is a promise, wait for it (newer Electron versions)
          if (result instanceof Promise) {
            await result;
            clearTimeout(timeout);
            if (!printWindow.isDestroyed()) printWindow.close();
            resolve({ success: true });
          }
        } catch (err) {
          clearTimeout(timeout);
          if (!printWindow.isDestroyed()) printWindow.close();
          resolve({ success: false, error: err.message });
        }
      }, 1000); // Increased to 1s for safety
    });

    printWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error(`[main] Failed to load print template: ${errorCode} - ${errorDescription}`);
      clearTimeout(timeout);
      if (!printWindow.isDestroyed()) printWindow.close();
      resolve({ success: false, error: `Failed to load template: ${errorDescription}` });
    });
  });
});

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
