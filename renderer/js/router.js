const Twig = require('twig');

const PATH_TO_TEMPLATES = './templates/pages/';
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

async function loadPage(pageName, contextData) {
    const templatePath = routes[pageName];

    Twig.renderFile(templatePath, contextData, (err, html) => {
        if (err) {
           console.log(err);
           return 
        }
        document.getElementById('app').innerHTML = html;
    });
}

export default loadPage;