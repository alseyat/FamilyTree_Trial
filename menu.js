document.addEventListener('DOMContentLoaded', function () {
    const menuIconBtn = document.getElementById('menu-icon-btn');
    const menuDropdown = document.getElementById('menu-dropdown');
    const menuContainer = document.getElementById('floating-menu-container');
    const statsBtn = document.getElementById('view-stats-btn');

    // Make sure elements exist before adding listeners (prevents errors)
    if (menuIconBtn && menuDropdown && menuContainer) {
        menuIconBtn.addEventListener('click', function (event) {
            menuDropdown.classList.toggle('show');
            event.stopPropagation(); 
        });

        document.addEventListener('click', function (event) {
            if (!menuContainer.contains(event.target)) {
                menuDropdown.classList.remove('show');
            }
        });
    }

    // Stats button navigation
    if (statsBtn) {
        statsBtn.addEventListener('click', function () {
            location.href = 'statistics.html';
        });
    }
});