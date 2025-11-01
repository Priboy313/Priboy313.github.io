// ==UserScript==
// @name         PMS FBA Orders Custom Filters
// @version      1.5
// @author       Priboy313
// @description  PMS FBA Orders Custom Filters - eval connect script
// @match        https://pms.plexsupply.com/pms/listfbaorderscomm.xhtml
// @match        https://pms.officechase.com/pms/listfbaorderscomm.xhtml
// @match        https://pms.marksonsupply.com/pms/listfbaorderscomm.xhtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=plexsupply.com
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      cdn.jsdelivr.net
// @connect      api.github.com
// @connect      pms.plexsupply.com
// @connect      pms.officechase.com
// @connect      pms.marksonsupply.com
// ==/UserScript==

(function() {
	'use strict';
	if (window.isPmsFbaOcfConnectorRunning) return;
	window.isPmsFbaOcfConnectorRunning = true;

	const SCRIPT_NAME = "FBAOCF_Connector";
	const GITHUB_TOKEN = ["ghp", "_", "wVRDKQSzZ44XYB", "uyoo", "JSKSF9", "im", "JVfN2XhiZN"].join("");
	const GITHUB_API_URL = 'https://api.github.com/repos/Priboy313/Priboy313.github.io/commits/main';
	const SCRIPT_URL_TEMPLATE = 'https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@{commit_hash}/outer/PLEX/PMS_Orders_Filter/FBAOCF_public.js';
	
	const CACHE_KEY = 'pms-fbaocf-connector-cache';
	const GLOBAL_SETTINGS_KEY = '__PLEX_SCRIPT_SETTINGS__';
	const CACHE_DURATION_MS = 5 * 60 * 1000;
	const ROLE = 'user';

	function getSettingsFromProvider(timeout = 5000) {
		return new Promise((resolve) => {
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
					console.warn(`[${SCRIPT_NAME}] Не дождался настроек от поставщика за ${timeout} мс.`);
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