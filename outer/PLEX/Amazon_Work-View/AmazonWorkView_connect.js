// ==UserScript==
// @name         Amazon Work View (Connect)
// @version      1.0
// @author       Priboy313
// @description  Amazon Work View - eval connect script
// @match        https://www.amazon.com/*
// @match        https://www.amazon.ca/*
// @match        https://www.amazon.com.mx/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      cdn.jsdelivr.net
// @connect      api.github.com
// ==/UserScript==

(function() {
    'use strict';

    const GITHUB_API_URL = 'https://api.github.com/repos/Priboy313/Priboy313.github.io/commits/main';
    
    const SCRIPT_URL_TEMPLATE = 'https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@{commit_hash}/outer/PLEX/Amazon_Work-View/AmazonWorkView_public.js';

	console.log("========== AMZNWV CONNECT (API-driven) ==========");

    GM_xmlhttpRequest({
        method: 'GET',
        url: GITHUB_API_URL,
        headers: {
            "Accept": "application/vnd.github.v3+json"
        },
        onload: function(response) {
            if (response.status !== 200) {
                console.error(`[AMZWV] Ошибка при запросе к GitHub API. Статус: ${response.status}`);
                return;
            }

            try {
                const commitInfo = JSON.parse(response.responseText);
                const latestCommitHash = commitInfo.sha;

                if (!latestCommitHash) {
                    console.error("Не удалось найти хэш коммита в ответе от GitHub API.");
                    return;
                }

                console.log(`[LOADER] Получен хэш последнего коммита: ${latestCommitHash}`);

                const finalScriptUrl = SCRIPT_URL_TEMPLATE.replace('{commit_hash}', latestCommitHash);
                downloadAndExecute(finalScriptUrl);

            } catch (e) {
                console.error("Ошибка парсинга ответа от GitHub API:", e);
            }
        },
        onerror: function(error) {
            console.error("Сетевая ошибка при запросе к GitHub API:", error);
        }
    });

    function downloadAndExecute(url) {
        console.log(`[LOADER] Загрузка скрипта с URL: ${url}`);
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function(res) {
                if (res.status === 200 && res.responseText) {
                    console.log("========== RESPONSE SUCCSESS. EXECUTING SCRIPT...");
                    try {
                        eval(res.responseText);
                    } catch (e) {
                        console.error("========== EVAL FAILED:", e);
                    }
                } else {
                    console.error(`Ошибка загрузки скрипта. Статус: ${res.status}`);
                }
            },
            onerror: function(error) {
                console.error("Сетевая ошибка при загрузке скрипта:", error);
            }
        });
    }

})();