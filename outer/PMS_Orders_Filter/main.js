(function() {

    const floatingWindow = document.createElement('div');
    floatingWindow.className = 'custom-floating-window';
    floatingWindow.innerHTML = `
        <div class="custom-header">
            <span>PMS FBA Orders Custom Filters</span>
            <span class="custom-close-btn">&times;</span>
        </div>
        <div class="custom-content">

            <div class="custom-filter custom-filter-header">
                <span id="orders-read-header" class="custom-filter-header-label red-label">ORDERS NOT READED</span>
            </div>

            <div class="custom-filter">
                <input type="button" value="READ ORDERS TABLE" 
                id="orders_read_table" class="custom-filter-oneline-button">
            </div>

            <div class="custom-filter">
                <input type="button" value="Calculate Sales per SKUs" id="orders_calculate_sku" class="custom-filter-oneline-button">
            </div>
            
            <div class="custom-filter bordered">
                <form class="filter-grid">
                    <div class="grid-row">
                        <label for="order_margin" class="grid-label">Hide Margin ></label>
                        <div class="input-group">
                            <input type="number" name="order_margin" value="15" 
                                   id="order_margin" class="margin_input">
                            <span class="percent">%</span>
                        </div>
                        <input type="button" value="Apply" 
                               id="order_margin_apply" class="grid-button">
                    </div>
                    
                    <div class="grid-row">
                        <label for="order_overmargin" class="grid-label">Keep Margin ></label>
                        <div class="input-group">
                            <input type="number" name="order_margin" value="50" 
                                   id="order_overmargin" class="margin_input">
                            <span class="percent">%</span>
                        </div>
                        <div class="checkbox-wrapper">
                            <input type="checkbox" checked="true" 
                                   id="order_overmargin_apply" class="grid-checkbox">
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(floatingWindow);

    // Функции управления
    const toggleCustomElements = (enable = false) => {
        const container = document.querySelector('.custom-content');
        const elementsToToggle = Array.from(container.children).slice(2);
        
        elementsToToggle.forEach(el => {
            if(enable) {
                el.classList.remove('disabled');
                el.querySelectorAll('input, button').forEach(input => {
                    input.disabled = false;
                });
            } else {
                el.classList.add('disabled');
                el.querySelectorAll('input, button').forEach(input => {
                    input.disabled = true;
                });
            }
        });
    };

    const toggleCustomFiltersHeader = (enable = false, orders_len = 0) => {
        const header = document.querySelector('.custom-filter-header')
        const label = header.querySelector('#orders-read-header');

        if(enable) {
            label.classList.remove('red-label');
            label.classList.add('green-label');
            label.innerHTML = `${orders_len} ORDERS READED`;
        } else {
            label.classList.remove('green-label');
            label.classList.add('red-label');
            label.innerHTML = 'ORDERS NOT READED';
        }
    }

    const showWindow = () => {
        floatingWindow.style.display = 'block';
    };

    const hideWindow = () => {
        floatingWindow.style.display = 'none';
    };


    const initEventListeners = () => {
        document.addEventListener('keydown', handleKeyPress);

        toggleCustomElements(false);

        document.getElementById('orders_read_table').addEventListener('click', async () => {
            try {
                toggleCustomElements(true);
                toggleCustomFiltersHeader(true);
                
            } catch (error) {
                console.error('Error loading orders:', error);
            }
        });

        floatingWindow.querySelector('.custom-close-btn').addEventListener('click', hideWindow);
    };

    const handleKeyPress = (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

        if (e.ctrlKey && e.shiftKey && e.code === 'KeyL') {
            e.preventDefault();
            showWindow();
        }
    };

    initEventListeners();

    floatingWindow.addEventListener('click', (e) => e.stopPropagation());
})();