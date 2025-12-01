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

		addEstBlackPrice(config);
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

		let table = null
		let rows = [];

		while ( rows.length === 0 && attempts < maxAttempts) {
			table = document.querySelector("table");
			
			if (table) {
				let tbody = table.querySelector("tbody")
				rows = tbody.querySelectorAll(".accDS");
			}

			if (rows.length === 0) {
				attempts++;
				console.log(`== [${SCRIPT_ID}] Попытка ${attempts}/${maxAttempts}`);
                await new Promise(resolve => setTimeout(resolve, waitInterval));
			}
		}

		if (rows.length === 0) {
            console.warn(`== [${SCRIPT_ID}] Таблица не загружена за ${maxAttempts * waitInterval}мс — пропуск addEstBlackPrice`);
            return;
        }

		console.log("====== Начало добавления Estimated Black Price ======");
		console.log("====== " + "addEstBlackPrice: " + config.addEstBlackPrice);
		console.log("====== " + "blackPriceMltp: " + config.blackPriceMltp);
		console.log(rows);

	}

	main();
})(settingsJSON, role);