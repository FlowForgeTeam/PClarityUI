async function loadPage(pageName, contextData = {}) {
    try {
        const html = await api.renderPage(pageName, contextData);
        document.getElementById('content').innerHTML = html;
    } catch (error) {
        console.error('Error loading page:', error);
    }

    bindSidebarEvents();
}

async function bindSidebarEvents () {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach((item) => {
        item.addEventListener('click', (event) => {
            let activeItem = document.querySelector('.sidebar-item.active');
            activeItem.classList.remove('active');

            let currentItem = event.currentTarget;
            currentItem.classList.add('active');

            const pageToLoad = currentItem.getAttribute('data-page');
            loadPage(pageToLoad);
        });
    });
}

loadPage('homepage');


export default loadPage;