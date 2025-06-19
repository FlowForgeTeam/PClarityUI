// Service for loading configuration context data
// Later hardcoded tableHeaders must be replaced
// with value taken from user configuration

const { sidebarNavItems, sidebarFooterItems } = require('../renderer/config/sidebar_config.js');
const { headerConfig } = require('../renderer/config/header_config.js');
// const { themesConfig } = require('../renderer/config/themes_config.js');
const { appearanceConfig, themesConfig } = require('../renderer/config/appearance_config.js');
const { processParams } = require('../renderer/config/monitored_programms_config.js');

function fullContext (pageName, contextData = {}) {
    return {
        ...contextData,
        navItems: sidebarNavItems,
        footerItems: sidebarFooterItems,
        header: headerConfig[pageName],
        appearance: appearanceConfig,
        colorThemes: appearanceConfig.themes,        // redundant, but for backwards compatibility
        fontFamilies: appearanceConfig.fontFamilies, // redundant
        textSizes: appearanceConfig.textSizes,       // redundant
        tableHeaders: processParams,
        sidebarExpanded: true,
    };
}

module.exports = { fullContext }
