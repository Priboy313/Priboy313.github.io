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

	function addEstBlackPrice(config) {
		const table = document.querySelector('tbody');

		const rows = table.querySelectorAll('.accDS');

		console.log("====== Начало добавления Estimated Black Price ======");
		console.log("====== " + "addEstBlackPrice: " + config.addEstBlackPrice);
		console.log("====== " + "blackPriceMltp: " + config.blackPriceMltp);
		console.log(rows);

	}

	main();
})(settingsJSON, role);