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
// ==/UserScript==

(function() {
    'use-strict';

    const latestUrl = "https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@latest/outer/PLEX/Amazon_Work-View/AmazonWorkView_public.js";

    console.log("========== AMZNWV CONNECT (Manual Redirect)", latestUrl);

    const urlWithCacheBuster = `${latestUrl}?cb=${new Date().getTime()}`;

    GM_xmlhttpRequest({
        method: 'GET',
        url: urlWithCacheBuster,
        
        onload: function(response) {
            console.log("[LOADER] Получен первичный ответ. Статус:", response.status);
            console.log("[LOADER] Заголовки ответа:", response.responseHeaders);

            const headers = response.responseHeaders.split('\r\n').reduce((acc, current) => {
                const [key, value] = current.split(': ');
                if (key) acc[key.toLowerCase()] = value;
                return acc;
            }, {});

            const realUrl = headers['location'] || headers['x-real-url'];

            if (realUrl) {
                console.log(`[LOADER] Найден реальный URL в заголовках: ${realUrl}. Загружаю...`);
                downloadAndExecute(realUrl);
            } else {
                console.warn("[LOADER] Не удалось найти заголовок редиректа. Попытка выполнить код из текущего ответа.");
                if (response.status >= 200 && response.status < 400 && response.responseText) {
                    executeScript(response.responseText);
                } else {
                    console.error("[LOADER] Ошибка: тело ответа пустое или статус ответа некорректный.");
                }
            }
        },
        onerror: function(error) {
            console.error("Сетевая ошибка при первичном запросе:", error);
        }
    });

    function downloadAndExecute(url) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function(res) {
                if (res.status >= 200 && res.status < 300 && res.responseText) {
                    executeScript(res.responseText);
                } else {
                    console.error(`Ошибка загрузки скрипта с реального URL. Статус: ${res.status}`);
                }
            },
            onerror: function(error) {
                console.error("Сетевая ошибка при загрузке с реального URL:", error);
            }
        });
    }

    function executeScript(code) {
        console.log("========== RESPONSE SUCCSESS. EXECUTING SCRIPT...");
        try {
            eval(code);
        } catch (e) {
            console.error("========== EVAL FAILED:", e);
        }
    }
})();