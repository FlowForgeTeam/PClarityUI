const { contextBridge } = require('electron');

const Twig = require('twig');

const { sidebarNavItems, sidebarFooterItems } = require('./renderer/config/sidebar_config.js');
const { headerConfig } = require('./renderer/config/header_config.js');
const { themesConfig } = require('./renderer/config/themes_config.js');

const { templatePath } = require('./renderer/js/utils.js');
const { callBackend } = require('./services/backendService.js');

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
    }
});
