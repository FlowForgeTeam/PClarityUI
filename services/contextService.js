// Service for loading configuration context data
// Later hardcoded tableHeaders must be replaced
// with value taken from user configuration

const { sidebarNavItems, sidebarFooterItems } = require('../renderer/config/sidebar_config.js');
const { headerConfig } = require('../renderer/config/header_config.js');
// const { themesConfig } = require('../renderer/config/themes_config.js');
const { appearanceConfig, themesConfig } = require('../renderer/config/appearance_config.js');
const { parametersSettings } = require('../renderer/config/param_settings_config.js');
const { parseReport } = require('./parsingService');

const reportProperty = 'monitoredPrograms';

function fullContext (pageName, contextData = {}) {
    if (contextData.hasOwnProperty(reportProperty)) {
        const {paramMap, parsedReport, appData} = parseReport(
            contextData[reportProperty],
            [],
            pageName,
            contextData
        );
        contextData = {
            ...contextData,
            tableHeaders: paramMap,
            monitoredProgramsReport: parsedReport,
            ...(appData && { appData })
        };
    }

    return {
        ...contextData,
        navItems: sidebarNavItems,
        footerItems: sidebarFooterItems,
        header: headerConfig[pageName],
        appearance: appearanceConfig,
        parametersSettings,
        colorThemes: appearanceConfig.themes,        // redundant, but for backwards compatibility
        fontFamilies: appearanceConfig.fontFamilies, // redundant
        textSizes: appearanceConfig.textSizes,       // redundant
        sidebarExpanded: true,
    };
}

module.exports = { fullContext }
