let titlebarInitialized = false;


function initializeTitlebar() {
    if (titlebarInitialized) {
        return;
    }

    const minimizeButton = document.getElementById('minimize-button');
    const maximizeButton = document.getElementById('maximize-button');
    const closeButton = document.getElementById('close-button');
    const titlebarDragArea = document.querySelector('.titlebar-drag-area');

    if (minimizeButton) {
        minimizeButton.addEventListener('click', () => {
            console.log('Minimize button clicked');
            window.api.window.minimize();
        });
    }

    if (maximizeButton) {
        maximizeButton.addEventListener('click', () => {
            console.log('Maximize button clicked');
            window.api.window.maximize();
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            console.log('Close button clicked');
            window.api.window.close();
        });
    }

    if (titlebarDragArea) {
        titlebarDragArea.addEventListener('dblclick', () => {
            console.log('Titlebar double-clicked');
            window.api.window.maximize();
        });
    }

    window.api.window.onMaximized(() => {
        updateMaximizeIcon(true);
    });
    
    window.api.window.onUnmaximized(() => {
        updateMaximizeIcon(false);
    });

    titlebarInitialized = true;
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

export { initializeTitlebar };