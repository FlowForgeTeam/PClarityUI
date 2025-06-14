async function loadPage(pageName, contextData = {}) {
    try {
        const html = await api.renderPage(pageName, contextData);
        document.getElementById('content').innerHTML = html;
    } catch (error) {
        console.error('Error loading page:', error);
    }
}

loadPage('homepage');

export default loadPage;