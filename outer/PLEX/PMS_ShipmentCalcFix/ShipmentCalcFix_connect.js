// ==UserScript==
// @name         Shipping Calculator Fix
// @version      1.0
// @description  Shipping Calculator Fix
// @author       Priboy313
// @match        https://pms.plexsupply.com/pms/shippingcalculator.xhtml
// @match        https://pms.officechase.com/pms/shipmentcalculator.xhtml
// @match        https://pms.marksonsupply.com/pms/shipmentcalculator.xhtml
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @connect      cdn.jsdelivr.net
// @connect      api.github.com
// @icon         https://www.google.com/s2/favicons?sz=64&domain=plexsupply.com
// ==/UserScript==

(function() {
	'use strict';
	if (window.isAmznWvConnectorRunning) return;
	window.isAmznWvConnectorRunning = true;

	const SCRIPT_NAME = "shipmentCalcFix_connector";
	const GITHUB_TOKEN = ["ghp", "_", "wVRDKQSzZ44XYB", "uyoo", "JSKSF9", "im", "JVfN2XhiZN"].join("");
	const GITHUB_API_URL = 'https://api.github.com/repos/Priboy313/Priboy313.github.io/commits/main';
	const SCRIPT_URL_TEMPLATE = 'https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@{commit_hash}/outer/PLEX/PMS_ShipmentCalcFix/ShipmentCalcFix_public.js';
	
	const CACHE_KEY = 'shipmentCalcFix-connector-cache';
	const GLOBAL_SETTINGS_KEY = '__PLEX_SCRIPT_SETTINGS__';
	const CACHE_DURATION_MS = 5 * 60 * 1000;
	const ROLE = 'user';

	function getSettingsFromProvider(timeout = 5000) {
		return new Promise((resolve, reject) => {
			let elapsedTime = 0;
			const interval = 100;

			const checkInterval = setInterval(() => {
				if (unsafeWindow[GLOBAL_SETTINGS_KEY] && typeof unsafeWindow[GLOBAL_SETTINGS_KEY] === 'object') {
					clearInterval(checkInterval);
					resolve(unsafeWindow[GLOBAL_SETTINGS_KEY]);
				}
				
				elapsedTime += interval;
				if (elapsedTime >= timeout) {
					clearInterval(checkInterval);
					console.warn(`[${SCRIPT_NAME}] Не дождался настроек от поставщика за ${timeout} мс. Возможно, скрипт "Plex Scripts Settings Manager" отключен или неисправен.`);
					resolve({});
				}
			}, interval);
		});
	}

	async function main() {
		try {
			const settingsObject = await getSettingsFromProvider();
			const settingsJSON = JSON.stringify(settingsObject);
			
			console.log(`[${SCRIPT_NAME}] Получены настройки от поставщика и передаются в воркер:`, settingsJSON);
			
			const url = await getWorkerURL();
			await downloadAndExecuteWorker(url, settingsJSON, ROLE);

		} catch (error) {
			console.error(`[${SCRIPT_NAME}] Критическая ошибка:`, error);
			GM_setValue(CACHE_KEY, null);
			console.log(`[${SCRIPT_NAME}] Кэш URL воркера был очищен из-за ошибки.`);
		}
	}

	function getWorkerURL() {
		return new Promise((resolve, reject) => {
			const cachedData = GM_getValue(CACHE_KEY, null);
			if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION_MS)) {
				resolve(cachedData.url);
				return;
			}

			let headers = {
				"Accept": "application/vnd.github.v3+json",
				"Authorization": `token ${GITHUB_TOKEN}`
			};
				
			GM_xmlhttpRequest({
				method: 'GET', url: GITHUB_API_URL,
				headers: headers,
				onload: res => {
					if (res.status !== 200) return reject(new Error(`Ошибка API GitHub: ${res.status}`));
					try {
						const hash = JSON.parse(res.responseText).sha;
						const url = SCRIPT_URL_TEMPLATE.replace('{commit_hash}', hash);
						GM_setValue(CACHE_KEY, { url: url, timestamp: Date.now() });
						resolve(url);
					} catch (err) { reject(err); }
				},
				onerror: () => reject(new Error('Сетевая ошибка при запросе к API GitHub.'))
			});
		});
	}

	function downloadAndExecuteWorker(url, settingsJSON, role = 'user') {
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: 'GET', url: url,
				onload: res => {
					if (res.status === 200 && res.responseText) {
						try {
							const workerCode = res.responseText;
							const workerFunction = new Function('settingsJSON', 'role', workerCode);
							workerFunction(settingsJSON, role);
							resolve();
						} catch (err) { reject(new Error(`Ошибка выполнения кода воркера: ${err}`)); }
					} else { 
						reject(new Error(`Ошибка загрузки воркера: статус ${res.status}`)); 
					}
				},
				onerror: () => reject(new Error('Сетевая ошибка при загрузке воркера.'))
			});
		});
	}
	
	main();
})();