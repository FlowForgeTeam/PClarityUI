import { initializeTitlebar } from './titlebar.js';
import appearanceManager from './appearanceManager.js';

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
        
        if (pageName === 'homepage') {
            const report = await window.api.getReport();
            let programsData = {
                monitoredPrograms: report,
            }
            console.log(report);
            contextData = {...contextData, ...programsData};
        }
        
        const html = await api.renderPage(pageName, contextData);
        document.getElementById('content').innerHTML = html;

        initializeTitlebar();

        if (pageName === 'themes'){
            appearanceManager.bindAppearanceEvents();
        }

        if (pageName === 'settings') {
            bindSettingsEvents();
        }

    } catch (error) {
        console.error('Error loading page:', error);
    }

    bindSidebarEvents();
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


function bindSettingsEvents() {
    console.log('Binding settings events...');

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

    // Settings toggles and inputs will be added here later
    const settingsInputs = document.querySelectorAll('[data-setting]');
    
    settingsInputs.forEach(input => {
        const settingKey = input.getAttribute('data-setting');
        
        if (input.type === 'checkbox') {
            input.addEventListener('change', async (event) => {
                const value = event.target.checked;
                await window.api.settings.set(settingKey, value);
                console.log(`Setting ${settingKey} set to:`, value);
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