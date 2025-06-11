const { app, BrowserWindow } = require('electron');

const createWindow = () => {
    const win = new BrowserWindow({
        // width: 1920,
        // height: 1080
        width: 1280,
        height: 720
    });

    win.loadFile('./renderer/index.html');
}

app.whenReady().then(() => {
    createWindow();
});