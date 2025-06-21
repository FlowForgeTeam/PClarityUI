import { initializeTitlebar } from './titlebar.js';
import appearanceManager from './appearanceManager.js';

const HELP_URL = 'https://github.com/FlowForgeTeam/PClarity/blob/main/README.md';

async function initializeApp() {
    try {
        
        await appearanceManager.initializeAppearance();

        await loadPage('homepage');

        initializeTitlebar();

    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

let intervalId = null;

async function loadPage(pageName, contextData = {}) {
    try {
        
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }

        if (pageName === 'help') {
            window.api.openPage(HELP_URL);
            return;
        }
        
        if (pageName === 'homepage' || pageName === 'statistics') {

            intervalId = setInterval(() => {
                fetchRenderAndInitializePage(pageName, contextData);
            // }, window.api.getInterval());
            }, 1000);

        } else {
            renderAndInitializePage(pageName, contextData);

            if (pageName === 'themes')
                appearanceManager.bindAppearanceEvents();

            if (pageName === 'settings')
                bindSettingsEvents();
        }

        if (pageName === 'statistics') {
            bindViewModeEvents();
            bindAppCardEvents();
        }

    } catch (error) {
        console.error('Error loading page:', error);
    }
}

async function renderAndInitializePage(pageName, contextData) {
    const html = await api.renderPage(pageName, contextData);
    document.getElementById('content').innerHTML = html;

    initializeTitlebar();
    bindSidebarEvents();
}

async function fetchRenderAndInitializePage(pageName, contextData) {
    const report = await window.api.getReport();

    let programsData = {
        monitoredPrograms: report,
    };

    contextData = {...contextData, ...programsData};

    renderAndInitializePage(pageName, contextData);
}

// TODO: HERE THE EVENT BREAKS CSS TRANSITIONS (IN SIDEBAR BG CHANGE) DUE TO THE PAGE RELOAD. FIX LATER
function bindSidebarEvents () {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach((item) => {
        item.addEventListener('click', async (event) => {
            let currentItem = event.currentTarget;

            const pageToLoad = currentItem.getAttribute('data-page');
            await loadPage(pageToLoad);

            let activeItem = document.querySelector('.sidebar-item.active');
            activeItem.classList.remove('active');
            
            document.querySelector(`[data-page="${pageToLoad}"]`).classList.add('active');
        });
    });
}

// ------------- CARD EVENTS -------------

function bindViewModeEvents() {
    const viewModeInputs = document.querySelectorAll('input[name="view-mode"]');
    const statisticsContent = document.getElementById('statistics-content');
    
    if (!statisticsContent) return;
    
    viewModeInputs.forEach((input, index) => {
        input.addEventListener('change', (event) => {
            if (event.target.checked) {
                statisticsContent.classList.remove('view-mode-list', 'view-mode-grid', 'view-mode-calendar');

                switch(index) {
                    case 0: // List view
                        statisticsContent.classList.add('view-mode-list');
                        break;
                    case 1: // Grid/Cards view
                        statisticsContent.classList.add('view-mode-grid');
                        break;
                    case 2: // Calendar view
                        statisticsContent.classList.add('view-mode-calendar');
                        break;
                }
                
                console.log(`View mode changed to: ${index === 0 ? 'list' : index === 1 ? 'grid' : 'calendar'}`);
            }
        });
    });
}

function bindAppCardEvents() {
    formatCardsData();
    
    const appCards = document.querySelectorAll('.app-card');
    
    appCards.forEach(card => {
        card.addEventListener('click', async (event) => {
            const appTitle = event.currentTarget.getAttribute('data-app-title');
            if (appTitle && appTitle !== '—') {
                console.log(`App card clicked: ${appTitle}`);
                await loadPage('details', { appName: appTitle });
            }
        });
    });
}

// Could be reused in table conversions also !!!!!!!!!!!!!!!!!!!!
function formatBytes(bytes) {
    if (bytes === 0 || bytes === '0' || bytes === '—') return '0 B';
    
    const numBytes = typeof bytes === 'string' ? parseInt(bytes) : bytes;
    if (isNaN(numBytes)) return bytes;
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatCardsData() {
    const ramElements = document.querySelectorAll('.app-card .stat-item');
    
    ramElements.forEach(element => {
        const text = element.textContent;
        if (text.startsWith('RAM: ')) {
            const ramValue = text.replace('RAM: ', '');
            element.textContent = `RAM: ${formatBytes(ramValue)}`;
        }
    });
}

// ------------- SETTINGS -------------

async function loadSettingsValues() {
    try {
        const settings = await window.api.settings.getAll();
        console.log('Loading settings values:', settings);

        // Load all checkbox and input values
        const settingsInputs = document.querySelectorAll('[data-setting]');
        settingsInputs.forEach(input => {
            const settingKey = input.getAttribute('data-setting');
            const value = getNestedValue(settings, settingKey);
            
            if (input.type === 'checkbox') {
                input.checked = Boolean(value);
            } else if (input.type === 'number' || input.type === 'text') {
                input.value = value || '';
            }
        });

        // Load time unit for refresh interval
        const timeUnit = settings.monitoring?.refreshIntervalUnit || 's';
        const timeUnitButtons = document.querySelectorAll('.time-unit');
        timeUnitButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-unit') === timeUnit) {
                button.classList.add('active');
            }
        });

    } catch (error) {
        console.error('Error loading settings values:', error);
    }
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}

async function bindSettingsEvents() {
    console.log('Binding settings events...');

    // Load current settings values
    await loadSettingsValues();

    // Reset button
    const resetButton = document.querySelector('#reset-settings');
    if (resetButton) {
        resetButton.addEventListener('click', async () => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
                await window.api.settings.reset();
                await appearanceManager.initializeAppearance();
                
                await loadPage('settings');
            }
        });
    }

    // Time unit buttons
    const timeUnitButtons = document.querySelectorAll('.time-unit');
    timeUnitButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            
            // Remove active class from all buttons
            timeUnitButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Save the selected unit
            const unit = button.getAttribute('data-unit');
            await window.api.settings.set('monitoring.refreshIntervalUnit', unit);
            console.log(`Time unit set to: ${unit}`);
        });
    });

    // Browse folder button
    const browseButton = document.querySelector('#browse-folder');
    const logFolderInput = document.querySelector('#log-folder');
    
    if (browseButton && logFolderInput) {
        browseButton.addEventListener('click', async () => {
            try {
                const currentPath = logFolderInput.value || '';
                const selectedPath = await window.api.dialog.showFolderDialog(currentPath);
                
                if (selectedPath) {
                    logFolderInput.value = selectedPath;
                    await window.api.settings.set('monitoring.logFolder', selectedPath);
                    console.log(`Log folder set to: ${selectedPath}`);
                }
            } catch (error) {
                console.error('Error selecting folder:', error);
                alert('Error selecting folder. Please try again.');
            }
        });
    }

    // Regular settings inputs (checkboxes, text inputs, etc.)
    const settingsInputs = document.querySelectorAll('[data-setting]');
    settingsInputs.forEach(input => {
        const settingKey = input.getAttribute('data-setting');
        
        if (input.type === 'checkbox') {
            input.addEventListener('change', async (event) => {
                const value = event.target.checked;
                await window.api.settings.set(settingKey, value);
                console.log(`Setting ${settingKey} set to:`, value);
            });
        } else if (input.type === 'number') {
            input.addEventListener('change', async (event) => {
                const value = parseInt(event.target.value, 10);
                if (!isNaN(value) && value > 0) {
                    await window.api.settings.set(settingKey, value);
                    console.log(`Setting ${settingKey} set to:`, value);
                }
            });
        } else {
            input.addEventListener('change', async (event) => {
                const value = event.target.value;
                await window.api.settings.set(settingKey, value);
                console.log(`Setting ${settingKey} set to:`, value);
            });
        }
    });
}

initializeApp();

export default loadPage;