import { initializeTitlebar, cleanupTitlebarListeners } from './titlebar.js';
import appearanceManager from './appearanceManager.js';

const HELP_URL = 'https://github.com/FlowForgeTeam/PClarity/blob/main/README.md';

let intervalId = null;
let currentPage = null;
let sidebarListeners = [];
let viewModeListeners = [];
let cardListeners = [];
let settingsListeners = [];

async function initializeApp() {
    try {
        await appearanceManager.initializeAppearance();
        await loadPage('homepage');
        initializeTitlebar();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

async function loadPage(pageName, contextData = {}) {
    try {
        
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }

        cleanupEventListeners();

        if (pageName === 'help') {
            window.api.openPage(HELP_URL);
            bindSidebarEvents();
            return;
        }

        currentPage = pageName;
        
        if (pageName === 'homepage' || pageName === 'statistics') {
            if (pageName === 'homepage') {
                try {
                    const dashboardData = await window.api.getDashboardData();
                    contextData.dashboardData = dashboardData;
                } catch (error) {
                    console.error('Error loading dashboard data:', error);
                    // Continue without dashboard data
                }
            }
            
            // Initial load
            await fetchRenderAndInitializePage(pageName, contextData);
            
            // Set up interval for updates
            intervalId = setInterval(async () => {
                if (currentPage === pageName)
                    await renderTable(pageName, contextData);
            }, 2000);

        } else if (pageName === 'details') {
            await fetchRenderAndInitializePage(pageName, contextData);

        } else {
            await renderAndInitializePage(pageName, contextData);
            
            if (pageName === 'themes')
                appearanceManager.bindAppearanceEvents();
            
            if (pageName === 'settings')
                await bindSettingsEvents();
        }

        if (pageName === 'statistics') {
            bindViewModeEvents();
            bindAppCardEvents();
        }

    } catch (error) {
        console.error('Error loading page:', error);
    }
}

function cleanupEventListeners() {
    // Clean up titlebar listeners
    cleanupTitlebarListeners();

    // Clean up sidebar listeners
    sidebarListeners.forEach(({ element, handler }) => {
        element.removeEventListener('click', handler);
    });
    sidebarListeners = [];

    // Clean up view mode listeners
    viewModeListeners.forEach(({ element, handler }) => {
        element.removeEventListener('change', handler);
    });
    viewModeListeners = [];

    // Clean up card listeners
    cardListeners.forEach(({ element, handler }) => {
        element.removeEventListener('click', handler);
    });
    cardListeners = [];

    // Clean up settings listeners
    settingsListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    settingsListeners = [];
}

async function renderAndInitializePage(pageName, contextData) {
    const html = await api.renderPage(pageName, contextData);
    document.getElementById('content').innerHTML = html;

    bindSidebarEvents();
    initializeTitlebar();
}

async function fetchRenderAndInitializePage(pageName, contextData) {
    try {
        contextData = await getProgramsData(contextData);
        await renderAndInitializePage(pageName, contextData);
    } catch (error) {
        console.error('Error fetching data:', error);
        // Render page without data on error
        await renderAndInitializePage(pageName, contextData);
    }
}

async function getProgramsData(contextData) {
    const report = await window.api.getReport();
    const programsData = {
        monitoredPrograms: report,
    };
    console.log(report);
    return {...contextData, ...programsData};
}

async function renderTable(pageName, contextData) {
    console.log(`Render table for ${pageName}`);
    try {
        const wrapper = document.querySelector('.monitored-programs');
        const scrollX = wrapper ? wrapper.scrollLeft : 0;
        const scrollY = wrapper ? wrapper.scrollTop : 0;
        contextData = await getProgramsData(contextData);

        const componentName = 'programs_list';

        const html = await api.renderPage(componentName, contextData, pageName);
        document.querySelector('.monitored-programs').innerHTML = html;

        requestAnimationFrame(() => {
            const newWrapper = document.querySelector('.monitored-programs');
            if (newWrapper) {
                requestAnimationFrame(() => {
                    newWrapper.scrollLeft = scrollX;
                    newWrapper.scrollTop = scrollY;
                });
            }
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        await renderAndInitializePage(pageName, contextData);
    }
}

// TODO: HERE THE EVENT BREAKS CSS TRANSITIONS (IN SIDEBAR BG CHANGE) DUE TO THE PAGE RELOAD. FIX LATER
function bindSidebarEvents() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach((item) => {
        const handler = async (event) => {
            const currentItem = event.currentTarget;
            const pageToLoad = currentItem.getAttribute('data-page');
            
            if (pageToLoad) {
                await loadPage(pageToLoad);
                
                // Update active state
                const activeItem = document.querySelector('.sidebar-item.active');
                if (activeItem) {
                    activeItem.classList.remove('active');
                }
                
                const newActiveItem = document.querySelector(`[data-page="${pageToLoad}"]`);
                if (newActiveItem) {
                    newActiveItem.classList.add('active');
                }
            }
        };
        
        item.addEventListener('click', handler);
        sidebarListeners.push({ element: item, handler });
    });
}

// ------------- CARD EVENTS -------------

function bindViewModeEvents() {
    const viewModeInputs = document.querySelectorAll('input[name="view-mode"]');
    const statisticsContent = document.getElementById('statistics-content');
    
    if (!statisticsContent) return;
    
    viewModeInputs.forEach((input, index) => {
        const handler = (event) => {
            if (event.target.checked) {
                statisticsContent.classList.remove('view-mode-list', 'view-mode-grid', 'view-mode-calendar');

                switch(index) {
                    case 0:
                        statisticsContent.classList.add('view-mode-list');
                        break;
                    case 1:
                        statisticsContent.classList.add('view-mode-grid');
                        break;
                    case 2:
                        statisticsContent.classList.add('view-mode-calendar');
                        break;
                }
                
                console.log(`View mode changed to: ${index === 0 ? 'list' : index === 1 ? 'grid' : 'calendar'}`);
            }
        };
        
        input.addEventListener('change', handler);
        viewModeListeners.push({ element: input, handler });
    });
}

function bindAppCardEvents() {
    formatCardsData();
    
    const appCards = document.querySelectorAll('.app-card');
    
    appCards.forEach(card => {
        const handler = async (event) => {
            const appName = event.currentTarget.getAttribute('data-app-name');
            if (appName && appName !== '—') {
                console.log(`App card clicked: ${appName}`);
                await loadPage('details', { appName: appName });
            }
        };
        
        card.addEventListener('click', handler);
        cardListeners.push({ element: card, handler });
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

    await loadSettingsValues();

    // Reset button
    const resetButton = document.querySelector('#reset-settings');
    if (resetButton) {
        const resetHandler = async () => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
                await window.api.settings.reset();
                await appearanceManager.initializeAppearance();
                await loadPage('settings');
            }
        };
        
        resetButton.addEventListener('click', resetHandler);
        settingsListeners.push({ element: resetButton, event: 'click', handler: resetHandler });
    }

    // Time unit buttons
    const timeUnitButtons = document.querySelectorAll('.time-unit');
    timeUnitButtons.forEach(button => {
        const clickHandler = async (event) => {
            event.preventDefault();
            
            timeUnitButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const unit = button.getAttribute('data-unit');
            await window.api.settings.set('monitoring.refreshIntervalUnit', unit);
            console.log(`Time unit set to: ${unit}`);
        };
        
        button.addEventListener('click', clickHandler);
        settingsListeners.push({ element: button, event: 'click', handler: clickHandler });
    });

    // Browse folder button
    const browseButton = document.querySelector('#browse-folder');
    const logFolderInput = document.querySelector('#log-folder');
    
    if (browseButton && logFolderInput) {
        const browseHandler = async () => {
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
        };
        
        browseButton.addEventListener('click', browseHandler);
        settingsListeners.push({ element: browseButton, event: 'click', handler: browseHandler });
    }

    // Regular settings inputs
    const settingsInputs = document.querySelectorAll('[data-setting]');
    settingsInputs.forEach(input => {
        const settingKey = input.getAttribute('data-setting');
        
        let handler;
        let eventType;
        
        if (input.type === 'checkbox') {
            eventType = 'change';
            handler = async (event) => {
                const value = event.target.checked;
                await window.api.settings.set(settingKey, value);
                console.log(`Setting ${settingKey} set to:`, value);
            };
        } else if (input.type === 'number') {
            eventType = 'change';
            handler = async (event) => {
                const value = parseInt(event.target.value, 10);
                if (!isNaN(value) && value > 0) {
                    await window.api.settings.set(settingKey, value);
                    console.log(`Setting ${settingKey} set to:`, value);
                }
            };
        } else {
            eventType = 'change';
            handler = async (event) => {
                const value = event.target.value;
                await window.api.settings.set(settingKey, value);
                console.log(`Setting ${settingKey} set to:`, value);
            };
        }
        
        input.addEventListener(eventType, handler);
        settingsListeners.push({ element: input, event: eventType, handler });
    });
}

window.addEventListener('beforeunload', () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    cleanupEventListeners();
});

initializeApp();

export default loadPage;