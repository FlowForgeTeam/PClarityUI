let titlebarListeners = [];

function initializeTitlebar() {
    cleanupTitlebarListeners();

    const minimizeButton = document.getElementById('minimize-button');
    const maximizeButton = document.getElementById('maximize-button');
    const closeButton = document.getElementById('close-button');
    const titlebarDragArea = document.querySelector('.titlebar-drag-area');

    const minimizeHandler = () => {
        console.log('Minimize button clicked');
        window.api.window.minimize();
    };

    const maximizeHandler = () => {
        console.log('Maximize button clicked');
        window.api.window.maximize();
    };

    const closeHandler = () => {
        console.log('Close button clicked');
        window.api.window.close();
    };

    const dragHandler = () => {
        console.log('Titlebar double-clicked');
        window.api.window.maximize();
    };

    if (minimizeButton) {
        minimizeButton.addEventListener('click', minimizeHandler);
        titlebarListeners.push({ element: minimizeButton, event: 'click', handler: minimizeHandler });
    }

    if (maximizeButton) {
        maximizeButton.addEventListener('click', maximizeHandler);
        titlebarListeners.push({ element: maximizeButton, event: 'click', handler: maximizeHandler });
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeHandler);
        titlebarListeners.push({ element: closeButton, event: 'click', handler: closeHandler });
    }

    if (titlebarDragArea) {
        titlebarDragArea.addEventListener('dblclick', dragHandler);
        titlebarListeners.push({ element: titlebarDragArea, event: 'dblclick', handler: dragHandler });
    }

    window.api.window.onMaximized(() => {
        updateMaximizeIcon(true);
    });
    
    window.api.window.onUnmaximized(() => {
        updateMaximizeIcon(false);
    });
}

function cleanupTitlebarListeners() {
    titlebarListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    titlebarListeners = [];
}

function updateMaximizeIcon(isMaximized) {
    const maximizeIcon = document.querySelector('.maximize-icon');
    const unmaximizeIcon = document.querySelector('.unmaximize-icon');
    
    if (maximizeIcon && unmaximizeIcon) {
        if (isMaximized) {
            maximizeIcon.style.display = 'none';
            unmaximizeIcon.style.display = 'block';
            document.body.classList.add('maximized');
        } else {
            maximizeIcon.style.display = 'block';
            unmaximizeIcon.style.display = 'none';
            document.body.classList.remove('maximized');
        }
    }
}

export { initializeTitlebar, cleanupTitlebarListeners };