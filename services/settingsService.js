const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// For debug - use current working directory, later can be changed to app.getPath('userData')
// const SETTINGS_PATH = path.join(app.getPath('userData'), 'PClarityUI', 'settings.json');
const SETTINGS_PATH = path.join(process.cwd(), 'pclarity-settings.json');

const DEFAULT_SETTINGS = {
    appearance: {
        theme: 'default',
        fontFamily: 'inter',
        textSize: 'medium', // small, medium, large

        language: 'en',
        sidebarPosition: 'left', // left, right, bottom, top
        sidebarExpanded: true,
        cardStyle: 'default', // default, compact, minimal
        animations: true,
        compactMode: false
    },
    monitoring: {
        logFolder: path.join(process.cwd(), 'logs'),
        autoStart: true,
        refreshInterval: 10,           // seconds
        showInactiveApps: true,
        gpuTracking: true,
        cpuTracking: true,
        ramTracking: true,
        autoTrackNewApps: true,
    },
    notifications: {
        enabled: true,
        sound: true
    },
};

class SettingsService {
    constructor() {
        this.settings = this.loadSettings();
        console.log('SettingsService initialized with path:', SETTINGS_PATH);
    }

    loadSettings() {
        try {
            if (fs.existsSync(SETTINGS_PATH)) {
                console.log('Loading existing settings from:', SETTINGS_PATH);
                const data = fs.readFileSync(SETTINGS_PATH, 'utf8');
                const loadedSettings = JSON.parse(data);
                // Merge with defaults to ensure all fields are present
                const merged = this.mergeSettings(DEFAULT_SETTINGS, loadedSettings);
                console.log('Settings loaded successfully:', merged);
                return merged;
            } else {
                console.log('No existing settings found, creating default settings');
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        
        // Create default settings file
        this.saveSettings(DEFAULT_SETTINGS);
        return { ...DEFAULT_SETTINGS };
    }

    saveSettings(settings = this.settings) {
        try {
            const dir = path.dirname(SETTINGS_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
            this.settings = settings;
            console.log('Settings saved successfully to:', SETTINGS_PATH);
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    getAll() {
        return { ...this.settings };
    }

    get(key) {
        if (!key) return { ...this.settings };
        
        const keys = key.split('.');
        let value = this.settings;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Setting key not found: ${key}`);
                return undefined;
            }
        }
        
        return value;
    }

    set(key, value) {
        if (!key) return false;
        
        const keys = key.split('.');
        let current = this.settings;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in current) || typeof current[k] !== 'object') {
                current[k] = {};
            }
            current = current[k];
        }
        
        const lastKey = keys[keys.length - 1];
        current[lastKey] = value;
        
        console.log(`Setting ${key} = ${value}`);
        return this.saveSettings();
    }

    reset() {
        console.log('Resetting settings to defaults');
        this.settings = { ...DEFAULT_SETTINGS };
        return this.saveSettings();
    }

    mergeSettings(defaults, loaded) {
        const merged = { ...defaults };
        
        for (const key in loaded) {
            if (key in defaults) {
                if (typeof defaults[key] === 'object' && !Array.isArray(defaults[key]) && defaults[key] !== null) {
                    merged[key] = this.mergeSettings(defaults[key], loaded[key]);
                } else {
                    merged[key] = loaded[key];
                }
            } else {
                // Keep unknown settings for backwards compatibility
                merged[key] = loaded[key];
            }
        }
        
        return merged;
    }

    getAppearanceSettings() {
        return this.get('appearance') || {};
    }

    getMonitoringSettings() {
        return this.get('monitoring') || {};
    }

    getNotificationSettings() {
        return this.get('notifications') || {};
    }
}

const settingsService = new SettingsService();

module.exports = settingsService;