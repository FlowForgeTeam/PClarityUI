const appearanceConfig = {
    themes: [
        // Dark Themes
        { name: 'default', theme_tag: 'Rich Purple' },
        { name: 'grey-purple', theme_tag: 'Cyberpunk Neon' },
        { name: 'black-pink', theme_tag: 'Black Pink' },
        { name: 'grey-pink', theme_tag: 'Vintage Pink' },
        { name: 'dark-blue-cyan', theme_tag: 'Midnight Ocean' },
        { name: 'dark-green', theme_tag: 'Forest Night' },
        { name: 'black-neon-green', theme_tag: 'Terminal Green' },
        { name: 'black-orange', theme_tag: 'Volcanic Ash' },
        { name: 'dark-red', theme_tag: 'Rose Pine' },
        
        // Light Themes
        { name: 'light-purple', theme_tag: 'Lavender Dream' },
        { name: 'light-pink', theme_tag: 'Sakura Light' },
        { name: 'light-indigo', theme_tag: 'Sky High' },
        { name: 'white-blue', theme_tag: 'Cloud Nine' },
        { name: 'light-teal', theme_tag: 'Tropical Lagoon' },
        { name: 'light-green', theme_tag: 'Mint Fresh' },
        { name: 'light-yellow', theme_tag: 'Lemon Zest' },
        { name: 'light-orange', theme_tag: 'Sunset Glow' },
        { name: 'light-red', theme_tag: 'Rose Garden' },
    ],

    fontFamilies: [
        { value: 'inter', label: 'Inter (Default)', loadUrl: null }, // Already loaded
        { value: 'roboto', label: 'Roboto', loadUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap' },
        { value: 'open-sans', label: 'Open Sans', loadUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap' },
        { value: 'poppins', label: 'Poppins', loadUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap' },
        { value: 'source-sans', label: 'Source Sans Pro', loadUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap' }
    ],

    textSizes: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium (Default)' },
        { value: 'large', label: 'Large' }
    ]
};

module.exports = { appearanceConfig };

// For backwards compatibility, also export just themes
const themesConfig = appearanceConfig.themes;
module.exports.themesConfig = themesConfig;