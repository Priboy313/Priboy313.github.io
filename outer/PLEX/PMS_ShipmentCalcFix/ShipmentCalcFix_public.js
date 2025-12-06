// ShipmentCalcFix_public.js
(function(settingsJSON, role = "user") {

	const SCRIPT_ID = 'shipmentCalcFix';

	const ROLE = role;

	const DEFAULTS  = {
		addEstBlackPrice: false,
		blackPriceMltp: 1.3,
	};


	function loadConfig() {
		console.log(`== [${SCRIPT_ID}] Обработка полученной конфигурации...`, settingsJSON);
		
        let settingsData = {};
        try {
            if (settingsJSON && typeof settingsJSON === 'string') {
                settingsData = JSON.parse(settingsJSON);
            }
        } catch (e) {
            console.error(`== [${SCRIPT_ID}] Ошибка парсинга JSON-строки настроек:`, e);
            console.warn(`== [${SCRIPT_ID}] Используются настройки по умолчанию.`);
            return DEFAULTS;
        }

		const mySavedSettings = settingsData[SCRIPT_ID] || {};
		console.log(`== [${SCRIPT_ID}] Получены настройки для этого скрипта:`, mySavedSettings);
		
		const finalConfig = { ...DEFAULTS, ...mySavedSettings };
		console.log(`== [${SCRIPT_ID}] Финальный конфиг после слияния:`, finalConfig);
		
		return finalConfig;
	}

	function runImmediate(config){
		console.log(`== [${SCRIPT_ID}] Выполнение немедленных задач...`);
	}

	async function runOnLoad(config) {
		console.log(`== [${SCRIPT_ID}] Выполнение задач после загрузки DOM...`);

		if (config.addEstBlackPrice) {
			addEstBlackPrice(config);
		}
	}

	async function main() {
		console.log(`== [${SCRIPT_ID}] Запуск основной функции...`);

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

	async function addEstBlackPrice(config) {
		let attempts = 0;
		const maxAttempts = 50;
		const waitInterval = 200;

		const dataRowsClass = "accDS";

		const redRIndex = -3;
		const blackRIndex = -2;

		let dataRows = [];

		while (dataRows.length === 0 && attempts < maxAttempts) {
			dataRows = document.querySelectorAll(`.${dataRowsClass}`);

			if (dataRows.length === 0) {
				attempts++;
				console.log(`== [${SCRIPT_ID}] Попытка ${attempts}/${maxAttempts}`);
                await new Promise(resolve => setTimeout(resolve, waitInterval));
			}
		}

		if (dataRows.length === 0) {
            console.warn(`== [${SCRIPT_ID}] Таблица не загружена за ${maxAttempts * waitInterval}мс — пропуск addEstBlackPrice`);
            return;
        }

		dataRows.forEach(row => {
			const subtable = row.querySelector('table');
			const cells = subtable.querySelectorAll('td');
			
			const redCell = cells[cells.length + redRIndex];
			const blackCell = cells[cells.length + blackRIndex];

			const redCellPriceSpan = redCell.querySelector('span');
			let redPrice = redCellPriceSpan.textContent.replace("$", "").replace(",", "").trim();
			redPrice = parseFloat(redPrice);

			const blackCellPriceSpan = blackCell.querySelector('span');

			let result = `<br>(EstNLP: \$${(redPrice * config.blackPriceMltp).toFixed(2)})`;

			blackCellPriceSpan.innerHTML += result;
		});
	}

	main();
})(settingsJSON, role);