const { app, BrowserWindow } = require('electron');
const windowStateKeeper = require('electron-window-state');
const path = require('node:path');

const PRELOAD_SCRIPT = 'preload.js'

const createWindow = () => {

    let mainWindowState = windowStateKeeper({
        defaultWidth: 1440,
        defaultHeight: 960,
    });
    
    const win = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 1280,
        minHeight: 800,
        maxWidth: 1440,
        maxHeight: 960,
        show: false,
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

    win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();
})

app.on('window-all-closed', () => {
    app.quit();
})