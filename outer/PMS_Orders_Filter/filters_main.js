(function() {

    const customFiltersStyle = document.createElement('style');
    customFiltersStyle.innerHTML = `
        .custom-floating-window {
            position: fixed;
            right: 20px;
            top: 20px;
            width: 400px;
            background: white;
            box-shadow: 0 0 15px rgba(0,0,0,0.2);
            border-radius: 8px;
            z-index: 999;
            display: none;
        }

        .custom-header {
            background: #f0f0f0;
            padding: 10px;
            border-radius: 8px 8px 0 0;
            font-weight: 600;
        }

        .custom-content {
            padding-top: 10px;
            padding-left: 15px;
            padding-right: 15px;
            padding-bottom: 10px;
        }

        .custom-close-btn {
            cursor: pointer;
            float: right;
            font-weight: bold;
            margin-left: 15px;
            font-size: 20px;
            margin-top: -5px;
        }


        /* content */

        .custom-filter{
            margin-bottom: 10px;
        }

        .custom-filter.bordered-filter{
            border-width: 1px;
            border-color: black;
            border-style: dotted;
            border-radius: 4px;
            padding: 5px;
        }

        .custom-filter span {
            margin-left: 5px;
            margin-right: 15px;
        }

        .custom-filter input[type="button"]{
            border-width: 1px;
            border-radius: 4px;
            cursor: pointer;

        }

        .custom-filter input[type="button"]:hover {
            background: #dadada;
        }

        .custom-filter input[type="button"]:active {
            background: #b3b3b3;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
            transform: translateY(1px);
            transition-duration: 0.1s;
        }

        .custom-filter .checkbox-wrapper {
            display: flex;
            justify-content: left;
            padding-left: 2px;
            border-radius: 4px;
        }

        .custom-filter .margin-input{
            max-width: 60px;
            margin-right: auto;
        }

        .custom-filter .custom-filter-oneline-button{
            width: 100%;
            height: 22px;
        }

        .custom-filter label{
            font-family: monospace;
            font-size: 16px;
        }

        .custom-filter-header{
            text-align: center;
            font-family: monospace;

            margin-bottom: 10px;
        }

        .red-label{
            color: red;
        }

        .green-label{
            color: green;
        }

        /* Content GRID */

        .filter-grid {
            display: grid;
            gap: 5px;
            width: 100%;
            max-width: 600px;
        }

        .grid-row {
            display: grid;
            grid-template-columns: 1fr auto 100px;
            align-items: center;
            gap: 8px;
        }

        .grid-label {
            justify-self: start;
            white-space: nowrap;
        }

        .input-group {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .margin-input {
            width: 100px;
            padding: 6px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .percent {
            white-space: nowrap;
        }

        .grid-button {
            padding: 6px 12px;
        }

        .grid-checkbox {
            transform: scale(1.2);
        }

        /* DISABLED */

        .custom-content .disabled {
            opacity: 0.6;
            pointer-events: none;
            position: relative;
        }

        .custom-content .disabled::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.5);
            cursor: not-allowed;
        }

        .custom-content .disabled .grid-checkbox {
            filter: grayscale(1);
        }


        /* Hidden Margin Filter */

        .hidden-margin-filter {
            display: none!important;
        }

        /* Hidden Refund Filter */

        .hidden-refund-filter {
            display: none!important;
        }

        .hidden-non-refund-filter {
            display: none!important;
        }

        /* Orders Custom Summary Table */

        .custom-orders-table-wrapper {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%; 
            max-width: 1200px; 
            max-height: 80vh;
            overflow-y: auto;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
        }

        .custom-orders-table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            font-size: 18px;
            font-weight: 600;
            background: #f8f8f8;
            border-bottom: 1px solid #ddd;
            border-radius: 8px 8px 0 0;
        }

        .custom-orders-table thead th{
            cursor: pointer;
            padding: 5px;
            padding-right: 20px;
            background: #f1f1f1;
            font-weight: bold;
            user-select: none;
        }

        .custom-orders-table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
        }

        .custom-orders-table th,
        .custom-orders-table td {
            padding: 12px;
            text-align: center;
            border-bottom: 1px solid #ddd;
        }

        .custom-orders-table th:nth-child(1),
        .custom-orders-table td:nth-child(1),
        .custom-orders-table th:nth-child(2),
        .custom-orders-table td:nth-child(2) {
            text-align: left;
            padding-left: 10px;
        }

        .custom-orders-table tbody tr:hover {
            background: #f9f9f9;
        }

        .custom-orders-table th::after {
            content: '';
            position: absolute;
            right: 8px;
            border: 5px solid transparent;
            border-top-color: transparent;
            border-bottom-color: transparent;
            border-left-color: transparent;
            border-right-color: transparent;
        }

        .custom-orders-table th.asc::after {
            content: '';
            border-top-color: black;
            border-bottom: none;
            top: 50%;
            transform: translateY(-50%);
        }

        .custom-orders-table th.desc::after {
            content: '';
            border-bottom-color: black;
            border-top: none;
            top: 50%;
            transform: translateY(-50%);
        }

        .custom-filter-button{
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
        }

        /* DEV */

        .dev-window{
            position: fixed;
            display: block;
            left: 2%!important;
        }

        .dev-disabled {
            opacity: 0.6;
            pointer-events: none;
            position: relative;
        }

        .visiable{
            display: block;
        }

        .hidden{
            display: none;
        }
    `;
    document.head.appendChild(customFiltersStyle);

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
                        <label class="grid-label">Hide Margin &ge;</label>
                        <div class="input-group">
                            <input type="number" name="order-margin-thr" value="15" 
                                   id="order-margin-thr" class="margin-input">
                            <span class="percent">%</span>
                        </div>
                        <input type="button" value="Apply" 
                               id="order-margin-filter-apply" class="grid-button">
                    </div>
                    
                    <div class="grid-row">
                        <label class="grid-label">Keep Margin &ge;</label>
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

                </form>
            </div>

            <div class="custom-filter bordered-filter">
                <form class="filter-grid">
                    <div class="grid-row">
                        <label class="grid-label">Hide Refund Orders </label>
                        <div class="input-group"></div>
                        <input type="button" value="Apply" 
                               id="order-refund-filter-apply" class="grid-button">
                    </div>
                    
                    <div class="grid-row">
                        <label class="grid-label">Hide Non-Refund Orders </label>
                        <div class="input-group"></div>
                        <input type="button" value="Apply" 
                               id="order-non-refund-filter-apply" class="grid-button">
                    </div>
                </form>
            </div>

        </div>
    `;

    const ordersCustomTableWindow = document.createElement('div');
    ordersCustomTableWindow.className = 'custom-orders-table-wrapper';
    ordersCustomTableWindow.innerHTML = `
        <div class="custom-orders-table-header">
            <span class='custom-orders-title'>
                FBA Orders Custom Summary Table 
                <span class='table-title-date-range'></span>
                </span>
            <span class="custom-close-btn">&times;</span>
        </div>
        <div class="custom-orders-table-buttons custom-filter">
            <input type="button" value="Export to XLSX" 
                   id="orders-export-xlsx" class="custom-filter-oneline-button">
        </div>
        <table class="custom-orders-table">
            <thead>
                <tr>
                <th>User</th>
                <th>SKU</th>
                <th>Orders</th>
                <th>Sales Qty</th>
                <th>Refunds</th>
                <th>Cost $</th>
                <th>Price $</th>
                <th>Fee $ </th>
                <th>Margin % </th>
                <th>Profit $</th>
                </tr>
            </thead>
            <tbody>
                
            </tbody>
        </table>
    `;

    const scriptSheetJS = document.createElement('script');
    scriptSheetJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js';
    
    document.head.appendChild(scriptSheetJS);
    document.body.appendChild(floatingWindow);
    document.body.appendChild(ordersCustomTableWindow);


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
                virtualOrder.addOrderMidRow(childEl);
            }
            else if (childEl.classList.contains('order-block-bottom')){
                virtualOrder.setOrderBottomRow(childEl);
                virtualOrdersList.push(virtualOrder);
            }
        });

        // console.log('virtualOrdersList', virtualOrdersList);
    }
    

    class Order {
    	constructor(topRow) {
            this.orderTopRow = topRow;
            this.orderBottomRow = null;
    		this.orderNum = topRow.querySelector('.table-order').querySelector('a').textContent.replace('\n', '');
    		this.owner = topRow.querySelector('.green').innerHTML;
            this.date = topRow.querySelectorAll('.table-order')[1].innerHTML.replace('\n', '').split('<br>')[0].trim();
            this.SKU = null;
            this.margin = 0;
            this.price = 0;
            this.cost = 0;
            this.qty = 0;
            this.profit = 0;
            this.fee = 0;
            this.orderMidRowsList = Array();
            this.isRefundOrder = false;
    	}


        addOrderMidRow(midRow){
            this.orderMidRowsList.push(new OrderMidRow(midRow));
            this.SKU = this.orderMidRowsList[0].SKU;
            this.checkFeeIsRefund(this.orderMidRowsList[this.orderMidRowsList.length - 1]);
        }

        checkFeeIsRefund(midRow){
            if (midRow.isRefundOrder == true){
                this.isRefundOrder = true;
            }
        }

        setOrderBottomRow(bottomRow){
            this.orderBottomRow = bottomRow;
            let chars = Array();
            
            bottomRow.querySelector('b').textContent.split('\n').forEach((char) => {
                char = char.trim();
                if (char == '') return;
                chars.push(char);
            });

            this.margin = parseFloat(chars[chars.length - 1].replace('%', ''));
            this.price = parseFloat(chars[0].split('$')[1]);
            this.cost = parseFloat(chars[1].split('$')[1]);
            this.fee = parseFloat(chars[2].split(': ')[1].replace('$', ''));
            this.profit = parseFloat(chars[3].split('$')[1]);

            this.orderMidRowsList.forEach((midRow) => {
                this.qty += midRow.qty;
            });

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

            this.isRefundOrder = this.checkFeeIsRefund();
            this.isCostNotSet = this.checkCostIsNotSet();
            
            this.setValues();
        }

        setValues(){
            if (this.isRefundOrder == false){
                if (this.isCostNotSet == false){
                    this.SKU    = this.midRow.querySelector('.col1').querySelector('a').textContent.replace('\n', '');
                    this.qty    = parseFloat(this.midRow.querySelector('.col7').querySelector('b').innerHTML);
                } else {

                    this.SKU    = this.midRow.querySelector('.col1').querySelector('a').textContent.replace('\n', '');
                    this.qty    = parseFloat(this.midRow.querySelector('.col7').querySelector('b').innerHTML);
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

        checkCostIsNotSet(){
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

    const filtersClasses = {
        hiddenMargin: 'hidden-margin-filter',
        hiddenRefund: 'hidden-refund-filter',
        hiddenNonRefund: 'hidden-non-refund-filter'
    };

    const filtersClassesVals = Object.values(filtersClasses);

    const addFilterClassToOrders = (order, filterClass) => {
        order.orderTopRow.classList.add(filterClass);
        order.orderBottomRow.classList.add(filterClass);
        order.orderMidRowsList.forEach((midRow) => {
            midRow.midRow.classList.add(filterClass);
        });
    };

    const applyHiddenMarginFilter = (margin=15, overmargin=50, overmarginApply=true) => {
        virtualOrdersList.forEach((order) => {
            if (overmarginApply == false){

                if (order.margin >= margin){
                    addFilterClassToOrders(order, filtersClasses.hiddenMargin);
                }            

            } else {

                if (order.margin >= margin && order.margin <= overmargin){
                    addFilterClassToOrders(order, filtersClasses.hiddenMargin);
                }

            }
        });
    };

    const applyHiddenRefundFilter = () => {
        virtualOrdersList.forEach((order) => {
            if (order.isRefundOrder == true){
                addFilterClassToOrders(order, filtersClasses.hiddenRefund);
            }
        });
    };

    const applyHiddenNonRefundFilter = () => {
        virtualOrdersList.forEach((order) => {
            if (order.isRefundOrder == false){
                addFilterClassToOrders(order, filtersClasses.hiddenRefund);
            }
        });
    }

    const applyResetFilters = () => {
        virtualOrdersList.forEach((order) => {
            order.orderTopRow.classList.remove(...filtersClassesVals);
            order.orderBottomRow.classList.remove(...filtersClassesVals);
            order.orderMidRowsList.forEach((midRow) => {
                midRow.midRow.classList.remove(...filtersClassesVals);
            });
        });
    };


    const calcOrdersCustomSummaryTable = () => {
        const summaryData = {};

        virtualOrdersList.forEach((order) => {
            if (!summaryData[order.SKU]) {
                summaryData[order.SKU] = {
                    user: "",
                    count: 0,
                    qty: 0,
                    refunds: 0,
                    cost: 0,
                    price: 0,
                    fee: 0,
                    margin: 0,
                    profit: 0
                };
            }

            summaryData[order.SKU].user = order.owner;
            summaryData[order.SKU].count++;
            summaryData[order.SKU].qty += order.qty;
            summaryData[order.SKU].refunds += order.isRefundOrder ? 1 : 0;
            summaryData[order.SKU].cost += order.cost;
            summaryData[order.SKU].price += order.price;
            summaryData[order.SKU].fee += order.fee;
            summaryData[order.SKU].profit += order.isRefundOrder ? -order.profit : order.profit;
        });

        const tableTitleRange = ordersCustomTableWindow.querySelector('.table-title-date-range');
        tableTitleRange.textContent = `(${virtualOrdersList[0].date.split(' ')[0]} - ${virtualOrdersList[virtualOrdersList.length - 1].date.split(' ')[0]})`;

        const tableBody = ordersCustomTableWindow.querySelector('tbody');
        tableBody.innerHTML = '';

        Object.keys(summaryData).forEach((sku) => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td class='sum-user'    >${summaryData[sku].user}</td>
            <td class='sum-sku'     >${sku}</td>
            <td class='sum-count'   >${summaryData[sku].count}</td>
            <td class='sum-qty'     >${summaryData[sku].qty}</td>
            <td class='sum-refunds' >${summaryData[sku].refunds}</td>
            <td class='sum-cost'    >${summaryData[sku].cost.toFixed(2)}</td>
            <td class='sum-price'   >${summaryData[sku].price.toFixed(2)}</td>
            <td class='sum-fee'     >${summaryData[sku].fee.toFixed(2)}</td>
            <td class='sum-margin'  >${(summaryData[sku].profit / summaryData[sku].price * 100).toFixed(2)}</td>
            <td class='sum-profit'  >${summaryData[sku].profit.toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });
    };

    const makeTableSortable = (table) => {
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
            header.addEventListener('click', () => {
                const isAscending = header.classList.contains('asc');
                sortTableByColumn(table, index, !isAscending);
                headers.forEach((h) => h.classList.remove('asc', 'desc'));
                header.classList.toggle('asc', !isAscending);
                header.classList.toggle('desc', isAscending);
            });
        });
    };

    const sortTableByColumn = (table, column, ascending = true) => {
        const dirModifier = ascending ? 1 : -1;
        const rows = Array.from(table.querySelector('tbody').querySelectorAll('tr'));

        const sortedRows = rows.sort((a, b) => {
            const aColText = a.querySelectorAll(`td:nth-child(${column + 1})`)[0].textContent.trim();
            const bColText = b.querySelectorAll(`td:nth-child(${column + 1})`)[0].textContent.trim();

            const aColValue = isNaN(aColText) ? aColText : parseFloat(aColText);
            const bColValue = isNaN(bColText) ? bColText : parseFloat(bColText);

            return aColValue < bColValue ? (1 * dirModifier) : (-1 * dirModifier);
        });

        while (table.querySelector('tbody').firstChild) {
            table.querySelector('tbody').removeChild(table.querySelector('tbody').firstChild);
        };

        table.querySelector('tbody').append(...sortedRows);
    };

    const exportCustomSummaryTableToXLSX = (table) => {
        const ws = XLSX.utils.table_to_sheet(table);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Orders Summary');
        XLSX.writeFile(wb, `Summary_Orders_${virtualOrdersList[0].date.split(' ')[0]}-${virtualOrdersList[virtualOrdersList.length - 1].date.split(' ')[0]}.xlsx`);
    };


    const showWindow = (window) => {
        window.style.display = 'block';
    };
    const hideWindow = (window) => {
        window.style.display = 'none';
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

            applyHiddenMarginFilter(margin, overmargin, overmarginApply);
        });

        document.getElementById('order-refund-filter-apply').addEventListener('click', () => {
            applyHiddenRefundFilter();
        });

        document.getElementById('order-non-refund-filter-apply').addEventListener('click', () => {
            applyHiddenNonRefundFilter();
        });

        document.getElementById('reset-orders-filters').addEventListener('click', () => {
            applyResetFilters();
        });

        floatingWindow.querySelector('.custom-close-btn').addEventListener('click', () => hideWindow(floatingWindow));

        document.getElementById('orders-calculate-sku').addEventListener('click', () => {
            showWindow(ordersCustomTableWindow)
            calcOrdersCustomSummaryTable();
            makeTableSortable(ordersCustomTableWindow.querySelector('.custom-orders-table'));
        });
        
        ordersCustomTableWindow.querySelector('.custom-close-btn').addEventListener('click', () => hideWindow(ordersCustomTableWindow));
 
        ordersCustomTableWindow.querySelector('#orders-export-xlsx').addEventListener('click', () => {
            exportCustomSummaryTableToXLSX(ordersCustomTableWindow.querySelector('.custom-orders-table'));
        });
    };

    const handleKeyPress = (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

        if (e.ctrlKey && e.shiftKey && e.code === 'KeyL') {
            e.preventDefault();
            showWindow(floatingWindow);
        }
    };

    initEventListeners();

    floatingWindow.addEventListener('click', (e) => e.stopPropagation());
})();