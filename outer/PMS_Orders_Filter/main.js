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
                id="orders-read-table" class="custom-filter-oneline-button">
            </div>

            <div class="custom-filter">
                <input type="button" value="Calculate Sales per SKUs" id="orders-calculate-sku" class="custom-filter-oneline-button">
            </div>

            <div class="custom-filter">
                <input type="button" value="Reset Filters" id="reset-orders-filters" class="custom-filter-oneline-button">
            </div>
            
            <div class="custom-filter bordered-filter">
                <form class="filter-grid">
                    <div class="grid-row">
                        <label for="order-margin-thr" class="grid-label">Hide Margin &ge;</label>
                        <div class="input-group">
                            <input type="number" name="order-margin-thr" value="15" 
                                   id="order-margin-thr" class="margin-input">
                            <span class="percent">%</span>
                        </div>
                        <input type="button" value="Apply" 
                               id="order-margin-filter-apply" class="grid-button">
                    </div>
                    
                    <div class="grid-row">
                        <label for="order-overmargin" class="grid-label">Keep Margin &ge;</label>
                        <div class="input-group">
                            <input type="number" name="order-overmargin" value="50" 
                                   id="order-overmargin" class="margin-input">
                            <span class="percent">%</span>
                        </div>
                        <div class="checkbox-wrapper">
                            <input type="checkbox" checked="true" 
                                   id="order-overmargin-apply" class="grid-checkbox">
                        </div>
                    </div>

                    <div class="grid-row">
                        <label for="order-refund" class="grid-label">Keep Refund</label>
                        <div class="input-group">
                        </div>
                        <div class="checkbox-wrapper">
                            <input type="checkbox" checked="true" 
                                   id="order-refund-apply" class="grid-checkbox">
                        </div>
                    </div>

                </form>
            </div>

        </div>
    `;

    document.body.appendChild(floatingWindow);


    // ====== Функции управления ======= \\

    let virtualOrdersList = Array();

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

    const toggleCustomFiltersHeader = (enable = false, ordersLen = 0) => {
        const header = document.querySelector('.custom-filter-header')
        const label = header.querySelector('#orders-read-header');

        if(enable) {
            label.classList.remove('red-label');
            label.classList.add('green-label');
            label.innerHTML = `${ordersLen} ORDERS READED`;
        } else {
            label.classList.remove('green-label');
            label.classList.add('red-label');
            label.innerHTML = 'ORDERS NOT READED';
        }
    };

    const createVirtualOrdersList = (tableBody) => {
        let virtualOrder;

        Array.from(tableBody.children).forEach((childEl) => {
            if (childEl.classList.contains('order-block-top')){
                virtualOrder = new Order(childEl);
            }
            else if (childEl.classList.contains('order-block-mid')){
                virtualOrder.addOorderMidRow(childEl);
            }
            else if (childEl.classList.contains('order-block-bottom')){
                virtualOrder.setOrderBottomRow(childEl);
                virtualOrdersList.push(virtualOrder);
            }
        });

        console.log('virtualOrdersList', virtualOrdersList);
    }
    

    class Order {
    	constructor(topRow) {
            this.orderTopRow = topRow;
            this.orderBottomRow = null;
    		this.orderNum = topRow.querySelector('.table-order').querySelector('a').textContent.replace('\n', '');
    		this.owner = topRow.querySelector('.green').innerHTML;
            // this.date = date;
            this.SKU = null;
            this.margin = 0;
            this.orderMidRowsList = Array();
            this.isRefundOrder = false;
    	}


        addOorderMidRow(midRow){
            this.orderMidRowsList.push(new OrderMidRow(midRow));
            this.calcOrderMargin();
            this.SKU = this.orderMidRowsList[0].SKU;
            this.checkFeeIsRefund(this.orderMidRowsList[this.orderMidRowsList.length - 1]);
        }

        setSKU(SKU){
            this.SKU = SKU;
        }

        checkFeeIsRefund(midRow){
            if (midRow.isRefundOrder == true){
                this.isRefundOrder = true;
            }
        }

        setOrderBottomRow(bottomRow){
            this.orderBottomRow = bottomRow;
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
        constructor(midRow) {
            this.midRow = midRow;
            this.SKU = "";

            this.cost = 0;
            this.price = 0;
            this.qty = 0;
            this.fee = 0;
            this.margin = 0;
            this.profit = 0;

            this.isRefundOrder = false;
            this.isCostNotSet = false;

            this.setValues();
        }

        setValues(){
            this.isRefundOrder = this.checkFeeIsRefund();
            this.isCostNotSet = this.checkCostIsSet();

            if (this.isRefundOrder == false){

                if (this.isCostNotSet == false){

                    this.fee    = parseFloat(this.midRow.querySelector('.fee').querySelector('b').innerHTML.replace('$', '').replace('−', ''));
                    this.fee    = this.fee * -1;
                    this.SKU    = this.midRow.querySelector('.col1').querySelector('a').textContent.replace('\n', '');
                    this.cost   = parseFloat(this.midRow.querySelector('.col3').innerHTML.split('(')[1].split(')')[0]);
                    this.price  = parseFloat(this.midRow.querySelector('.col4').innerHTML.replace('$', ''));
                    this.qty    = parseFloat(this.midRow.querySelector('.col7').querySelector('b').innerHTML);
                    this.margin = parseFloat(this.midRow.querySelectorAll('.col9')[1].querySelector('span').innerHTML.replace('%', ''));
                    this.profit = parseFloat(this.midRow.querySelectorAll('.col9')[2].querySelector('b').innerHTML.replace('$', ''));
                
                } else {

                    this.fee    = parseFloat(this.midRow.querySelector('.fee').querySelector('b').innerHTML.replace('$', '').replace('−', ''));
                    this.fee    = this.fee * -1;
                    this.SKU    = this.midRow.querySelector('.col1').querySelector('a').textContent.replace('\n', '');
                    this.cost   = 0;
                    this.price  = parseFloat(this.midRow.querySelector('.col4').innerHTML.replace('$', ''));
                    this.qty    = parseFloat(this.midRow.querySelector('.col7').querySelector('b').innerHTML);
                    this.margin = parseFloat(this.midRow.querySelectorAll('.col9')[1].querySelector('span').innerHTML.replace('%', ''));
                    this.profit = parseFloat(this.midRow.querySelectorAll('.col9')[2].querySelector('b').innerHTML.replace('$', ''));
                
                }

            } 
        }

        checkFeeIsRefund(){
            if (this.midRow.querySelector('.fee').innerHTML.includes('Refund')){
                return true;
            } else {
                return false;
            }
        }

        checkCostIsSet(){
            if (this.midRow.querySelector('.col3').innerHTML.includes('Not Set')){
                return true;
            }
        }
    }       

    const scrapOrders = () => {
        const tableHover = document.querySelector('.table-hover');
        const tableBody = tableHover.querySelector('tbody');
        const rows = Array.from(tableBody.querySelectorAll('.order-block-top'));

        createVirtualOrdersList(tableBody);

        return rows.length;
    };


    const applyHiddenMarginFilter = (margin=15, overmargin=50, overmarginApply=true, refundApply=true) => {
        const setHiddenClassToOrders = (order) =>{
            order.orderTopRow.classList.add('hidden-margin-filter');
            order.orderBottomRow.classList.add('hidden-margin-filter');
            order.orderMidRowsList.forEach((midRow) => {
                midRow.midRow.classList.add('hidden-margin-filter');
            });
        }

        virtualOrdersList.forEach((order) => {
            if (refundApply == false && order.isRefundOrder == true){
                setHiddenClassToOrders(order);
            }

            if (overmarginApply == false){
                if (order.margin >= margin){
                    setHiddenClassToOrders(order);
                }            
            } else {
                if (order.margin >= margin && order.margin <= overmargin){
                    setHiddenClassToOrders(order);
                }
            }
        });
    };

    const applyResetFilters = () => {
        virtualOrdersList.forEach((order) => {
            order.orderTopRow.classList.remove('hidden-margin-filter');
            order.orderBottomRow.classList.remove('hidden-margin-filter');
            order.orderMidRowsList.forEach((midRow) => {
                midRow.midRow.classList.remove('hidden-margin-filter');
            });
        });
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

        document.getElementById('orders-read-table').addEventListener('click', async () => {
            try {
                let ordersLenght = scrapOrders();
                toggleCustomFiltersHeader(true, ordersLenght);
                toggleCustomElements(true);
                
            } catch (error) {
                console.error('Error loading orders:', error);
            }
        });

        document.getElementById('order-margin-filter-apply').addEventListener('click', () => {
            const margin = parseFloat(document.getElementById('order-margin-thr').value);
            const overmargin = parseFloat(document.getElementById('order-overmargin').value);
            const overmarginApply = document.getElementById('order-overmargin-apply').checked;
            const refundApply = document.getElementById('order-refund-apply').checked;

            applyHiddenMarginFilter(margin, overmargin, overmarginApply, refundApply);
        });

        document.getElementById('reset-orders-filters').addEventListener('click', () => {
            applyResetFilters();
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