// ==UserScript==
// @name         PMS FBA Orders Custom Filters
// @version      2.1r
// @author       Priboy313
// @description  PMS FBA Orders Custom Filters Public Release
// @match        https://pms.plexsupply.com/pms/listfbaorderscomm.xhtml
// @match        https://pms.officechase.com/pms/listfbaorderscomm.xhtml
// @match        https://pms.marksonsupply.com/pms/listfbaorderscomm.xhtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=plexsupply.com
// ==/UserScript==


(function(settingsJSON, role = 'user') {
	'use strict';

	if (document.querySelector('.custom-filters-button')) return;
	
	let script_version = "2.1r";

	const ROLE = role;

	const SCRIPT_ID = 'pmsFbaOrdersCustomFilters';

	const DEFAULTS = {
		
	};

	function loadConfig() {
		console.log(`== [${SCRIPT_ID}] Обработка полученной конфигурации...`);
		
		let settingsData = {};
		try {
			if (settingsJSON && typeof settingsJSON === 'string') {
				settingsData = JSON.parse(settingsJSON);
			}
		} catch (e) {
			console.error(`== [${SCRIPT_ID}] Ошибка парсинга JSON-строки настроек:`, e);
			return DEFAULTS;
		}

		const mySavedSettings = settingsData[SCRIPT_ID] || {};
		console.log(`== [${SCRIPT_ID}] Получены настройки для этого скрипта:`, mySavedSettings);
		
		const finalConfig = { ...DEFAULTS, ...mySavedSettings };
		console.log(`== [${SCRIPT_ID}] Финальный конфиг после слияния:`, finalConfig);
		
		return finalConfig;
	}

	const config = loadConfig();

    const filtersClasses = {
        hidden: 'hidden-filter',
    };
    const filtersClassesVals = Object.values(filtersClasses);

	const customFiltersStyle = document.createElement('style');
	customFiltersStyle.innerHTML = `
	.custom-filters-button{
		background-color: #ffffff;
		border: 1px solid #a0a0a0;
		box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.15);
		display: inline-block;
		padding: 2px 15px;
		text-decoration: none;
		color: #000;
		cursor: pointer;
		transition: 0.1s;
	}

	.custom-filters-button:hover{
		background-color: #e6e2e1;
	}


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

		position: fixed;
		width: 400px;
		max-height: 85vh;
		overflow-y: auto;

		background: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
    `;

const customFiltersHiddenStyle = document.createElement('style');
filtersClassesVals.forEach(filterClass => {
	customFiltersHiddenStyle.innerHTML += `
	.${filterClass} {
		display: none!important;
	}
	`
});

const customFiltersGridStyle = document.createElement('style');
customFiltersGridStyle.innerHTML = `
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

	.grid-row-3 {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;;
		align-items: center;
		gap: 4px;
		margin: 1px 0;
	}

	.grid-row-3 .grid-label {
		min-width: 180px;
		white-space: nowrap;
		padding-right: 2px;
	}

	.grid-row-3 .grid-button{
		padding: 6px 2px;
		min-width: 60px;
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

	.custom-filter-header-stats{
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		grid-template-rows: auto auto;
		gap: 4px;
		margin-bottom: 3px;
		margin-top: -5px;
	}

	.custom-filter-header-stats .grid-header-label {
		grid-row: 1;
		text-align: center;
		color: #000;
		padding: 1px 0;
	}

	.custom-filter-header-stats .grid-header-value {
		grid-row: 2;
		text-align: center;
		color: #000;
		padding: 0 0 2px 0;
	}
`;

const customFiltersDisabledStyle = document.createElement('style');
customFiltersDisabledStyle.innerHTML = `
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
	`;

	const customFiltersSummaryTableStyle = document.createElement('style');
	customFiltersSummaryTableStyle.innerHTML = `

	.custom-orders-table-wrapper {
		display: none;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80%;
		max-width: 1300px;
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
		content: '●';
		color: gray;
		font-size: 10px;
		position: absolute;
		right: 1px;
		transform: translateY(-25%);
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
		right: 4px;
		transform: translateY(-40%);
	}

	.custom-orders-table th.desc::after {
		content: '';
		border-bottom-color: black;
		border-top: none;
		top: 50%;
		right: 4px;
		transform: translateY(-60%);
	}

	.custom-orders-table-row-negative-margin{
		background:rgb(254, 189, 189);
	}

	.custom-orders-table-row-negative-margin:hover{
		background:rgb(246, 171, 171)!important;
	}

	.custom-orders-table-row-low-margin{
		background: rgb(255, 252, 217);
	}

	.custom-orders-table-row-low-margin:hover{
		background:rgb(251, 235, 196)!important;
	}

	.custom-filter-button{
		padding: 5px 10px;
		border-radius: 4px;
		cursor: pointer;
	}

	.table-us-header{
		background-color: rgb(206, 215, 246)!important;
	}

	.table-ca-header{
		background-color: rgb(244, 204, 204)!important;
	}

	.table-mx-header{
		background-color: rgba(250, 233, 203, 1)!important;
	}

`;

const customFiltersDevStyle = document.createElement('style');
customFiltersDevStyle.innerHTML = `
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
	document.head.appendChild(customFiltersHiddenStyle);
	document.head.appendChild(customFiltersGridStyle);
	document.head.appendChild(customFiltersDisabledStyle);
	document.head.appendChild(customFiltersSummaryTableStyle);
	document.head.appendChild(customFiltersDevStyle);

    const customFiltersButton = document.createElement('input');
    customFiltersButton.type = 'button';
    customFiltersButton.value = 'Show Custom Filters';
    customFiltersButton.className = 'custom-filters-button';

    const barBlue = document.querySelector('.titlebar-blue').querySelector('form')
		barBlue.appendChild(customFiltersButton);


		// Плавающее окно

    const floatingWindow = document.createElement('div');
    floatingWindow.className = 'custom-floating-window';
    floatingWindow.innerHTML = `
        <div class="custom-header">
            <span>PMS FBA Orders Custom Filters ${script_version}</span>
            <span class="custom-close-btn">&times;</span>
        </div>
        <div class="custom-content">

            <div class="custom-filter custom-filter-header">
                <span id="orders-read-header" class="custom-filter-header-label red-label">ORDERS NOT READED</span>
            </div>

			<div class=" custom-filter-header-stats">
                <span class="grid-header-label">Hidden</span>
                <span class="grid-header-label">Shown</span>
                <span class="grid-header-label">NoCost</span>
                <span class="grid-header-label">AmznGr</span>
                <span class="grid-header-label">Refund</span>
                <span class="grid-header-label">Replace</span>
                <span class="grid-header-value" id="orders-hidden-stat">0</span>
                <span class="grid-header-value" id="orders-keep-stat">0</span>
                <span class="grid-header-value" id="orders-nocost-stat">0</span>
                <span class="grid-header-value" id="orders-amzngr-stat">0</span>
                <span class="grid-header-value" id="orders-refund-stat">0</span>
                <span class="grid-header-value" id="orders-replacement-stat">0</span>
            </div>

            <div class="custom-filter">
                <input type="button" value="READ ORDERS TABLE"
                id="orders-read-table" class="custom-filter-oneline-button">
            </div>

            <div class="custom-filter">
                <input type="button" value="Calculate Shown Summary Table" id="orders-calculate-shown-sku" class="custom-filter-oneline-button">
            </div>

			<div class="custom-filter">
                <input type="button" value="Calculate Countries Summary Table" id="orders-calculate-country-sku" class="custom-filter-oneline-button">
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

					<div class="grid-row-3">
                        <label class="grid-label">NoCost Orders </label>
                        <input type="button" value="Show" id="orders-show-nocost-skus-apply" class="grid-button">
						<input type="button" value="Hide" id="orders-hide-nocost-skus-apply" class="grid-button">
                    </div>

					<div class="grid-row-3">
                        <label class="grid-label">AmznGr Orders </label>
                        <input type="button" value="Show" id="orders-show-amzngr-skus-apply" class="grid-button">
						<input type="button" value="Hide" id="orders-hide-amzngr-skus-apply" class="grid-button">
                    </div>

					<div class="grid-row-3">
                        <label class="grid-label">Refund Orders </label>
                        <input type="button" value="Show" id="order-non-refund-filter-apply" class="grid-button">
						<input type="button" value="Hide" id="order-refund-filter-apply" class="grid-button">
                    </div>

                    <div class="grid-row-3">
                        <label class="grid-label">Replace Orders </label>
                        <input type="button" value="Show" id="order-non-replacement-filter-apply" class="grid-button">
						<input type="button" value="Hide" id="order-replacement-filter-apply" class="grid-button">
                    </div>

				</form>
            </div>

			<div class="custom-filter bordered-filter">
                <form class="filter-grid">

					<div class="grid-row-3">
                        <label class="grid-label">US Orders </label>
                        <input type="button" value="Show" id="orders-show-us-country-apply" class="grid-button">
						<input type="button" value="Hide" id="orders-hide-us-country-apply" class="grid-button">
                    </div>

					<div class="grid-row-3">
                        <label class="grid-label">CA Orders </label>
                        <input type="button" value="Show" id="orders-show-ca-country-apply" class="grid-button">
						<input type="button" value="Hide" id="orders-hide-ca-country-apply" class="grid-button">
                    </div>

					<div class="grid-row-3">
                        <label class="grid-label">MX Orders </label>
                        <input type="button" value="Show" id="order-show-mx-country-apply" class="grid-button">
						<input type="button" value="Hide" id="order-hide-mx-country-apply" class="grid-button">
                    </div>

                    <div class="grid-row-3">
                        <label class="grid-label">Other Orders </label>
                        <input type="button" value="Show" id="order-show-other-country-apply" class="grid-button">
						<input type="button" value="Hide" id="order-hide-other-country-apply" class="grid-button">
                    </div>

				</form>
            </div>

        </div>
    `;


		// Сводная таблица по СКУ
		
    const ordersCustomTableWindow = document.createElement('div');
    ordersCustomTableWindow.className = 'custom-orders-table-wrapper';
    ordersCustomTableWindow.innerHTML = `
        <div class="custom-orders-table-header">
            <span class='custom-orders-title'>
                <span class='table-title'></span>
                <span class='table-title-date-range'></span>
            </span>
            <span class="custom-close-btn">&times;</span>
        </div>
        <div class="custom-orders-table-buttons custom-filter">
            <input type="button" value="Export to XLSX" id="orders-export-xlsx" class="custom-filter-oneline-button">
        </div>
        <table class="custom-orders-table">
            <thead></thead>
            <tbody></tbody>
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
        const elementsToToggle = Array.from(container.children).slice(3);

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
        virtualOrdersList = Array();
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

		// --- ОТЛАДКА --- //
		// Выводит в консоль содержание виртуального списка ордеров.
        // console.log('virtualOrdersList', virtualOrdersList);
    }


    class Order {
		constructor(topRow) {
            this.orderTopRow = topRow;
            this.orderBottomRow = null;
			this.orderNum = topRow.querySelector('.table-order').querySelector('a').textContent.replace('\n', '');
			this.country = this.getCountry(topRow.querySelector('.table-order'))
			this.owner = topRow.querySelector('.green').innerHTML;
            this.date = topRow.querySelectorAll('.table-order')[1].innerHTML.replace('\n', '').split('<br>')[0].trim();
            this.SKU = null;
            this.margin = 0;
            this.price = 0;
            this.cost = 0;
            this.qty = 0;
            this.profit = 0;
            this.fee = 0;

            this.isHidden = false;
            this.orderMidRowsList = Array();
            this.isRefundOrder = false;
			this.isCostNotSet = false;
			this.isAmznGr = false;
			this.isReplacement = false;
		}

		getCountry(tableOrder){
			const countryTag = tableOrder.querySelector('b');

			return countryTag && countryTag.textContent.trim() ? countryTag.textContent.trim() : "US";
		}

        addOrderMidRow(midRow){
            this.orderMidRowsList.push(new OrderMidRow(midRow));
            this.checkFeeIsRefund(this.orderMidRowsList[this.orderMidRowsList.length - 1]);
			this.checkIsCostNotSet(this.orderMidRowsList[this.orderMidRowsList.length - 1]);
        }

		checkIsReplacement(){
			if (this.isCostNotSet == false){
				if (this.price == 0 && this.isRefundOrder == false){
					this.isReplacement = true;
				}
			}
		}

		checkIsAmznGr(SKU){
			if(SKU.includes("amzn.gr")){
				this.isAmznGr = true;
			}
		}

        checkFeeIsRefund(midRow){
            if (midRow.isRefundOrder == true){
                this.isRefundOrder = true;
            }
        }

        checkIsCostNotSet(midRow){
            if (midRow.isCostNotSet == true){
                this.isCostNotSet = true;
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
            this.price = parseFloat(chars[0].replace('$', '').split(': ')[1]);
            this.cost = parseFloat(chars[1].replace('$', '').split(': ')[1]);
            this.fee = parseFloat(chars[2].split(': ')[1].replace('$', ''));
            this.profit = parseFloat(chars[3].replace('$', '').split(': ')[1]);

            this.orderMidRowsList.forEach((midRow) => {
                this.qty += midRow.qty;
            });

			this.checkIsReplacement();
			this.SKU = this.orderMidRowsList[0].SKU;
			this.checkIsAmznGr(this.orderMidRowsList[0].SKU);
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

    const calcOrdersHeaderStats = () => {
        const cellHiddenStat = floatingWindow.querySelector("#orders-hidden-stat");
        const cellKeepStat = floatingWindow.querySelector("#orders-keep-stat");
        const cellNoCostStat = floatingWindow.querySelector("#orders-nocost-stat");
		const cellAmznGrStat = floatingWindow.querySelector("#orders-amzngr-stat");
        const cellRefundStat = floatingWindow.querySelector("#orders-refund-stat");
		const cellReplacementStat = floatingWindow.querySelector("#orders-replacement-stat");

        let hiddenCount = 0;
        let noCostCount = 0;
		let amzngrCount = 0;
        let refundCount = 0;
		let replacementCount = 0;

        virtualOrdersList.forEach(order => {
            if (order.isRefundOrder) refundCount++;
            if (order.isHidden) hiddenCount++;
			if (order.isAmznGr) amzngrCount++;
            if (order.isCostNotSet) noCostCount++;
			if (order.isReplacement) replacementCount++;
        })

        cellHiddenStat.innerHTML = hiddenCount;
        cellKeepStat.innerHTML = virtualOrdersList.length - hiddenCount;
        cellNoCostStat.innerHTML = noCostCount;
		cellAmznGrStat.innerHTML = amzngrCount;
        cellRefundStat.innerHTML = refundCount;
		cellReplacementStat.innerHTML = replacementCount;
    }

    const addFilterClassToOrders = (order, filterClass) => {
        order.orderTopRow.classList.add(filterClass);
        order.orderBottomRow.classList.add(filterClass);
        order.orderMidRowsList.forEach((midRow) => {
            midRow.midRow.classList.add(filterClass);
        });
        order.isHidden = true;
    };


	// ФИЛЬТРЫ


    const applyHiddenMarginFilter = (margin=15, overmargin=50, overmarginApply=true) => {
        virtualOrdersList.forEach((order) => {
            if (overmarginApply == false){

                if (order.margin >= margin){
                    addFilterClassToOrders(order, filtersClasses.hidden);
                }

            } else {

                if (order.margin >= margin && order.margin <= overmargin){
                    addFilterClassToOrders(order, filtersClasses.hidden);
                }

            }
        });
    };

    const applyHiddenRefundFilter = () => {
        virtualOrdersList.forEach((order) => {
            if (order.isRefundOrder == true){
                addFilterClassToOrders(order, filtersClasses.hidden);
            }
        });
    };

    const applyHiddenNonRefundFilter = () => {
        virtualOrdersList.forEach((order) => {
            if (order.isRefundOrder == false){
                addFilterClassToOrders(order, filtersClasses.hidden);
            }
        });
    }

    const applyHiddenNoCostFilter = () => {
        virtualOrdersList.forEach((order) => {
            if (order.isCostNotSet == true){
                addFilterClassToOrders(order, filtersClasses.hidden);
            }
        });
    };

    const applyShowNoCostFilter = () => {
        virtualOrdersList.forEach((order) => {
            if (order.isCostNotSet == false){
                addFilterClassToOrders(order, filtersClasses.hidden);
            }
        });
    };

	const applyShowNoAmznGrFilter = () => {
		virtualOrdersList.forEach((order) => {
			if (order.isAmznGr == true){
				addFilterClassToOrders(order, filtersClasses.hidden);
			}
		});
	}

	const applyShowAmznGrFilter = () => {
		virtualOrdersList.forEach((order) => {
			if (order.isAmznGr == false){
				addFilterClassToOrders(order, filtersClasses.hidden);
			}
		});
	}

	const applyShowReplacementFilter = () => {
		virtualOrdersList.forEach((order) => {
			if (order.isReplacement == false){
				addFilterClassToOrders(order, filtersClasses.hidden);
			}
		});
	}

	const applyShowNoReplacementFilter = () => {
		virtualOrdersList.forEach((order) => {
			if (order.isReplacement == true){
				addFilterClassToOrders(order, filtersClasses.hidden);
			}
		});
	}


	const noOtherCountrys = ["US", "CA", "MX"]

	const applyShowUSFilter = () => {
		virtualOrdersList.forEach((order) => {
			if (order.country != "US"){
				addFilterClassToOrders(order, filtersClasses.hidden);
			}
		});
	}

	const applyShowNoUSFilter = () => {
		virtualOrdersList.forEach((order) => {
			if (order.country == "US"){
				addFilterClassToOrders(order, filtersClasses.hidden);
			}
		});
	}

	const applyShowCAFilter = () => {
		virtualOrdersList.forEach((order) => {
			if (order.country != "CA"){
				addFilterClassToOrders(order, filtersClasses.hidden);
			}
		});
	}

	const applyShowNoCAFilter = () => {
		virtualOrdersList.forEach((order) => {
			if (order.country == "CA"){
				addFilterClassToOrders(order, filtersClasses.hidden);
			}
		});
	}

	const applyShowMXFilter = () => {
		virtualOrdersList.forEach((order) => {
			if (order.country != "MX"){
				addFilterClassToOrders(order, filtersClasses.hidden);
			}
		});
	}

	const applyShowNoMXFilter = () => {
		virtualOrdersList.forEach((order) => {
			if (order.country == "MX"){
				addFilterClassToOrders(order, filtersClasses.hidden);
			}
		});
	}

	const applyShowOtherCountryFilter = () => {
		virtualOrdersList.forEach((order) => {
			if (noOtherCountrys.includes(order.country)) {
            	addFilterClassToOrders(order, filtersClasses.hidden);
        	}
		});
	}

	const applyShowNoOtherCountryFilter = () => {
		virtualOrdersList.forEach((order) => {
			if (!noOtherCountrys.includes(order.country)) {
            	addFilterClassToOrders(order, filtersClasses.hidden);
        	}
		});
	}

    const applyResetFilters = () => {
        virtualOrdersList.forEach((order) => {
            order.isHidden = false;
            order.orderTopRow.classList.remove(...filtersClassesVals);
            order.orderBottomRow.classList.remove(...filtersClassesVals);
            order.orderMidRowsList.forEach((midRow) => {
                midRow.midRow.classList.remove(...filtersClassesVals);
            });
        });
    };

	const calcOrdersCustomSummaryTable = (virtualList) => {
		const summaryData = {};
        virtualList.forEach((order) => {
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
            summaryData[order.SKU].profit += order.profit;
        });

		const tableTitle = ordersCustomTableWindow.querySelector('.table-title');
		tableTitle.textContent = "FBA Orders Custom Summary Table ";

        const tableTitleRange = ordersCustomTableWindow.querySelector('.table-title-date-range');
        tableTitleRange.textContent = `(${virtualOrdersList[0].date.split(' ')[0]} - ${virtualOrdersList[virtualOrdersList.length - 1].date.split(' ')[0]})`;

		const tableHead = ordersCustomTableWindow.querySelector('thead');
		tableHead.innerHTML = `
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
		`;

        const tableBody = ordersCustomTableWindow.querySelector('tbody');
        tableBody.innerHTML = '';

        Object.keys(summaryData).forEach((sku) => {
            let margin = summaryData[sku].price == 0 ? -100 : (summaryData[sku].profit / summaryData[sku].price * 100).toFixed(2);
            const row = document.createElement('tr');
            if (margin < 0) {
                row.classList.add('custom-orders-table-row-negative-margin');
            } else if (margin < 15) {
                row.classList.add('custom-orders-table-row-low-margin');
            }

            row.innerHTML = `
            <td class='sum-user'    >${summaryData[sku].user}</td>
            <td class='sum-sku'     >${sku}</td>
            <td class='sum-count'   >${summaryData[sku].count}</td>
            <td class='sum-qty'     >${summaryData[sku].qty}</td>
            <td class='sum-refunds' >${summaryData[sku].refunds}</td>
            <td class='sum-cost'    >${summaryData[sku].cost.toFixed(2)}</td>
            <td class='sum-price'   >${summaryData[sku].price.toFixed(2)}</td>
            <td class='sum-fee'     >${summaryData[sku].fee.toFixed(2)}</td>
            <td class='sum-margin'  >${margin}</td>
            <td class='sum-profit'  >${summaryData[sku].profit.toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });
	};

	const calcCountriesCustomSummaryTable = (virtualList) => {
		const summaryData = {};
        virtualList.forEach((order) => {
            if (!summaryData[order.SKU]) {
                summaryData[order.SKU] = {
                    user: "",
                    count: 0,
					
                    qtyUS: 0,
					priceUS: 0,
                    marginUS: 0,
                    profitUS: 0,

					qtyCA: 0,
					priceCA: 0,
					marginCA: 0,
                    profitCA: 0,

					qtyMX: 0,
					priceMX: 0,
					marginMX: 0,
                    profitMX: 0,

					qtyOT: 0,
					priceOT: 0,
					marginOT: 0,
                    profitOT: 0,
                };
            }

            summaryData[order.SKU].user = order.owner;
            summaryData[order.SKU].count++;

			switch (order.country) {
				case "US":
					summaryData[order.SKU].qtyUS += order.qty;
					summaryData[order.SKU].priceUS += order.price;
            		summaryData[order.SKU].profitUS += order.profit;
					break;

				case "CA":
					summaryData[order.SKU].qtyCA += order.qty;
					summaryData[order.SKU].priceCA += order.price;
            		summaryData[order.SKU].profitCA += order.profit;
					break;

				case "MX":
					summaryData[order.SKU].qtyMX += order.qty;
					summaryData[order.SKU].priceMX += order.price;
            		summaryData[order.SKU].profitMX += order.profit;
					break;
			
				default:
					summaryData[order.SKU].qtyOT += order.qty;
					summaryData[order.SKU].priceOT += order.price;
            		summaryData[order.SKU].profitOT += order.profit;
					break;
			}
        });

		const tableTitle = ordersCustomTableWindow.querySelector('.table-title');
		tableTitle.textContent = "FBA Orders Countries Summary Table ";

        const tableTitleRange = ordersCustomTableWindow.querySelector('.table-title-date-range');
        tableTitleRange.textContent = `(${virtualOrdersList[0].date.split(' ')[0]} - ${virtualOrdersList[virtualOrdersList.length - 1].date.split(' ')[0]})`;

		const tableHead = ordersCustomTableWindow.querySelector('thead');
		tableHead.innerHTML = `
			<tr>
			<th>User</th>
			<th>SKU</th>
			<th>Orders</th>

			<th class='table-us-header'>US <br>Qty</th>
			<th class='table-us-header'>US<br>%</th>
			<th class='table-us-header'>US<br>$</th>

			<th class='table-ca-header'>CA <br>Qty</th>
			<th class='table-ca-header'>CA <br>%</th>
			<th class='table-ca-header'>CA <br>$</th>

			<th class='table-mx-header'>MX <br>Qty</th>
			<th class='table-mx-header'>MX <br>%</th>
			<th class='table-mx-header'>MX <br>$</th>

			<th>OT <br>Qty</th>
			<th>OT <br>%</th>
			<th>OT <br>$</th>
			</tr>
		`;

        const tableBody = ordersCustomTableWindow.querySelector('tbody');
        tableBody.innerHTML = '';

        Object.keys(summaryData).forEach((sku) => {
            let marginUS = summaryData[sku].qtyUS == 0 ? 0 : (summaryData[sku].profitUS / summaryData[sku].priceUS * 100).toFixed(2);
			let marginCA = summaryData[sku].qtyCA == 0 ? 0 : (summaryData[sku].profitCA / summaryData[sku].priceCA * 100).toFixed(2);
			let marginMX = summaryData[sku].qtyMX == 0 ? 0 : (summaryData[sku].profitMX / summaryData[sku].priceMX * 100).toFixed(2);
			let marginOT = summaryData[sku].qtyOT == 0 ? 0 : (summaryData[sku].profitOT / summaryData[sku].priceOT * 100).toFixed(2);

            const row = document.createElement('tr');
            if ((summaryData[sku].qtyUS > 0 && marginUS < 0) || 
				(summaryData[sku].qtyCA > 0 && marginCA < 0) || 
				(summaryData[sku].qtyMX > 0 && marginMX < 0) || 
				(summaryData[sku].qtyOT > 0 && marginOT < 0)) {
				row.classList.add('custom-orders-table-row-negative-margin');
			}
			else if ((summaryData[sku].qtyUS > 0 && marginUS < 15) || 
					(summaryData[sku].qtyCA > 0 && marginCA < 15) || 
					(summaryData[sku].qtyMX > 0 && marginMX < 15) || 
					(summaryData[sku].qtyOT > 0 && marginOT < 15)) {
				row.classList.add('custom-orders-table-row-low-margin');
			}

            row.innerHTML = `
            <td class='sum-user'    >${summaryData[sku].user}</td>
            <td class='sum-sku'     >${sku}</td>
            <td class='sum-count'   >${summaryData[sku].count}</td>

            <td class='sum-qty'     >${summaryData[sku].qtyUS}</td>
            <td class='sum-margin'  >${marginUS}</td>
            <td class='sum-profit'  >${summaryData[sku].profitUS.toFixed(2)}</td>

			<td class='sum-qty'     >${summaryData[sku].qtyCA}</td>
            <td class='sum-margin'  >${marginCA}</td>
            <td class='sum-profit'  >${summaryData[sku].profitCA.toFixed(2)}</td>

			<td class='sum-qty'     >${summaryData[sku].qtyMX}</td>
            <td class='sum-margin'  >${marginMX}</td>
            <td class='sum-profit'  >${summaryData[sku].profitMX.toFixed(2)}</td>

			<td class='sum-qty'     >${summaryData[sku].qtyOT}</td>
            <td class='sum-margin'  >${marginOT}</td>
            <td class='sum-profit'  >${summaryData[sku].profitOT.toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });
	};

	const calcOrdersCustomShownSummaryTable = () => {
		calcOrdersCustomSummaryTable(virtualOrdersList.filter(order => !order.isHidden))
    };

	const calcOrdersCountriesShownSummaryTable = () => {
		calcCountriesCustomSummaryTable(virtualOrdersList.filter(order => !order.isHidden))
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
        let corp = ""
        if (window.location.href.includes('plexsupply') == true){ corp = 'PlexSupply'; }
        if (window.location.href.includes('officechase') == true){ corp = 'OfficeChase'; }
        if (window.location.href.includes('marksonsupply') == true){ corp = 'Markson'; }

        XLSX.writeFile(wb, `${corp}_Summary_Orders_${virtualOrdersList[0].date.split(' ')[0]}-${virtualOrdersList[virtualOrdersList.length - 1].date.split(' ')[0]}.xlsx`);
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
                calcOrdersHeaderStats();

            } catch (error) {
                console.error('Error loading orders:', error);
            }
        });

        document.getElementById('order-margin-filter-apply').addEventListener('click', () => {
            const margin = parseFloat(document.getElementById('order-margin-thr').value);
            const overmargin = parseFloat(document.getElementById('order-overmargin').value);
            const overmarginApply = document.getElementById('order-overmargin-apply').checked;

            applyHiddenMarginFilter(margin, overmargin, overmarginApply);
            calcOrdersHeaderStats();
        });

        document.getElementById('order-refund-filter-apply').addEventListener('click', () => {
            applyHiddenRefundFilter();
            calcOrdersHeaderStats();
        });

        document.getElementById('order-non-refund-filter-apply').addEventListener('click', () => {
            applyHiddenNonRefundFilter();
            calcOrdersHeaderStats();
        });

        document.getElementById('reset-orders-filters').addEventListener('click', () => {
            applyResetFilters();
            calcOrdersHeaderStats();
        });

        document.getElementById("orders-show-nocost-skus-apply").addEventListener('click', () => {
            applyShowNoCostFilter();
            calcOrdersHeaderStats();
        });

        document.getElementById("orders-hide-nocost-skus-apply").addEventListener('click', () => {
            applyHiddenNoCostFilter();
            calcOrdersHeaderStats();
        });

		document.getElementById("orders-show-amzngr-skus-apply").addEventListener('click', () => {
            applyShowAmznGrFilter();
            calcOrdersHeaderStats();
        });

        document.getElementById("orders-hide-amzngr-skus-apply").addEventListener('click', () => {
            applyShowNoAmznGrFilter();
            calcOrdersHeaderStats();
        });

		document.getElementById("order-non-replacement-filter-apply").addEventListener('click', () => {
            applyShowReplacementFilter();
            calcOrdersHeaderStats();
        });

		document.getElementById("order-replacement-filter-apply").addEventListener('click', () => {
            applyShowNoReplacementFilter();
            calcOrdersHeaderStats();
        });

        document.getElementById("orders-show-us-country-apply").addEventListener('click', () => {
            applyShowUSFilter();
            calcOrdersHeaderStats();
        });

		document.getElementById("orders-hide-us-country-apply").addEventListener('click', () => {
            applyShowNoUSFilter();
            calcOrdersHeaderStats();
        });

		document.getElementById("orders-show-ca-country-apply").addEventListener('click', () => {
            applyShowCAFilter();
            calcOrdersHeaderStats();
        });

		document.getElementById("orders-hide-ca-country-apply").addEventListener('click', () => {
            applyShowNoCAFilter();
            calcOrdersHeaderStats();
        });

		document.getElementById("order-show-mx-country-apply").addEventListener('click', () => {
            applyShowMXFilter();
            calcOrdersHeaderStats();
        });

		document.getElementById("order-hide-mx-country-apply").addEventListener('click', () => {
            applyShowNoMXFilter();
            calcOrdersHeaderStats();
        });

		document.getElementById("order-show-other-country-apply").addEventListener('click', () => {
            applyShowOtherCountryFilter();
            calcOrdersHeaderStats();
        });

		document.getElementById("order-hide-other-country-apply").addEventListener('click', () => {
            applyShowNoOtherCountryFilter();
            calcOrdersHeaderStats();
        });

        floatingWindow.querySelector('.custom-close-btn').addEventListener('click', () => hideWindow(floatingWindow));

		document.getElementById('orders-calculate-shown-sku').addEventListener('click', () => {
			// hideWindow(ordersCustomTableWindow);
            showWindow(ordersCustomTableWindow);
            calcOrdersCustomShownSummaryTable();
            makeTableSortable(ordersCustomTableWindow.querySelector('.custom-orders-table'));
        });

		document.getElementById('orders-calculate-country-sku').addEventListener('click', () => {
            // hideWindow(ordersCustomTableWindow);
            showWindow(ordersCustomTableWindow);
            calcOrdersCountriesShownSummaryTable();
            makeTableSortable(ordersCustomTableWindow.querySelector('.custom-orders-table'));
        });

        ordersCustomTableWindow.querySelector('.custom-close-btn').addEventListener('click', () => hideWindow(ordersCustomTableWindow));

        ordersCustomTableWindow.querySelector('#orders-export-xlsx').addEventListener('click', () => {
            exportCustomSummaryTableToXLSX(ordersCustomTableWindow.querySelector('.custom-orders-table'));
        });

        document.querySelector('.custom-filters-button').addEventListener('click', () => {
			if (floatingWindow.style.display != 'block'){
				showWindow(floatingWindow);
			}
        });
    };

    const handleKeyPress = (e) => {
        try{
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyL') {
                e.preventDefault();
                showWindow(floatingWindow);
                return;
            }

            if (e.key === 'Escape') {
                if (ordersCustomTableWindow.style.display === 'block') {
                    hideWindow(ordersCustomTableWindow);
                } else if (floatingWindow.style.display === 'block') {
                    hideWindow(floatingWindow);
                }
                return;
            }
        } catch (error) {
            console.error('+++ Error on key press:', error);
        }
    };

    initEventListeners();

    floatingWindow.addEventListener('click', (e) => e.stopPropagation());
})(settingsJSON, role);