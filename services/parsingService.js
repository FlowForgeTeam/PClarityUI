// Service for parsing data recieved from service
// Data comes to service as js-objects
// and leaves as js-objects that can be simply displayed
const fs = require('fs');
const path = require('path');
const { processParams } = require('../renderer/config/monitored_programms_config.js');

// Path to process icons folder - adjust this to match your setup
const PROCESS_ICONS_PATH = path.join(process.cwd(), 'Process_icons');
const { ICON_PATH, ICON_EXTENSION } = require('./constants.js');

const homepageMandatoryParamNames = ['Icon', 'Name', 'Title', 'RAM', 'CPU', 'Tracked for', 'System Start'];
const statisticsMandatoryParamNames = ['Icon', 'Name', 'Title', 'Tracked for', 'RAM', 'CPU', 'Active']
const detailsMandatoryParamNames = ['Icon', 'Name', 'Title', 'Path', 'Tracked for', 'RAM', 'PID', 'PPID', 'Threads', 'Priority', 'Base Priority', 'Affinity (Process)', 'Affinity (System)', 'CPU', 'Tracked', 'Active', 'Updated'];

function parseReport(report, paramNames = [], pageName = 'homepage', contextData = {}) {

    const reportComponents = ['tracked', 'currently_active', 'apps'];

    let allParamNames;
    if (pageName === 'details') {
        allParamNames = [...detailsMandatoryParamNames, ...paramNames];
    } else if (pageName === 'statistics') {
        allParamNames = [...statisticsMandatoryParamNames, ...paramNames];
    } else {
        allParamNames = [...homepageMandatoryParamNames, ...paramNames];
    }
    
    const paramMap = {};
    processParams.forEach((param) => {
        const name = param.name;
        if (allParamNames.includes(name))
            paramMap[name] = param;
    });

    let parsedReport = [];

    reportComponents.forEach((component) => {
        const processes = report[component] || [];

        processes.forEach((process) => {
            const flat = flattenObject(process);

            const filtered = allParamNames.reduce((acc, name) => {
                if (name === 'Tracked for') {
                    if ('system_start' in process) {
                        acc[name] = calculateTrackedFor(process.system_start);
                    } else {
                        acc[name] = paramMap[name]?.placeholder || '—';
                    }
                } else if (name === 'Icon') {
                    if ('data.exe_name' in flat) {
                        acc[name] = getIconPath(flat['data.exe_name']);
                    } else {
                        paramMap[name]?.placeholder;
                    }
                } else {
                    const valueKey = paramMap[name]?.value;
                    acc[name] = flat[valueKey] ?? paramMap[name]?.placeholder ?? '—';
                }
                return acc;
            }, {});

            parsedReport.push(filtered);
        });
    });

    let appData = null;
    if (pageName === 'details' && contextData.appName && parsedReport.length > 0) {
        appData = parsedReport.find(program => 
            program.Name === contextData.appName || program.Title === contextData.appName
        );
    }
    
    return {paramMap, parsedReport, appData};
}

function getProcessIcon(executableName) {
    if (!executableName) {
        return '💿'; // Default fallback
    }

    try {
        // Remove .exe extension if present and add .ico
        const iconName = executableName.replace(/\.exe$/i, '') + '.ico';
        const iconPath = path.join(PROCESS_ICONS_PATH, iconName);
        
        if (fs.existsSync(iconPath)) {
            // Return relative path for web use
            return `../Process_icons/${iconName}`;
        }
        
        // Fallback to emoji if no icon file found
        return '💿';
    } catch (error) {
        console.error('Error checking for process icon:', error);
        return '💿';
    }
}

function flattenObject(obj, parentKey = '', result = {}) {
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;

        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        const value = obj[key];

        if (typeof value === 'object' && value !== null) {
            flattenObject(value, fullKey, result);
        } else {
            result[fullKey] = value;
        }
    }
    return result;
}

function calculateTrackedFor(startTime) {
    const currentTime = Date.now();
    const startTimeMs = startTime * 1000;
    const diffMs = currentTime - startTimeMs;

    if (diffMs < 0) return 'Just launched';

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
}


function getIconPath(exeName) {
    return `${ICON_PATH}${exeName}${ICON_EXTENSION}`;
}

module.exports = { parseReport }