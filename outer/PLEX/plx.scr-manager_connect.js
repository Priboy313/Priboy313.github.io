// ==UserScript==
// @name         Plex Scripts Settings Manager
// @version      1.5
// @author       Priboy313
// @description  Централизованные настройки для всех кастомных скриптов
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @connect      cdn.jsdelivr.net
// @connect      api.github.com
// ==/UserScript==

(function() {
	'use strict';
	if (unsafeWindow.isPlexConnectorRunning) return;
	unsafeWindow.isPlexConnectorRunning = true;

	const SETTINGS_KEY = 'plx-cst-scr-settings';
    const GLOBAL_KEY = '__PLEX_SCRIPT_SETTINGS__';

	const settingsData = GM_getValue(SETTINGS_KEY, {});
	unsafeWindow[GLOBAL_KEY] = settingsData;

	console.log('[Settings Manager] Настройки размещены в window:', unsafeWindow[GLOBAL_KEY]);

	const SCRIPT_NAME = "ScrMng_Connector";
	const GITHUB_API_URL = 'https://api.github.com/repos/Priboy313/Priboy313.github.io/commits/main';
	const SCRIPT_URL_TEMPLATE = 'https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@{commit_hash}/outer/PLEX/plx.scr-manager_public.js';
	
	const CACHE_KEY = 'plx-connector-cache';
	const CACHE_DURATION_MS = 5 * 60 * 1000;
	const ROLE = 'user';

	async function handleMenuClick() {
		const userRole = ROLE;

		if (typeof unsafeWindow.PLX_SETTINGS_SHOW_UI === 'function') {
			console.log(`[${SCRIPT_NAME}] Воркер уже в памяти. Запуск UI.`);
			unsafeWindow.PLX_SETTINGS_SHOW_UI(userRole);
			return;
		}

		console.log(`[${SCRIPT_NAME}] Воркер не найден. Начало загрузки...`);

		try {
			const url = await getWorkerURL();
			await downloadAndExecuteWorker(url);
			
			if (typeof unsafeWindow.PLX_SETTINGS_SHOW_UI === 'function') {
				unsafeWindow.PLX_SETTINGS_SHOW_UI(userRole);
			} else {
				throw new Error("Воркер выполнен, но функция 'PLX_SETTINGS_SHOW_UI' не найдена. Проверьте код воркера.");
			}
		} catch (error) {
			console.error(`[${SCRIPT_NAME}] Критическая ошибка:`, error);
			
			clearCacheAndNotify(error);
		}
	}

	function clearCacheAndNotify(error) {
		GM_setValue(CACHE_KEY, null);
		console.log(`[${SCRIPT_NAME}] Кэш URL воркера был очищен из-за ошибки.`);
		alert(`Не удалось загрузить скрипт настроек.\n\nОшибка: ${error.message || error}\n\nКэш был очищен. Пожалуйста, попробуйте еще раз через минуту.`);
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
				onerror: err => reject(new Error('Сетевая ошибка при запросе к API GitHub.'))
			});
		});
	}

	function downloadAndExecuteWorker(url) {
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: 'GET', url: url,
				onload: res => {
					if (res.status === 200 && res.responseText) {
						try {
							const workerCode = res.responseText;
							const workerFunction = new Function('GM_getValue', 'GM_setValue', 'GM_xmlhttpRequest', 'GM_addStyle', 'unsafeWindow', workerCode);
							workerFunction(GM_getValue, GM_setValue, GM_xmlhttpRequest, GM_addStyle, unsafeWindow);
							resolve();
						} catch (err) { reject(new Error(`Ошибка выполнения (eval) кода воркера: ${err}`)); }
					} else { 
						reject(new Error(`Ошибка загрузки воркера: статус ${res.status}`)); 
					}
				},
				onerror: err => reject(new Error('Сетевая ошибка при загрузке воркера.'))
			});
		});
	}

	GM_registerMenuCommand('⚙️ Настройки скриптов', handleMenuClick);
})();