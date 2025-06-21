const { settingsService } = require('./settingsService');

function getRefreshIntervalMs() {
    const monitorSettings = settingsService.getMonitoringSettings();
    console.log("MONITTORING SETTINGS", monitorSettings);
    const unitMultipliers  = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    const intervalUnit = monitorSettings.refreshIntervalUnit;
    const multiplier = unitMultipliers[intervalUnit];

    if (!multiplier)
        throw new Error(`Unknown time unit: ${monitorSettings.refreshIntervalUnit}`);

    return monitorSettings.refreshIntervalUnit * multiplier;
}

module.exports = { getRefreshIntervalMs };