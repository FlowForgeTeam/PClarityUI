const { contextBridge, ipcRenderer } = require('electron');

const Twig = require('twig');

const { sidebarNavItems, sidebarFooterItems } = require('./renderer/config/sidebar_config.js');
const { headerConfig } = require('./renderer/config/header_config.js');
const { themesConfig } = require('./renderer/config/themes_config.js');
const { tableHeaders } = require('./renderer/config/monitored_programms_config.js');

const { templatePath } = require('./renderer/js/utils.js');
const { callBackend } = require('./services/backendService.js');
//const settingsService = require('./services/settingsService.js');

const routes = {
    homepage: templatePath('homepage'),
    statistics: templatePath('app-statistics'),
    details: templatePath('app-details'),
    welfare: templatePath('system-welfare'),
    settings: templatePath('settings'),
    themes: templatePath('themes'),
};

contextBridge.exposeInMainWorld('api', {
    renderPage: async (pageName, contextData = {}) => {
        const templatePath = routes[pageName];

        const fullContext = {
            ...contextData,
            navItems: sidebarNavItems,
            footerItems: sidebarFooterItems,
            header: headerConfig[pageName],
            colorThemes: themesConfig,
            tableHeaders: tableHeaders,
            sidebarExpanded: true,
        }

        return new Promise((resolve, reject) => {
            Twig.renderFile(templatePath, fullContext, (err, html) => {
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
    // settings: {
    //     get: (key) => settingsService.get(key),
    //     set: (key, value) => settingsService.set(key, value),
    //     getAll: () => settingsService.getAll(),
    //     reset: () => settingsService.reset()
    // },

    // Window control API
    window: {
        minimize: () => ipcRenderer.send('window-minimize'),
        maximize: () => ipcRenderer.send('window-maximize'),
        close: () => ipcRenderer.send('window-close'),
        onMaximized: (callback) => ipcRenderer.on('window-maximized', callback),
        onUnmaximized: (callback) => ipcRenderer.on('window-unmaximized', callback)
    }
});
