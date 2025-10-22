// ==UserScript==
// @name         Amazon Work View (Connect)
// @version      1.0
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
    'use strict';
    const externalScriptUrl = "https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@latest/outer/PLEX/Amazon_Work-View/AmazonWorkView_public.js";

    console.log("========== AMZNWV CONNECT", externalScriptUrl);

    GM_xmlhttpRequest({
        method: 'GET',
        url: externalScriptUrl,
        onload: function(response) {
            if (response.status >= 200 && response.status < 400) {
                console.log("========== RESPONSE SUCCSESS. EXECUTING SCRIPT...");
                try {
                    eval(response.responseText);
                } catch (e) {
                    console.error("========== EVAL FAILED: Критическая ошибка при выполнении публичного скрипта.", e);
                }
            } else {
                console.error(`Ошибка загрузки внешнего скрипта. Статус: ${response.status}`);
            }
        },
        onerror: function(error) {
            console.error("Сетевая ошибка при загрузке внешнего скрипта:", error);
        }
    });
})();