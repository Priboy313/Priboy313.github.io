(function() {

    const floatingWindow = document.createElement('div');
    floatingWindow.className = 'custom-floating-window';
    floatingWindow.innerHTML = `
        <div class="custom-header">
            <span>PMS Orders Custom Filters</span>
            <span class="custom-close-btn">&times;</span>
        </div>
        <div class="custom-content">

            <div class="custom-filter">
                <input type="button" value="READ ORDERS TABLE" id="orders_read_table">
            </div>
            
            <div class="custom-filter">
                <label for="order_margin order_margin_accept">Hide Margin > </label>
                <input type="number" name="order_margin" value="15" id="order_margin"><span>%  </span>
                <input type="button" value="Accept" id="order_margin_accept">
            </div>
            
        </div>
    `;

    document.body.appendChild(floatingWindow);

    // Функции управления
    const showWindow = () => {
        floatingWindow.style.display = 'block';
    };

    const hideWindow = () => {
        floatingWindow.style.display = 'none';
    };

    // Вешаем обработчики после создания элементов
    const initEventListeners = () => {
        // Для клавиатурных событий
        document.addEventListener('keydown', handleKeyPress);

        // Для кликов
        floatingWindow.querySelector('.custom-close-btn').addEventListener('click', hideWindow);
    };

    // Обработчик клавиш с проверкой фокуса
    const handleKeyPress = (e) => {
        // Проверяем, что не в поле ввода
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

        // Вызов окна фильтров
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyL') {
            e.preventDefault();
            showWindow();
        }
    };

    initEventListeners();

    // Защита от конфликтов
    floatingWindow.addEventListener('click', (e) => e.stopPropagation());
})();