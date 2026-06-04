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

		if (config.calcPOSummaryTable) {
			calcPOSummaryTable()
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


	function calcPOSummaryTable() {

		function getPOData() {
			let poData = {}

			let shipmentTable = document.body.querySelectorAll("table.t-blue")[1];

			if (!shipmentTable) {
				print("Таблица шипментов не найдена");
				return [false, poData];
			}

			let shipmentTableRows = shipmentTable.querySelectorAll("tbody tr");

			if (shipmentTableRows.length < 1) {
				return [false, poData];
			}

			shipmentTableRows.forEach(row => {
				let cells = row.querySelectorAll("td");

				if (cells.length < 11) {
					return;
				}

				let po = cells[1]?.querySelector("input")?.value || "no";
				let shipped = cells[9]?.querySelector("input")?.value || 0;
				let received = cells[10]?.innerText.trim() || 0;

				if (po == "no") {
					return;
				}

				shipped = parseInt(shipped, 10) || 0;
				received = parseInt(received, 10) || 0;

				if (!poData[po]) {
					poData[po] = [ [], [] ];
				}

				poData[po][0].push(shipped);
				poData[po][1].push(received);
			});

			return [true, poData];
		}

		function validatePOData(poData) {
			let poDataValidate = {};
			
			Object.keys(poData).forEach(key => {
				let data = poData[key];

				let shippedSum = data[0].reduce((acc, curr) => acc + curr, 0);
				let receivedSum = data[1].reduce((acc, curr) => acc + curr, 0);

				if (!poDataValidate[key]) {
					poDataValidate[key] = [shippedSum, receivedSum];
				}
			})

			return poDataValidate;
		}

		function createTable(poData){

			let poStr = "";

			const summaryTable = document.createElement('table');
			summaryTable.className = 'edit-fba-table t-blue';
			summaryTable.style.marginLeft = '2.5%';
			summaryTable.style.width = '20%';

			Object.keys(poData).forEach(key => {
				let data = poData[key];
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
						<th>Sum.Ship</th>
						<th>Sum.Rec</th>
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

		poData = validatePOData(poData[1]);

		createTable(poData);
	}


	function print(...args){
		if (ROLE == "dodev"){
			console.log(`==== [${SCRIPT_ID}]`, ...args);
		}
	}

	main();
})(settingsJSON, role);