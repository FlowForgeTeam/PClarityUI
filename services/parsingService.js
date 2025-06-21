// Service for parsing data recieved from service
// Data comes to service as js-objects
// and leaves as js-objects that can be simply displayed
const { processParams } = require('../renderer/config/monitored_programms_config.js');

const homepageMandatoryParamNames = ['Icon', 'Name', 'Title', 'RAM', 'CPU'];
const statisticsMandatoryParamNames = ['Icon', 'Name', 'Title', 'Active for', 'RAM', 'CPU', 'Active']
const detailsMandatoryParamNames = ['Icon', 'Name', 'Title', 'Path', 'Active for', 'RAM', 'PID', 'PPID', 'Threads', 'Priority', 'Base Priority', 'Affinity (Process)', 'Affinity (System)', 'CPU', 'Tracked', 'Active', 'Updated'];

function parseReport(report, paramNames = [], pageName = 'homepage', contextData = {}) {

    const reportComponents = ['tracked', 'currently_active'];

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
                acc[name] = flat[paramMap[name].value] || paramMap[name].placeholder;
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

module.exports = { parseReport }