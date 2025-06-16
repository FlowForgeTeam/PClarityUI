async function loadPage(pageName, contextData = {}) {
    try {
        const html = await api.renderPage(pageName, contextData);
        document.getElementById('content').innerHTML = html;
    } catch (error) {
        console.error('Error loading page:', error);
    }

    bindSidebarEvents();
}

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

loadPage('homepage');


export default loadPage;