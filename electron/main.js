const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function getStartUrl() {
  // On Windows, `NODE_ENV` often isn't set for the Electron process when started via npm scripts.
  // `app.isPackaged` is a reliable way to detect dev vs production for Electron.
  if (!app.isPackaged) {
    return process.env.ELECTRON_START_URL || 'http://localhost:3000';
  }

  return 'https://dbabwn-wakalatnamas.vercel.app'; // Replace with your actual production URL
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
  console.log("[main] window created");
  // Hide the default Electron menu (eliminates "Create Next App" or "Electron" menu items)
  const { Menu } = require('electron');
  Menu.setApplicationMenu(null);

  const startUrl = getStartUrl();
  mainWindow.loadURL(startUrl);

  // if (!app.isPackaged) {
  //   // Auto-open DevTools in dev
  //   mainWindow.webContents.openDevTools({ mode: 'detach' });

  //   // Optional: pipe renderer console.* to this terminal
  //   mainWindow.webContents.on('console-message', (e) => {
  //     const message = e?.message ?? '';
  //     const sourceId = e?.sourceId ?? '';
  //     const lineNumber = e?.lineNumber ?? '';
  //     console.log(`[renderer] ${message} (${sourceId}:${lineNumber})`);
  //   });
  // }

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
    // Create a hidden window for the actual print job
    let printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        offscreen: true // Optimization: don't render to screen
      }
    });

    printWindow.loadURL(getStartUrl() + url);

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
            // Resolve (NOT reject) with failure — so the JS catch block is not triggered
            // and the rollback logic in PrintView.tsx can run properly
            resolve({ success: false, error: errorType });
          }
        });
      }, 500);
    });

    // Safety net: if window fails to load, resolve with failure
    printWindow.webContents.on('did-fail-load', () => {
      printWindow.close();
      resolve({ success: false, error: 'Failed to load print template' });
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
