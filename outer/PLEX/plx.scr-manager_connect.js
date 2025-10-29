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
	if (window.isPlexConnectorRunning) return;
	window.isPlexConnectorRunning = true;

	const SCRIPT_NAME = "ScrMng_Connector";
	const GITHUB_API_URL = 'https://api.github.com/repos/Priboy313/Priboy313.github.io/commits/main';
	const SCRIPT_URL_TEMPLATE = 'https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@{commit_hash}/outer/PLEX/plx.scr-manager_public.js';
	
	const CACHE_KEY = 'plx-connector-cache';
	const CACHE_DURATION_MS = 15 * 60 * 1000;

	async function handleMenuClick() {
		if (typeof window.PLX_SETTINGS_SHOW_UI === 'function') {
			console.log(`[${SCRIPT_NAME}] Воркер уже в памяти. Запуск UI.`);
			window.PLX_SETTINGS_SHOW_UI();
			return;
		}

		console.log(`[${SCRIPT_NAME}] Воркер не найден. Начало загрузки...`);

		try {
			const url = await getWorkerURL();
			await downloadAndExecuteWorker(url);
			
			if (typeof window.PLX_SETTINGS_SHOW_UI === 'function') {
				window.PLX_SETTINGS_SHOW_UI();
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
							eval(res.responseText);
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