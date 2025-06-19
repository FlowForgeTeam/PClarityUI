// function for parsing data recieved from service
// Data comes to service as js-objects
// and leaves as js-objects that can be simply displayed
const { processParams } = require('../renderer/config/monitored_programms_config.js');

const reportComponents = ['currently_active', 'tracked'];

function parseReport(report, paramNames = []) {
    const mandatoryParamNames = ['Icon', 'Title', 'Active for'];
    const allParamNames = [...mandatoryParamNames, ...paramNames];

    const paramMap = {};
    processParams.forEach((param) => {
        paramMap[param.name] = param;
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
    })
    
    return parsedReport;
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