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

            <div class="custom-filter">
                <input type="button" value="Reset Filters" id="reset-orders-filters" class="custom-filter-oneline-button">
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

    // ====== Функции управления

    let virtualOrdersListObject = Array();

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
    };

    const createVirtualOrdersList = (tableBody) => {
        console.log('createVirtualOrdersList', tableBody);
    	
        let virtualOrder;
        let i = 0;

        Array.from(tableBody.children).forEach((childEl) => {
            i++;

            if (childEl.classList.contains('order-block-top')){
                virtualOrder = new Order(childEl, i);
            }
            else if (childEl.classList.contains('order-block-mid')){
                virtualOrder.addOorderMidRow(childEl, i);
            }
            else if (childEl.classList.contains('order-block-bottom')){
                virtualOrder.setBottomRowTableNum(i);
                virtualOrdersListObject.push(virtualOrder);
            }
        });

        console.log('virtualOrdersListObject', virtualOrdersListObject);
    }
    

    class Order {
    	constructor(topRow, tableNum) {
    		this.orderNum = topRow.querySelector('.table-order').querySelector('a').textContent.replace('\n', '');
    		this.owner = topRow.querySelector('.green').innerHTML;
            // this.date = date;
            this.SKU = "";
            this.margin = 0;
            this.tableNum = tableNum;
            this.bottomRowTableNum = 0;
    	}

        orderMidRowsList = Array();

        addOorderMidRow(midRow, tableNum){
            this.orderMidRowsList.push(new OrderMidRow(midRow, tableNum));
            this.calcOrderMargin();
            this.SKU = this.orderMidRowsList[0].SKU;
        }

        setSKU(SKU){
            this.SKU = SKU;
        }

        setBottomRowTableNum(bottomRowTableNum){
            this.bottomRowTableNum = bottomRowTableNum;
        }

        calcOrderMargin(){
            let midRowsMarginList = Array();
            this.orderMidRowsList.forEach((midRow) => {
                midRowsMarginList.push(midRow.margin);
            });

            this.margin = midRowsMarginList.reduce((sum, value) => sum + value, 0) / midRowsMarginList.length;
        }
    	
    }

    class OrderMidRow {
        constructor(midRow, tableNum) {
            this.midRow = midRow;
            this.tableNum = tableNum;
            this.SKU = "";

            this.cost = 0;
            this.price = 0;
            this.qty = 0;
            this.fee = 0;
            this.margin = 0;
            this.profit = 0;

            this.setValues();
        }

        setValues(){
            this.SKU    = this.midRow.querySelector('.col1').querySelector('a').textContent.replace('\n', '');
            this.cost   = parseFloat(this.midRow.querySelector('.col3').innerHTML.split('(')[1].split(')')[0]);
            this.price  = parseFloat(this.midRow.querySelector('.col4').innerHTML.replace('$', ''));
            this.qty    = parseFloat(this.midRow.querySelector('.col7').querySelector('b').innerHTML);
            this.fee    = parseFloat(this.midRow.querySelector('.fee').querySelector('b').innerHTML.replace('$', '').replace('−', ''));
            this.fee    = this.fee * -1;
            this.margin = parseFloat(this.midRow.querySelectorAll('.col9')[1].querySelector('span').innerHTML.replace('%', ''));
            this.profit = parseFloat(this.midRow.querySelectorAll('.col9')[2].querySelector('b').innerHTML.replace('$', ''));
        }
    }       

    const scrapOrders = () => {
        const tableHover = document.querySelector('.table-hover');
        const tableBody = tableHover.querySelector('tbody');
        const rows = Array.from(tableBody.querySelectorAll('.order-block-top'));

        console.log('scrapOrders', tableBody);
        createVirtualOrdersList(tableBody);

        return rows.length;
    };


    const applyHiddenMarginFilter = (margin=15, overmargin=50, overmarginApply=true) => {

    };

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
                let ordersLenght = scrapOrders();
                toggleCustomFiltersHeader(true, ordersLenght);
                toggleCustomElements(true);
                
            } catch (error) {
                console.error('Error loading orders:', error);
            }
        });

        document.getElementById('order_margin_apply').addEventListener('click', () => {
            const margin = parseFloat(document.getElementById('order_margin').value);
            const overmargin = parseFloat(document.getElementById('order_overmargin').value);
            const overmarginApply = document.getElementById('order_overmargin_apply').checked;

            applyHiddenMarginFilter(margin, overmargin, overmarginApply);
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