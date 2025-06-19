// Ініціалізація titlebar
function initializeTitlebar() {
    const minimizeButton = document.getElementById('minimize-button');
    const maximizeButton = document.getElementById('maximize-button');
    const closeButton = document.getElementById('close-button');
    const titlebarDragArea = document.querySelector('.titlebar-drag-area');

    minimizeButton?.addEventListener('click', () => {
        console.log('Minimize button clicked');
        window.api.window.minimize();
    });

    maximizeButton?.addEventListener('click', () => {
        console.log('Maximize button clicked');
        window.api.window.maximize();
    });

    closeButton?.addEventListener('click', () => {
        console.log('Close button clicked');
        window.api.window.close();
    });

    titlebarDragArea?.addEventListener('dblclick', () => {
        console.log('Titlebar double-clicked');
        window.api.window.maximize();
    });

    const updateMaximizeIcon = (isMaximized) => {
        const maximizeIcon = document.querySelector('.maximize-icon');
        const unmaximizeIcon = document.querySelector('.unmaximize-icon');
        
        if (isMaximized) {
            maximizeIcon.style.display = 'none';
            unmaximizeIcon.style.display = 'block';
            document.body.classList.add('maximized');
        } else {
            maximizeIcon.style.display = 'block';
            unmaximizeIcon.style.display = 'none';
            document.body.classList.remove('maximized');
        }
    };
    // Initial state
    window.api.window.onMaximized(() => {
        updateMaximizeIcon(true);
    });
    
    window.api.window.onUnmaximized(() => {
        updateMaximizeIcon(false);
    });
}

export { initializeTitlebar };