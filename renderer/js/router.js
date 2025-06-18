async function loadPage(pageName, contextData = {}) {
    try {
        const html = await api.renderPage(pageName, contextData);
        document.getElementById('content').innerHTML = html;
        
        if (pageName === 'homepage') {
            const report = await window.api.getReport();
            console.log(report);
        } else if (pageName === 'themes'){
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
    const themeOptions = document.querySelectorAll('.theme');
    themeOptions.forEach((theme) => {
        theme.addEventListener('click', async (event) => {
            let appliedTheme = document.querySelector('.theme.applied');
            appliedTheme.classList.remove('applied');

            const themeToApply = event.currentTarget.id;

            document.querySelector('html').setAttribute("data-color-theme", themeToApply);
            
            document.getElementById(themeToApply).classList.add('applied');
        });
    });
}

loadPage('homepage');

export default loadPage;