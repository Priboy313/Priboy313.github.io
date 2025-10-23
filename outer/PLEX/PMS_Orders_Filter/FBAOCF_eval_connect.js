// ==UserScript==
// @name         PMS FBA Orders Custom Filters
// @version      1.1
// @author       Priboy313
// @description  PMS FBA Orders Custom Filters - eval connect script
// @match        https://pms.plexsupply.com/pms/listfbaorderscomm.xhtml
// @match        https://pms.officechase.com/pms/listfbaorderscomm.xhtml
// @match        https://pms.marksonsupply.com/pms/listfbaorderscomm.xhtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=plexsupply.com
// @grant        GM_xmlhttpRequest
// @connect      cdn.jsdelivr.net
// @connect      api.github.com
// @connect      pms.plexsupply.com
// @connect      pms.officechase.com
// @connect      pms.marksonsupply.com
// ==/UserScript==

(function() {
    'use strict';
	const SCRIPT_NAME = "FBAOCF";

    const GITHUB_API_URL = 'https://api.github.com/repos/Priboy313/Priboy313.github.io/commits/main';
    
    const SCRIPT_URL_TEMPLATE = 'https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@{commit_hash}/outer/PLEX/PMS_Orders_Filter/FBAOCF_public.js';

	console.log(`========== ${SCRIPT_NAME} CONNECT (API-driven) ==========`);

    GM_xmlhttpRequest({
        method: 'GET',
        url: GITHUB_API_URL,
        headers: {
            "Accept": "application/vnd.github.v3+json"
        },
        onload: function(response) {
            if (response.status !== 200) {
                console.error(`[${SCRIPT_NAME}] Ошибка при запросе к GitHub API. Статус: ${response.status}`);
                return;
            }

            try {
                const commitInfo = JSON.parse(response.responseText);
                const latestCommitHash = commitInfo.sha;

                if (!latestCommitHash) {
                    console.error(`[${SCRIPT_NAME}]Не удалось найти хэш коммита в ответе от GitHub API.`);
                    return;
                }

                console.log(`[${SCRIPT_NAME}] Получен хэш последнего коммита: ${latestCommitHash}`);

                const finalScriptUrl = SCRIPT_URL_TEMPLATE.replace('{commit_hash}', latestCommitHash);
                downloadAndExecute(finalScriptUrl);

            } catch (e) {
                console.error(`[${SCRIPT_NAME}] Ошибка парсинга ответа от GitHub API:`, e);
            }
        },
        onerror: function(error) {
            console.error(`[${SCRIPT_NAME}] Сетевая ошибка при запросе к GitHub API:`, error);
        }
    });

    function downloadAndExecute(url) {
        console.log(`[${SCRIPT_NAME}] Загрузка скрипта с URL: ${url}`);
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function(res) {
                if (res.status === 200 && res.responseText) {
                    console.log(`========== RESPONSE SUCCSESS. EXECUTING [${SCRIPT_NAME}] SCRIPT...`);
                    try {
                        eval(res.responseText);
                    } catch (e) {
                        console.error("========== EVAL FAILED:", e);
                    }
                } else {
                    console.error(`[${SCRIPT_NAME}] Ошибка загрузки скрипта. Статус: ${res.status}`);
                }
            },
            onerror: function(error) {
                console.error(`[${SCRIPT_NAME}] Сетевая ошибка при загрузке скрипта:`, error);
            }
        });
    }
})();