(function(settingsJSON, role = "user", GM_getValue, GM_setValue, CONFIG) {
	'use strict';

	const SCRIPT_ID = 'sampleWorker';
	const ROLE = role;

	const DEFAULTS = {
		enableFeature: true,
		highlightColor: "#e0f2fe",
		hideAnnoyingElements: true
	};

	let config;

	function print(...args) {
		if (ROLE === "dodev") {
			console.log(`==== [${SCRIPT_ID}]`, ...args);
		}
	}

	function loadConfig() {
		print('Обработка полученной конфигурации...', settingsJSON);
		let settingsData = {};
		try {
			if (settingsJSON && typeof settingsJSON === 'string') {
				settingsData = JSON.parse(settingsJSON);
			}
		} catch (e) {
			print('Ошибка парсинга JSON настроек. Используются defaults.', e);
			return DEFAULTS;
		}

		const finalConfig = { ...DEFAULTS, ...settingsData };
		print('Финальный конфиг:', finalConfig);
		return finalConfig;
	}

	function addCustomCSS() {
		const customStyle = document.createElement('style');
		customStyle.id = `custom-${SCRIPT_ID}-css`;
		customStyle.innerHTML = `/* Custom ${SCRIPT_ID} CSS */`;

		if (config.enableFeature) {
			customStyle.innerHTML += `
				.nexus-highlight {
					background-color: ${config.highlightColor} !important;
					transition: background-color 0.2s ease;
				}
			`;
		}

		if (config.hideAnnoyingElements) {
			customStyle.innerHTML += `
				.banner, .ad-unit, #promobar {
					display: none !important;
				}
			`;
		}

		document.head.appendChild(customStyle);
		print('Стили внедрены в DOM');
	}

	function runImmediate() {
		print('Выполнение немедленных задач (Awake)...');
		addCustomCSS();
	}

	async function runOnLoad() {
		print('Выполнение задач после загрузки DOM (Start)...');

		if (config.enableFeature) {
			processTargetElements();
		}
	}

	function processTargetElements() {
		const targetElements = document.querySelectorAll('table, .target-block');
		targetElements.forEach(el => {
			el.classList.add('nexus-highlight');
		});
		print(`Обработано элементов: ${targetElements.length}`);
	}

	function main() {
		config = loadConfig();
		runImmediate();

		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', runOnLoad);
		} else {
			runOnLoad();
		}
	}

	main();
})(settingsJSON, role, GM_getValue, GM_setValue, CONFIG);