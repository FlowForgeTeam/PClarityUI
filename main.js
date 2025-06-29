const { app, BrowserWindow, ipcMain, globalShortcut, dialog  } = require('electron');
const windowStateKeeper = require('electron-window-state');
const path = require('node:path');

const PRELOAD_SCRIPT = 'preload.js'

const createWindow = () => {

    let mainWindowState = windowStateKeeper({
        defaultWidth: 1440,
        defaultHeight: 960,
    });
    
    const win = new BrowserWindow({
        // x: mainWindowState.x,
        // y: mainWindowState.y,
        // width: mainWindowState.width,
        // height: mainWindowState.height,
        width: 1440, // disabled windowStateKeeper for now
        height: 960,

        minWidth: 1280,
        minHeight: 800,
        // maxWidth: 1440,
        // maxHeight: 960,
        show: false,
        frame: false, // disable default frame (Windows)
        webPreferences: {
            preload: path.join(__dirname, PRELOAD_SCRIPT),
            contextIsolation: true,
            sandbox: false,
            nodeIntegration: false
        }
    });

    mainWindowState.manage(win);

    win.loadFile('./renderer/index.html');
    win.show();

    //win.webContents.openDevTools();

    // For enabling DevTools
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        win.webContents.toggleDevTools();
    });

    // IPC handlers for window controls
    ipcMain.on('window-minimize', (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window.minimize();
    });

    ipcMain.on('window-maximize', (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    });

    ipcMain.on('window-close', (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window.close();
    });

    ipcMain.handle('show-folder-dialog', async (event, defaultPath) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        const result = await dialog.showOpenDialog(window, {
            title: 'Select Log Folder',
            defaultPath: defaultPath,
            properties: ['openDirectory']
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
            return result.filePaths[0];
        }
        return null;
    });

    win.on('maximize', () => {
        win.webContents.send('window-maximized');
    });

    win.on('unmaximize', () => {
        win.webContents.send('window-unmaximized');
    });
};

app.whenReady().then(() => {
    createWindow();
})

app.on('window-all-closed', () => {
    app.quit();
})