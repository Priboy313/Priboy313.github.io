// ==UserScript==
// @name         Plex Scripts Settings Manager
// @version      1.2
// @author       Priboy313
// @description  Централизованные настройки для всех кастомных скриптов
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @connect      cdn.jsdelivr.net
// @connect      api.github.com
// ==/UserScript==

(function() {
	'use strict';

	const SCRIPT_NAME = "ScrMng_Connector";
	const GITHUB_API_URL = 'https://api.github.com/repos/Priboy313/Priboy313.github.io/commits/main';
	const SCRIPT_URL_TEMPLATE = 'https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@{commit_hash}/outer/PLEX/Amazon_Work-View/plx.scr-manager_public.js';
	const CACHE_KEY = 'plx-connector-cache';
	const CACHE_DURATION_MS = 15 * 60 * 1000;

	async function handleMenuClick() {
		if (window.PLX_SETTINGS_SHOW_UI) {
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
				console.error(`[${SCRIPT_NAME}] Воркер выполнился, но функция UI не найдена.`);
				alert("Ошибка: Воркер загружен некорректно.");
			}
		} catch (e) {
			console.error(`[${SCRIPT_NAME}] Критическая ошибка загрузки:`, e);
			alert("Не удалось загрузить настройки. Проверьте консоль.");
		}
	}

	function getWorkerURL() {
		return new Promise((resolve, reject) => {
			const cachedData = GM_getValue(CACHE_KEY, null);
			if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION_MS)) {
				console.log(`[${SCRIPT_NAME}] URL воркера из кэша.`);
				resolve(cachedData.url);
				return;
			}

			GM_xmlhttpRequest({
				method: 'GET', url: GITHUB_API_URL,
				headers: { "Accept": "application/vnd.github.v3+json" },
				onload: res => {
					if (res.status !== 200) reject(`GitHub API error: ${res.status}`);
					try {
						const hash = JSON.parse(res.responseText).sha;
						const url = SCRIPT_URL_TEMPLATE.replace('{commit_hash}', hash);
						GM_setValue(CACHE_KEY, { url: url, timestamp: Date.now() });
						resolve(url);
					} catch (e) { reject(e); }
				},
				onerror: reject
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
						} catch (e) { reject(`Eval failed: ${e}`); }
					} else { reject(`Worker download failed: ${res.status}`); }
				},
				onerror: reject
			});
		});
	}

	GM_registerMenuCommand('⚙️ Настройки Plex скриптов', handleMenuClick);
})();