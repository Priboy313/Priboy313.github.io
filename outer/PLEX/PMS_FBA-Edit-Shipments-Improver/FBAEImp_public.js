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
		console.log(`== [${SCRIPT_ID}] Выполнение немедленных задач...`);

	}

	async function runOnLoad(config) {
		console.log(`== [${SCRIPT_ID}] Выполнение задач после загрузки DOM...`);

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


	function print(...args){
		if (ROLE == "dodev"){
			console.log(`==== [${SCRIPT_ID}]`, ...args);
		}
	}

	main();
})(settingsJSON, role);