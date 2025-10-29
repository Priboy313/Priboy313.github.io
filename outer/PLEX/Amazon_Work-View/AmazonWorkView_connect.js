// ==UserScript==
// @name         Amazon Work View (Connect)
// @version      1.9
// @author       Priboy313
// @description  Amazon Work View - injects settings as a JSON string for reliability
// @match        https://www.amazon.com/*
// @match        https://www.amazon.ca/*
// @match        https://www.amazon.com.mx/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @connect      cdn.jsdelivr.net
// @connect      api.github.com
// ==/UserScript==

(function() {
	'use strict';
	if (window.isAmznWvConnectorRunning) return;
	window.isAmznWvConnectorRunning = true;

	const SCRIPT_NAME = "AmznWV_Connector";
	const GITHUB_API_URL = 'https://api.github.com/repos/Priboy313/Priboy313.github.io/commits/main';
	const SCRIPT_URL_TEMPLATE = 'https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@{commit_hash}/outer/PLEX/Amazon_Work-View/AmazonWorkView_public.js';
	
	const CACHE_KEY = 'amznwv-connector-cache';
	const GLOBAL_SETTINGS_KEY = '__PLEX_SCRIPT_SETTINGS__';
	const SETTINGS_KEY = 'plx-cst-scr-settings';
	const CACHE_DURATION_MS = 15 * 60 * 1000;

	function getSettingsFromProvider(timeout = 5000) {
		return new Promise((resolve, reject) => {
			let elapsedTime = 0;
			const interval = 100;

			const checkInterval = setInterval(() => {
				if (window[GLOBAL_SETTINGS_KEY] && typeof window[GLOBAL_SETTINGS_KEY] === 'object') {
					clearInterval(checkInterval);
					resolve(window[GLOBAL_SETTINGS_KEY]);
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
			await downloadAndExecuteWorker(url, settingsJSON);

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
			GM_xmlhttpRequest({
				method: 'GET', url: GITHUB_API_URL,
				headers: { "Accept": "application/vnd.github.v3+json" },
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

	function downloadAndExecuteWorker(url, settingsJSON) {
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: 'GET', url: url,
				onload: res => {
					if (res.status === 200 && res.responseText) {
						try {
							const workerCode = res.responseText;
							const workerFunction = new Function('settingsJSON', 'GM_addStyle', workerCode);
							workerFunction(settingsJSON, GM_addStyle);
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