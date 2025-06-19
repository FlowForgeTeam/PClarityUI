const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Шлях до файлу налаштувань в директорії користувача
// const SETTINGS_PATH = path.join(app.getPath('userData'), 'PClarityUI', 'settings.json');
const SETTINGS_PATH = path.join(process.cwd(), 'settings.json');

// Дефолтні налаштування
const DEFAULT_SETTINGS = {
    appearance: {
        theme: 'default',
        language: 'en',
        fontSize: 'medium', // small, medium, large
        font: 'Inter',
        sidebarPosition: 'left', // left, right, bottom, top
        sidebarExpanded: true,
        cardStyle: 'default', // default, compact, minimal
        animations: true,
        compactMode: false
    },
    monitoring: {
        logFolder: path.join(app.getPath('userData'), 'PClarityUI',  'logs'),
        autoStart: true,
        refreshInterval: 5000,
        showInactiveApps: true,
        gpuTracking: true,
        cpuTracking: true,
        memoryTracking: true,
    },
    notifications: {
        enabled: true,
        sound: true
    },
};

class SettingsService {
    constructor() {
        this.settings = this.loadSettings();
    }

    loadSettings() {
        try {
            if (fs.existsSync(SETTINGS_PATH)) {
                const data = fs.readFileSync(SETTINGS_PATH, 'utf8');
                const loadedSettings = JSON.parse(data);
                // Об'єднуємо з дефолтними, щоб додати нові поля при оновленні
                return this.mergeSettings(DEFAULT_SETTINGS, loadedSettings);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        
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
        const keys = key.split('.');
        let value = this.settings;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return undefined;
            }
        }
        
        return value;
    }

    set(key, value) {
        const keys = key.split('.');
        let current = this.settings;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in current) || typeof current[k] !== 'object') {
                current[k] = {};
            }
            current = current[k];
        }
        
        current[keys[keys.length - 1]] = value;
        return this.saveSettings();
    }

    reset() {
        this.settings = { ...DEFAULT_SETTINGS };
        return this.saveSettings();
    }

    mergeSettings(defaults, loaded) {
        const merged = { ...defaults };
        
        for (const key in loaded) {
            if (key in defaults) {
                if (typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
                    merged[key] = this.mergeSettings(defaults[key], loaded[key]);
                } else {
                    merged[key] = loaded[key];
                }
            } else {
                merged[key] = loaded[key];
            }
        }
        
        return merged;
    }
}

const settingsService = new SettingsService();

module.exports = settingsService;