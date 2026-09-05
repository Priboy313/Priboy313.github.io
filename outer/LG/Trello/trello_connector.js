// ==UserScript==
// @name         Trello Base Connector
// @version      1.0
// @author       Priboy313
// @description  Загрузчик локальной канбан-доски поверх Google
// @match        https://www.google.com/priboy313*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @connect      cdn.jsdelivr.net
// @connect      api.github.com
// @icon         https://trello.com/favicon.ico
// ==/UserScript==

(function() {
	'use strict';
    
	window.stop();
	document.documentElement.innerHTML = '<head><title>Loading Trello...</title></head><body style="background:#0079bf; color:white; font-family:sans-serif; text-align:center; padding-top:50px;"><h2>Подключение к GitHub...</h2></body>';

	if (window.isTrelloConnectorRunning) return;
	window.isTrelloConnectorRunning = true;

	const SCRIPT_NAME = "Trello_Connector";
    
	const GITHUB_TOKEN = ["ghp", "_", "wVRDKQSzZ44XYB", "uyoo", "JSKSF9", "im", "JVfN2XhiZN"].join("");
	const GITHUB_API_URL = 'https://api.github.com/repos/Priboy313/Priboy313.github.io/commits/main';
	const SCRIPT_URL_TEMPLATE = 'https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@{commit_hash}/outer/LG/Trello/trello_public.js';
	
	const CACHE_KEY = 'trello-connector-cache';
	const CACHE_DURATION_MS = 5 * 60 * 1000;

	async function main() {
		try {
			const url = await getWorkerURL();
			await downloadAndExecuteWorker(url, JSON.stringify({}), 'user');
		} catch (error) {
			console.error(`[${SCRIPT_NAME}] Критическая ошибка:`, error);
			document.body.innerHTML = `<h2 style="color:#ffcccc;">Ошибка загрузки Trello</h2><p>${error.message}</p>`;
			GM_setValue(CACHE_KEY, null);
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

	function downloadAndExecuteWorker(url, settingsJSON, role) {
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: 'GET', url: url,
				onload: res => {
					if (res.status === 200 && res.responseText) {
						try {
							const workerCode = res.responseText;
							const workerFunction = new Function('settingsJSON', 'role', 'GM_getValue', 'GM_setValue', workerCode);
							
                            workerFunction(settingsJSON, role, GM_getValue, GM_setValue);
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