import { initializeTitlebar } from './titlebar.js';

async function initializeApp() {
    try {
        //const settings = await window.api.settings.getAll();

        //document.documentElement.setAttribute('data-color-theme', settings.theme);
        //document.documentElement.setAttribute('data-font-size', settings.fontSize);
        
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
            bindThemesEvents();
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


function bindThemesEvents () {
    highlightCurrentTheme();
    const themeOptions = document.querySelectorAll('.theme');
    themeOptions.forEach((theme) => {
        theme.addEventListener('click', async (event) => {
            let appliedTheme = document.querySelector('.theme.applied');
            appliedTheme.classList.remove('applied');

            const themeToApply = event.currentTarget.id;

            document.querySelector('html').setAttribute("data-color-theme", themeToApply);
            
            // Saving the selected theme to settings
            // await window.api.settings.set('theme', themeToApply);
            
            highlightCurrentTheme();
        });
    });
}

function bindSettingsEvents() {
    // Example event handlers for the settings page
    const settingsInputs = document.querySelectorAll('[data-setting]');
    
    settingsInputs.forEach(input => {
        input.addEventListener('change', async (event) => {
            const settingKey = event.target.getAttribute('data-setting');
            const value = event.target.type === 'checkbox' ? 
                event.target.checked : event.target.value;

            // Saving the settings
            await window.api.settings.set(settingKey, value);
            
            if (settingKey === 'fontSize') {
                document.documentElement.setAttribute('data-font-size', value);
            }
        });
    });

    // Reset settings button
    const resetButton = document.querySelector('#reset-settings');
    if (resetButton) {
        resetButton.addEventListener('click', async () => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
                await window.api.settings.reset();
                location.reload();
            }
        });
    }
}

function highlightCurrentTheme () {
    const appliedTheme = document.documentElement.getAttribute('data-color-theme');
    const themeDiv = document.getElementById(appliedTheme);

    if (themeDiv) {
        themeDiv.classList.add('applied');
    }
}

initializeApp();

export default loadPage;