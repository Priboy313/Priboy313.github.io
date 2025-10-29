// ==UserScript==
// @name         Plex Scripts Settings Manager
// @version      1.0
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

	function downloadAndExecute(url) {
		GM_xmlhttpRequest({
			method: 'GET',
			url: url,
			onload: function(response) {
				if (response.status === 200 && response.responseText) {
					console.log(`[${SCRIPT_NAME}] Воркер загружен. Запуск...`);
					try {
						eval(response.responseText);
					} catch (e) {
						console.error(`[${SCRIPT_NAME}] Ошибка выполнения воркера:`, e);
					}
				} else {
					console.error(`[${SCRIPT_NAME}] Ошибка загрузки воркера. Статус: ${response.status}`);
				}
			},
			onerror: function(error) {
				console.error(`[${SCRIPT_NAME}] Сетевая ошибка при загрузке воркера:`, error);
			}
		});
	}

	const cachedData = GM_getValue(CACHE_KEY, null);

	if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION_MS)) {
		console.log(`[${SCRIPT_NAME}] Используется кэшированный URL воркера.`);
		downloadAndExecute(cachedData.url);
	} else {
		console.log(`[${SCRIPT_NAME}] Запрос нового хэша коммита...`);
		GM_xmlhttpRequest({
			method: 'GET',
			url: GITHUB_API_URL,
			headers: { "Accept": "application/vnd.github.v3+json" },
			onload: function(response) {
				if (response.status !== 200) {
					console.error(`[${SCRIPT_NAME}] Ошибка API GitHub. Статус: ${response.status}`);
					if (cachedData) downloadAndExecute(cachedData.url);
					return;
				}
				try {
					const latestCommitHash = JSON.parse(response.responseText).sha;
					if (!latestCommitHash) {
						console.error(`[${SCRIPT_NAME}] Хэш коммита не найден в ответе API.`);
						return;
					}
					const finalScriptUrl = SCRIPT_URL_TEMPLATE.replace('{commit_hash}', latestCommitHash);
					
					GM_setValue(CACHE_KEY, { url: finalScriptUrl, timestamp: Date.now() });
					downloadAndExecute(finalScriptUrl);

				} catch (e) {
					console.error(`[${SCRIPT_NAME}] Ошибка парсинга ответа API:`, e);
				}
			},
			onerror: function(error) {
				console.error(`[${SCRIPT_NAME}] Сетевая ошибка при запросе к API:`, error);
			}
		});
	}
})();