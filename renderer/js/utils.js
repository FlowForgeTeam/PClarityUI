const path = require('path');
const PATH_TO_TEMPLATES = path.join(__dirname, '../templates/pages/');
const TEMPLATE_EXTENSION = '.twig';

const templatePath = (templateName) => `${PATH_TO_TEMPLATES}${templateName}${TEMPLATE_EXTENSION}`;

const PATH_TO_ICONS = '../../assets/icons/';
const ICONS_EXTENSION = ".svg";

const iconPath = (iconName) => `${PATH_TO_ICONS}${iconName}-icon${ICONS_EXTENSION}`;

module.exports = {
    templatePath,
    iconPath
};