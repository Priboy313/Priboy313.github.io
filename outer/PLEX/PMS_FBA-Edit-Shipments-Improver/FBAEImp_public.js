// FBAEImp_public.js
(function(settingsJSON, role = "user") {

	const SCRIPT_ID = 'fbaEditShipmentsImprover';

	const ROLE = role;

	const DEFAULTS  = {
		calcPOSummaryTable: true,
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
				rawShipData.set(key, data.shipment_status);
			});

			return [true, rawShipData];
		}

		function validateRawShipments(rawShipmentsData) {
			let valShipments = [];

			rawShipmentsData.forEach((data, key) => {
				if (data != "CANCELLED") {
					valShipments.push(key);
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

		function createTranferTable(tranferData) {

			let tranferStr = "";

			const tranferTable = document.createElement('table');
			tranferTable.className = 'edit-fba-table t-blue custom-po-tranfer-table';
			tranferTable.style.marginLeft = '2.5%';
			tranferTable.style.width = '40%';

			tranferData.forEach(shipment => {
				let name = shipment[1];
				let perUnitCost = shipment[8];
				let shippingCost = shipment[7];
				let status = shipment[15];

				tranferStr += `
					<tr>
						<td>${name}</td>
						<td>${perUnitCost}</td>
						<td>${shippingCost}</td>
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

			const summaryAnchor = (summaryTable && summaryTable.nextElementSibling && summaryTable.nextElementSibling.classList.contains('custom-table-toggle-btn'))
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

		const tranferListData = await fetchTransferData(valRawShipData);

		createTranferTable(tranferListData);
	}


	function makeTableCollapsible(table, chunkSize = 5) {
		const tbody = table.querySelector('tbody');
		if (!tbody) return;

		const rows = Array.from(tbody.querySelectorAll('tr'));
		if (rows.length <= chunkSize) return;

		let isExpanded = false;

		rows.forEach((row, index) => {
			if (index >= chunkSize) {
				row.style.display = 'none';
			}
		});

		const toggleButton = document.createElement('button');
		toggleButton.type = 'button';
		toggleButton.className = 'custom-table-toggle-btn';
		
		toggleButton.style.display = 'block';
		toggleButton.style.marginTop = '8px';
		toggleButton.style.marginBottom = '20px';
		toggleButton.style.marginLeft = '2.5%';
		toggleButton.style.padding = '5px 14px';
		toggleButton.style.backgroundColor = '#f4f4f4';
		toggleButton.style.border = '1px solid #ccc';
		toggleButton.style.borderRadius = '3px';
		toggleButton.style.cursor = 'pointer';
		toggleButton.style.fontSize = '12px';
		toggleButton.innerText = `Показать еще (${rows.length - chunkSize})`;

		toggleButton.addEventListener('click', () => {
			isExpanded = !isExpanded;
			rows.forEach((row, index) => {
				if (index >= chunkSize) {
					row.style.display = isExpanded ? '' : 'none';
				}
			});
			toggleButton.innerText = isExpanded ? 'Скрыть' : `Показать еще (${rows.length - chunkSize})`;
		});

		table.insertAdjacentElement('afterend', toggleButton);
	}

	function print(...args){
		if (ROLE == "dodev"){
			console.log(`==== [${SCRIPT_ID}]`, ...args);
		}
	}

	main();
})(settingsJSON, role);