document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const menuContainer = document.querySelector('.menu-container');

    if (menuToggle && menuContainer) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            menuContainer.classList.toggle('active');
        });

        // Закрыть меню при клике на пункт меню
        menuContainer.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                menuToggle.classList.remove('active');
                menuContainer.classList.remove('active');
            }
        });

        // Закрыть меню при клике вне меню
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.top-header')) {
                menuToggle.classList.remove('active');
                menuContainer.classList.remove('active');
            }
        });

        // Закрыть меню при изменении размера окна
        window.addEventListener('resize', function() {
            if (window.innerWidth > 900) {
                menuToggle.classList.remove('active');
                menuContainer.classList.remove('active');
            }
        });
    }
});
