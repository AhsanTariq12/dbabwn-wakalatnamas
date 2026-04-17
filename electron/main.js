const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "Wakalat Management System",
    autoHideMenuBar: true,
  });

  // In development, load from localhost. In production, we'll load from the Vercel URL
  // (You can also build static files, but loading from Vercel allows instant updates)
  const startUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://dbabwn-wakalatnamas.vercel.app'; // Replace with your actual Vercel URL later

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
  return new Promise((resolve, reject) => {
    // Create a hidden window for the actual print job
    let printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        offscreen: true // Optimization: don't render to screen
      }
    });

    printWindow.loadURL(startUrl + url);

    printWindow.webContents.on('did-finish-load', () => {
      // Small timeout to ensure styles (Tailwind/CSS) are fully applied
      setTimeout(() => {
        printWindow.webContents.print({
          silent: true,
          printBackground: true,
          deviceName: deviceName,
        }, (success, errorType) => {
          printWindow.close();
          if (success) {
            resolve({ success: true });
          } else {
            reject({ success: false, error: errorType });
          }
        });
      }, 500);
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
