const { app, BrowserWindow } = require('electron');
const windowStateKeeper = require('electron-window-state');

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
        show: false
    });

    mainWindowState.manage(win);

    win.loadFile('./renderer/index.html');
    win.show();
}

app.whenReady().then(() => {
    createWindow();
})

app.on('window-all-closed', () => {
    app.quit();
})