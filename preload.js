const { contextBridge } = require('electron');

const Twig = require('twig');
const path = require('path');
const { sidebarNavItems, sidebarFooterItems } = require('./renderer/config/sidebar_config.js');

const PATH_TO_TEMPLATES = path.join(__dirname, 'renderer/templates/pages/');
const TEMPLATE_EXTENSION = '.twig';

const templatePath = (templateName) => `${PATH_TO_TEMPLATES}${templateName}${TEMPLATE_EXTENSION}`

const routes = {
    homepage: templatePath('homepage'),
    statistics: templatePath('app-statistics'),
    details: templatePath('app-details'),
    welfare: templatePath('system-welfare'),
    settings: templatePath('settings'),
    themes: templatePath('themes'),
};

contextBridge.exposeInMainWorld('api', {
    renderPage: (pageName, contextData = {}) => {
        const templatePath = routes[pageName];

        const fullContext = {
            ...contextData,
            navItems: sidebarNavItems,
            footerItems: sidebarFooterItems,
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
    }
});
