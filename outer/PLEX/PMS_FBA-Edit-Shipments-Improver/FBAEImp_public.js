// FBAEImp_public.js
(function(settingsJSON, role = "user") {

	const SCRIPT_ID = 'fbaEditShipmentsImprover';

	const ROLE = role;

	const DEFAULTS  = {
		calcPOSummaryTable: false,
		showShipmentInfo: false
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

			if (config.showShipmentInfo) {
				setShipmentsInfo();
			}
			
			if (config.calcPOSummaryTable) {
				calcPOSummaryTable();
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
				if (!poData.has(data.po)) {
					poData.set(data.po, [ [], [] ]);
				}

				poData.get(data.po)[0].push(data.shipped);
				poData.get(data.po)[1].push(data.received);
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
						<th>Summ<br>Ship</th>
						<th>Summ<br>Rec</th>
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


	function setShipmentsInfo() {

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

		let rawShipData = getRawShipmentsData();

		if (rawShipData[0] == false) {
			return;
		}

		let valRawShipData = validateRawShipments(rawShipData[1]);

		print(valRawShipData);
	}


	function print(...args){
		if (ROLE == "dodev"){
			console.log(`==== [${SCRIPT_ID}]`, ...args);
		}
	}

	main();
})(settingsJSON, role);