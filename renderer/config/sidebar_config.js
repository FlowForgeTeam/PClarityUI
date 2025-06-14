const sidebarNavItems = [
    { icon: 'home', label: 'Home', pageName: 'homepage', isActive: true },
    { icon: 'bar-chart', label: 'App statistics', pageName: 'statistics' },
    { icon: 'pie-chart', label: 'System welfare', pageName: 'welfare' },
];

const sidebarFooterItems = [
    { icon: "help", label: "Help", pageName: "homepage" },
    { icon: "color-swatch", label: "Themes", pageName: "themes" },
    { icon: "settings", label: "Settings", pageName: "settings" }
];

module.exports = { sidebarNavItems, sidebarFooterItems };