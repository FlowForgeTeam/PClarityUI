class AppearanceManager {
    constructor() {
        this.settings = {
            theme: 'default',
            fontFamily: 'inter',
            textSize: 'medium'
        };
    }

    async applyAppearanceSetting(settingType, value) {
        const htmlElement = document.documentElement;
        
        switch (settingType) {
            case 'theme':
                htmlElement.setAttribute('data-color-theme', value);
                this.highlightCurrentTheme();
                break;
            case 'fontFamily':
                await this.applyFontFamily(value);
                break;
            case 'textSize':
                htmlElement.setAttribute('data-text-size', value);
                this.updateTextSizeDropdown();
                break;
        }

        // Save to settings (when implemented)
        // await window.api.settings.set(`appearance.${settingType}`, value);
        
        this.settings[settingType] = value;
    }

    async initializeAppearance() {
        // Load from settings when implemented
        // const settings = await window.api.settings.getAll();
        // this.settings = settings.appearance || this.settings;

        Object.entries(this.settings).forEach(([key, value]) => {
            this.applyAppearanceSetting(key, value);
        });
    }

    highlightCurrentTheme () {
        const appliedTheme = document.documentElement.getAttribute('data-color-theme');
        const themeDiv = document.getElementById(appliedTheme);

        if (themeDiv) {
            themeDiv.classList.add('applied');
        }
    }

    async loadFont(fontConfig) {
        if (fontConfig.loadUrl) {
            // Check if font is already loaded
            const existingLink = document.querySelector(`link[href="${fontConfig.loadUrl}"]`);
            if (!existingLink) {
                const link = document.createElement('link');
                link.href = fontConfig.loadUrl;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
                
                // Wait for font to load
                return new Promise((resolve) => {
                    link.onload = resolve;
                    link.onerror = resolve; // Continue even if font fails to load
                });
            }
        }
    }

    async applyFontFamily(fontValue) {
        // Load font if needed (for Google Fonts)
        const fontConfig = this.getFontConfig(fontValue);
        if (fontConfig) {
            await this.loadFont(fontConfig);
        }
        
        // Apply the font
        document.documentElement.setAttribute('data-font-family', fontValue);
        this.updateFontDropdown();
    }

    getFontConfig(fontValue) {
        // This would need access to appearanceConfig
        // For now, hardcode the configs or pass them to the constructor
        const fontConfigs = {
            'roboto': { loadUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap' },
            'open-sans': { loadUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap' },
            'poppins': { loadUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap' },
            'source-sans': { loadUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap' }
        };
        return fontConfigs[fontValue];
    }

    updateFontDropdown() {
        const dropdown = document.getElementById('font-family-select');
        if (dropdown) {
            dropdown.value = this.settings.fontFamily;
        }
    }

    updateTextSizeDropdown() {
        const dropdown = document.getElementById('text-size-select');
        if (dropdown) {
            dropdown.value = this.settings.textSize;
        }
    }

    bindAppearanceEvents() {
        this.bindThemeEvents();
        this.bindFontEvents();
        this.bindTextSizeEvents();
    }

    bindThemeEvents() {
        const themeOptions = document.querySelectorAll('.theme');
        themeOptions.forEach((theme) => {
            theme.addEventListener('click', (event) => {
                const themeId = event.currentTarget.id;
                this.applyAppearanceSetting('theme', themeId);
            });
        });
    }

    bindFontEvents() {
        const fontSelect = document.getElementById('font-family-select');
        if (fontSelect) {
            fontSelect.addEventListener('change', async (event) => {
                await this.applyAppearanceSetting('fontFamily', event.target.value);
            });
        }
    }

    bindTextSizeEvents() {
        const textSizeSelect = document.getElementById('text-size-select');
        if (textSizeSelect) {
            textSizeSelect.addEventListener('change', (event) => {
                this.applyAppearanceSetting('textSize', event.target.value);
            });
        }
    }
}

// Export singleton instance
const appearanceManager = new AppearanceManager();
export default appearanceManager;