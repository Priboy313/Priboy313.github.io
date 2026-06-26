// FBAEImp_public.js
(function(settingsJSON, role = "user") {

	const SCRIPT_ID = 'fbaEditShipmentsImprover';

	const ROLE = role;

	const DEFAULTS  = {
		calcPOSummaryTable: true,
		makePOTableInteractable: false,
		showShipmentInfo: true
	};

	const DOMEN_TRANSFER_URLS = {
		"PL": "https://pms.plexsupply.com/pms/fbatransferlist.xhtml?listajax&iDisplayStart=0&iDisplayLength=20&iSortCol_0=2&sSortDir_0=desc&sSearch=",
		"OC": "https://pms.officechase.com/pms/fbatransferlist.xhtml?listajax&iDisplayStart=0&iDisplayLength=20&iSortCol_0=2&sSortDir_0=desc&sSearch=",
		"MK": "https://pms.marksonsupply.com/pms/fbatransferlist.xhtml?listajax&iDisplayStart=0&iDisplayLength=20&iSortCol_0=2&sSortDir_0=desc&sSearch="
	};

	function loadConfig() {
		print(`[Обработка полученной конфигурации...`, settingsJSON);
		
        let settingsData = {};
        try {
            if (settingsJSON && typeof settingsJSON === 'string') {
                settingsData = JSON.parse(settingsJSON);
            }
        } catch (e) {
            print(`Ошибка парсинга JSON-строки настроек:`, e);
            print(`Используются настройки по умолчанию.`);
            return DEFAULTS;
        }

		const mySavedSettings = settingsData[SCRIPT_ID] || {};
		print(`Получены настройки для этого скрипта:`, mySavedSettings);
		
		const finalConfig = { ...DEFAULTS, ...mySavedSettings };
		print(`Финальный конфиг после слияния:`, finalConfig);
		
		return finalConfig;
	}

	let config;

	function runImmediate(config){
		print(`Выполнение немедленных задач...`);

		addCustomCSS();
	}

	async function runOnLoad(config) {
		print(`Выполнение задач после загрузки DOM...`);

		let extractResult = extractRawTableData();

		if (extractResult) {

			if (config.calcPOSummaryTable) {
				calcPOSummaryTable();
			}

			if (config.showShipmentInfo) {
				await setShipmentsInfo();
			}

		}
	}

	async function main() {
		const config = loadConfig();

		runImmediate(config);

		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => {
				runOnLoad(config);
			});
		} else {
			runOnLoad(config);
		}
	}

	let RAW_SHIPMENTS_TABLE = new Map();

	function extractRawTableData() {
		let shipmentTable = document.body.querySelectorAll("table.t-blue")[1];
		
		if (!shipmentTable) {
			print("Таблица шипментов не найдена");
			return false;
		}

		let shipmentTableRows = shipmentTable.querySelectorAll("tbody tr");

		if (shipmentTableRows.length < 1) {
			print("В таблице шипментов не найдено строк");
			return false;
		}

		RAW_SHIPMENTS_TABLE.clear();

		for (let i = 0; i < shipmentTableRows.length; i++) {
			let row = shipmentTableRows[i];
			let cells = row.querySelectorAll("td");

			if (cells.length < 14) {
				continue;
			}

			let shipment = cells[0]?.querySelector("a")?.innerText || "error_shipment";
			let po = cells[1]?.querySelector("input")?.value || "error_po";
			let shipped = cells[9]?.querySelector("input")?.value || 0;
			let received = cells[10]?.innerText.trim() || 0;
			let shipmentStatus = cells[11]?.innerText.trim() || "error_status";

			shipped = parseInt(shipped, 10) || 0;
			received = parseInt(received, 10) || 0;

			RAW_SHIPMENTS_TABLE.set(shipment, {
				po: po,
				shipped: shipped,
				received: received,
				shipment_status: shipmentStatus
			});
		}

		return true;
	}


	function calcPOSummaryTable() {

		function getPOData() {
			let poData = new Map();

			if (RAW_SHIPMENTS_TABLE.size < 1) {
				return [false, poData]
			}

			RAW_SHIPMENTS_TABLE.forEach((data, key) => {

				if (data.shipment_status != "CANCELLED"){

					if (!poData.has(data.po)) {
						poData.set(data.po, [ [], [] ]);
					}
	
					poData.get(data.po)[0].push(data.shipped);
					poData.get(data.po)[1].push(data.received);
				}
			});

			return [true, poData];
		}

		function validatePOData(poData) {
			let poDataValidate = new Map();
			
			poData.forEach((data, key) => {
				let shippedSum = data[0].reduce((acc, curr) => acc + curr, 0);
				let receivedSum = data[1].reduce((acc, curr) => acc + curr, 0);

				poDataValidate.set(key, [shippedSum, receivedSum]);
			});

			return poDataValidate;
		}

		function createTable(poData){

			let poStr = "";

			const summaryTable = document.createElement('table');
			summaryTable.className = 'edit-fba-table t-blue custom-po-summary-table';
			summaryTable.style.marginLeft = '2.5%';
			summaryTable.style.width = '20%';

			poData.forEach((data, key) => {
				let shipped = data[0];
				let received = data[1];
				let diff = received - shipped;

				poStr += `
				<tr>
					<td>${key}</td>
					<td>${shipped}</td>
					<td>${received}</td>
					<td>${diff}</td>
				</tr>`
			});

			summaryTable.innerHTML = `
				<thead>
					<tr>
						<th>PO Num.</th>
						<th>Summ<br>Shipped</th>
						<th>Summ<br>Received</th>
						<th>Diff</th>
					</tr>
				</thead>
				<tbody>
					${poStr}
				</tbody>
			`;

			const targetSpan = document.body.querySelector('span[style*="font-size: 1.5em"]') || document.body.querySelector('span');

			if (targetSpan) {
				targetSpan.insertAdjacentElement('afterend', summaryTable);
				makeTableCollapsible(summaryTable);

				if(config.makePOTableInteractable){
					makeTableInteractable(summaryTable);
				}
			} else {
				print('Целевой span не найден');
			}
		}
		

		let poData = getPOData();

		if (poData[0] == false) {
			return;
		}

		let validatedData = validatePOData(poData[1]);

		createTable(validatedData);
	}


	async function setShipmentsInfo() {

		function getRawShipmentsData() {
			let rawShipData = new Map();

			if (RAW_SHIPMENTS_TABLE.size < 1) {
				print("Нет шипментов для обработки")
				return [false, rawShipData]
			}

			RAW_SHIPMENTS_TABLE.forEach((data, key) => {
				rawShipData.set(
					key, 
					{
						shipped: data.shipped, 
						shipment_status: data.shipment_status
					}
				);
			});

			return [true, rawShipData];
		}

		function validateRawShipments(rawShipmentsData) {
			let valShipments = new Map();

			rawShipmentsData.forEach((data, key) => {
				if (data.shipment_status != "CANCELLED") {
					valShipments.set(key, {shipped: data.shipped});
				}
			});

			return valShipments;
		}

		async function fetchTransferData(shipments) {

			if (!shipments || shipments.length === 0) {
				print("Список шипментов для сетевых запросов пуст.");
				return [];
			}

			let comp = "";
			const location = window.location.href;

			if (location.includes("plexsupply")) {
				comp = "PL";
			}
			
			if (location.includes("officechase")) {
				comp = "OC";
			}
			
			if (location.includes("marksonsupply")) {
				comp = "MK";
			}

			if (!comp) {
				print("Не удалось определить компанию для запроса шипментов:", location);
				return [];
			}

			const baseUrl = DOMEN_TRANSFER_URLS[comp];

			print(`Запуск параллельных запросов для ${shipments.length} шипментов...`);

			const startTime = performance.now();

			const promises = shipments.map(shipment => {
				const requestUrl = baseUrl + encodeURIComponent(shipment);

				return fetch(requestUrl)
					.then(response => {
						if (!response.ok) throw new Error(`Status: ${response.status}`);
						return response.json();
					})
					.catch(error => {
						print(`Ошибка запроса по шипменту "${shipment}":`, error);
						return { aaData: [] };
					});
			});

			try {
				const results = await Promise.all(promises);
				const duration = performance.now() - startTime;
				print(`Все запросы к Transfer List выполнены за ${duration.toFixed(0)} мс.`);

				const combinedData = results.flatMap(res => res.aaData || []);
				print(`Объединенные данные Transfer List (строк: ${combinedData.length}):`, combinedData);

				return combinedData;
			} catch (error) {
				print("Критическая ошибка параллельных запросов:", error);
				return [];
			}

		}

		function createTranferTable(tranferData, valRawShipData) {

			let tranferStr = "";

			const tranferTable = document.createElement('table');
			tranferTable.className = 'edit-fba-table t-blue custom-po-tranfer-table';
			tranferTable.style.marginLeft = '2.5%';
			tranferTable.style.width = '40%';

			tranferData.forEach(shipment => {
				let name = shipment[1];
				let shippedQty = valRawShipData.get(name)?.shipped || 0;
				let perUnitCost = shipment[8];

				let cleanPerUnitCost = typeof perUnitCost === 'string' 
					? parseFloat(perUnitCost.replace(/[^0-9.-]+/g, "")) 
					: parseFloat(perUnitCost);
				
				cleanPerUnitCost = isNaN(cleanPerUnitCost) ? 0 : cleanPerUnitCost;
				
				let shippingCost = cleanPerUnitCost * shippedQty;

				let displayPerUnitCost = cleanPerUnitCost.toFixed(2);
				let displayShippingCost = shippingCost.toFixed(2);

				let status = shipment[15];

				tranferStr += `
					<tr>
						<td>${name}</td>
						<td>${displayPerUnitCost}</td>
						<td>${displayShippingCost}</td>
						<td>${status}</td>
					</tr>
				`;
			});

			tranferTable.innerHTML = `
				<thead>
					<tr>
						<th>Shipment</th>
						<th>PerUnit<br>Cost</th>
						<th>Shipping<br>Cost</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					${tranferStr}
				</tbody>
			`;

			const summaryTable = document.body.querySelector('.custom-po-summary-table');

			const summaryAnchor = (summaryTable && summaryTable.nextElementSibling && summaryTable.nextElementSibling.classList.contains('custom-table-toggle-container'))
				? summaryTable.nextElementSibling
				: summaryTable;

			const target = summaryAnchor
							|| document.body.querySelector('span[style*="font-size: 1.5em"]')
							|| document.body.querySelector('span');

			if (target) {
				target.insertAdjacentElement('afterend', tranferTable);
				makeTableCollapsible(tranferTable);
			} else {
				print('Целевой span не найден');
			}
		}


		let rawShipData = getRawShipmentsData();

		if (rawShipData[0] == false) {
			return;
		}

		let valRawShipData = validateRawShipments(rawShipData[1]);

		const tranferListData = await fetchTransferData(Array.from(valRawShipData.keys()));

		createTranferTable(tranferListData, valRawShipData);
	}


	function makeTableCollapsible(table, chunkSize = 5) {
		const tbody = table.querySelector('tbody');
		if (!tbody) return;

		const rows = Array.from(tbody.querySelectorAll('tr'));
		if (rows.length <= chunkSize) return;

		let visibleCount = chunkSize;

		function applyButtonStyle(btn) {
			btn.type = 'button';
			btn.style.padding = '5px 14px';
			btn.style.backgroundColor = '#f4f4f4';
			btn.style.border = '1px solid #ccc';
			btn.style.borderRadius = '3px';
			btn.style.cursor = 'pointer';
			btn.style.fontSize = '12px';
		}

		const container = document.createElement('div');
		container.className = 'custom-table-toggle-container';
		container.style.display = 'flex';
		container.style.gap = '10px';
		container.style.marginLeft = '2.5%';
		container.style.marginTop = '8px';
		container.style.marginBottom = '20px';

		const showMoreButton = document.createElement('button');
		applyButtonStyle(showMoreButton);

		const showLessButton = document.createElement('button');
		applyButtonStyle(showLessButton);

		container.appendChild(showMoreButton);
		container.appendChild(showLessButton);

		function updateUI() {
			rows.forEach((row, index) => {
				row.style.display = index < visibleCount ? '' : 'none';
			});

			const remaining = rows.length - visibleCount;
			if (remaining > 0) {
				showMoreButton.style.display = 'block';
				const nextChunk = Math.min(chunkSize, remaining);
				showMoreButton.innerText = `Показать еще (+${nextChunk})`;
			} else {
				showMoreButton.style.display = 'none';
			}

			if (visibleCount > chunkSize) {
				showLessButton.style.display = 'block';
				const prevChunk = Math.min(chunkSize, visibleCount - chunkSize);
				showLessButton.innerText = `Скрыть (-${prevChunk})`;
			} else {
				showLessButton.style.display = 'none';
			}
		}

		showMoreButton.addEventListener('click', () => {
			visibleCount = Math.min(visibleCount + chunkSize, rows.length);
			updateUI();
		});

		showLessButton.addEventListener('click', () => {
			visibleCount = Math.max(visibleCount - chunkSize, chunkSize);
			updateUI();
		});

		updateUI();

		table.insertAdjacentElement('afterend', container);
	}

	function makeTableInteractable(table) {
		const cells = table.querySelectorAll('tbody tr td');

		cells.forEach(cell => {
			const text = cell.innerText.trim();
			const cleanText = text.replace(/[^0-9.-]+/g, "");
			const val = parseFloat(cleanText);
			
			if (text !== "" && !isNaN(val) && cell.cellIndex !== 0) {
				cell.classList.add('plx-selectable-cell');
			}
		});

		let isSelecting = false;

		table.addEventListener('mousedown', (e) => {
			const cell = e.target.closest('.plx-selectable-cell');
			if (!cell) return;

			isSelecting = true;

			if (!e.ctrlKey && !e.metaKey) {
				document.querySelectorAll('.plx-selectable-cell.selected').forEach(c => c.classList.remove('selected'));
			}

			cell.classList.toggle('selected');
			updateSumWidget();
			e.preventDefault();
		});

		table.addEventListener('mouseover', (e) => {
			if (!isSelecting) return;
			const cell = e.target.closest('.plx-selectable-cell');
			if (!cell) return;

			cell.classList.add('selected');
			updateSumWidget();
		});

		const stopSelection = () => {
			isSelecting = false;
		};

		window.addEventListener('mouseup', stopSelection);
		
		const handleKeyDown = (e) => {
			if (e.key === 'Escape') {
				document.querySelectorAll('.plx-selectable-cell.selected').forEach(c => c.classList.remove('selected'));
				updateSumWidget();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
	}

	function updateSumWidget() {
		let widget = document.getElementById('plx-sum-widget');
		if (!widget) {
			widget = document.createElement('div');
			widget.id = 'plx-sum-widget';
			widget.className = 'plx-sum-widget';
			widget.style.display = 'none';
			document.body.appendChild(widget);
		}

		const selectedCells = document.querySelectorAll('.plx-selectable-cell.selected');
		if (selectedCells.length === 0) {
			widget.style.display = 'none';
			return;
		}

		let sum = 0;
		let count = 0;

		selectedCells.forEach(cell => {
			const cleanText = cell.innerText.trim().replace(/[^0-9.-]+/g, "");
			const val = parseFloat(cleanText);
			if (!isNaN(val)) {
				sum += val;
				count++;
			}
		});

		widget.innerHTML = `
			<span>Выделено ячеек: <strong>${count}</strong> | Сумма: <strong>${Number(sum.toFixed(2))}</strong></span>
			<span class="plx-sum-widget-close" title="Сбросить выделение (Esc)">✖</span>
		`;
		widget.style.display = 'flex';

		widget.querySelector('.plx-sum-widget-close').onclick = () => {
			document.querySelectorAll('.plx-selectable-cell.selected').forEach(c => c.classList.remove('selected'));
			widget.style.display = 'none';
		};
	}

	function addCustomCSS() {
		const customStyle = document.createElement('style');
			customStyle.id = `custom-${SCRIPT_ID}-css`;
			customStyle.innerHTML = `/* Custom ${SCRIPT_ID} CSS */`;

			if (config.makePOTableInteractable) {
				customStyle.innerHTML += `
					.plx-selectable-cell {
						cursor: pointer;
						user-select: none; /* Отключает стандартное выделение синим текстом при протягивании */
						transition: background-color 0.1s;
					}
					.plx-selectable-cell:hover {
						background-color: rgba(0, 123, 255, 0.08) !important;
					}
					.plx-selectable-cell.selected {
						background-color: #b4dbff !important;
						outline: 1px solid #007bff;
					}
					.plx-sum-widget {
						position: fixed;
						bottom: 25px;
						right: 25px;
						background: #212529;
						color: #fff;
						padding: 10px 16px;
						border-radius: 8px;
						box-shadow: 0 4px 12px rgba(0,0,0,0.25);
						font-size: 14px;
						font-family: Arial, sans-serif;
						z-index: 2147483647;
						display: flex;
						align-items: center;
						gap: 12px;
						border: 1px solid #343a40;
					}
					.plx-sum-widget-close {
						cursor: pointer;
						font-weight: bold;
						color: #dc3545;
						font-size: 16px;
						line-height: 1;
						transition: color 0.15s;
					}
					.plx-sum-widget-close:hover {
						color: #ffc107;
					}
				`;
			}

			document.head.appendChild(customStyle);
	}

	function print(...args){
		if (ROLE == "dodev"){
			console.log(`==== [${SCRIPT_ID}]`, ...args);
		}
	}

	main();
})(settingsJSON, role);