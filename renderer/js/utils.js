const path = require('path');
const PATH_TO_TEMPLATE_PAGES = path.join(__dirname, '../templates/pages/');
const PATH_TO_TEMPLATE_COMPONENTS = path.join(__dirname, '../templates/components/');
const TEMPLATE_EXTENSION = '.twig';

const templatePagePath = (templateName) => `${PATH_TO_TEMPLATE_PAGES}${templateName}${TEMPLATE_EXTENSION}`;
const templateComponentPath =
   (templateName) => `${PATH_TO_TEMPLATE_COMPONENTS}_${templateName}${TEMPLATE_EXTENSION}`;

const PATH_TO_ICONS = '../../assets/icons/';
const ICONS_EXTENSION = ".svg";

const iconPath = (iconName) => `${PATH_TO_ICONS}${iconName}-icon${ICONS_EXTENSION}`;

module.exports = {
    templatePagePath,
    templateComponentPath,
    iconPath
};