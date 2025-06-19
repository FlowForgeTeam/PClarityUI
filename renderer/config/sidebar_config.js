const { iconPath } = require('../js/utils.js');

const sidebarNavItems = [
    { icon: iconPath('home'), label: 'Home', pageName: 'homepage', isActive: true },
    { icon: iconPath('bar-chart'), label: 'App statistics', pageName: 'statistics' },
];

const sidebarFooterItems = [
    { icon: iconPath("help"), label: "Help", pageName: "homepage" },
    { icon: iconPath("color-swatch"), label: "Themes", pageName: "themes" },
    { icon: iconPath("settings"), label: "Settings", pageName: "settings" }
];

module.exports = { sidebarNavItems, sidebarFooterItems };