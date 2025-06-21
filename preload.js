const { contextBridge, ipcRenderer, shell } = require('electron');

const Twig = require('twig');

const { templatePath } = require('./renderer/js/utils.js');
const { callBackend } = require('./services/backendService.js');
const settingsService = require('./services/settingsService.js');
const { fullContext } = require('./services/contextService.js');
const { getRefreshIntervalMs } = require('./services/refreshService.js');

const routes = {
    homepage: templatePath('homepage'),
    statistics: templatePath('app-statistics'),
    details: templatePath('app-details'),
    welfare: templatePath('system-welfare'),
    settings: templatePath('settings'),
    themes: templatePath('themes'),
};

// Track callbacks to prevent memory leaks
let maximizedCallback = null;
let unmaximizedCallback = null;

contextBridge.exposeInMainWorld('api', {
    renderPage: async (pageName, contextData = {}) => {
        const templatePath = routes[pageName];
        const context = fullContext(pageName, contextData);

        return new Promise((resolve, reject) => {
            Twig.renderFile(templatePath, context, (err, html) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(html);
                }
            });
        });
    },

    getReport: async () => {
        return await callBackend(0, {});
    },

    // Settings API
    settings: {
        get: (key) => settingsService.get(key),
        set: (key, value) => settingsService.set(key, value),
        getAll: () => settingsService.getAll(),
        reset: () => settingsService.reset()
    },

    // Window control API
    window: {
        minimize: () => ipcRenderer.send('window-minimize'),
        maximize: () => ipcRenderer.send('window-maximize'),
        close: () => ipcRenderer.send('window-close'),
        
        onMaximized: (callback) => {
            if (maximizedCallback) {
                ipcRenderer.off('window-maximized', maximizedCallback);
            }

            maximizedCallback = callback;
            ipcRenderer.on('window-maximized', maximizedCallback);
        },
        
        onUnmaximized: (callback) => {
            if (unmaximizedCallback) {
                ipcRenderer.off('window-unmaximized', unmaximizedCallback);
            }

            unmaximizedCallback = callback;
            ipcRenderer.on('window-unmaximized', unmaximizedCallback);
        }
    },

    dialog: {
        showFolderDialog: (defaultPath) => ipcRenderer.invoke('show-folder-dialog', defaultPath)
    },

    openPage: (pageURL) => {
        shell.openExternal(pageURL);
    },

    getInterval: () => {
        return getRefreshIntervalMs();
    },
});

window.addEventListener('beforeunload', () => {
    if (maximizedCallback) {
        ipcRenderer.off('window-maximized', maximizedCallback);
        maximizedCallback = null;
    }
    
    if (unmaximizedCallback) {
        ipcRenderer.off('window-unmaximized', unmaximizedCallback);
        unmaximizedCallback = null;
    }
});
