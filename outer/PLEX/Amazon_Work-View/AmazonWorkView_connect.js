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

    console.log("========== CONNECT", externalScriptUrl);

    GM_xmlhttpRequest({
        method: 'GET',
        url: externalScriptUrl,
        onload: function(response) {
            if (response.status >= 200 && response.status < 400) {
                console.log("========== RESPONSE SUCCSESS");

                try {
                    eval(response.responseText);
                } catch (e) {
                    console.error("========== EVAL FAILED: Произошла критическая ошибка при выполнении кода. Вероятно, в нем есть синтаксическая ошибка.", e);
                    return;
                }

                if (typeof initializeAmazonWorkView === 'function') {
                    console.log("========== FUNCTION DEF SUCCSESS");
                    initializeAmazonWorkView();
                } else {
                    console.error("========== FUNCTION DEF FAILED: Функция initializeAmazonWorkView не была найдена после выполнения скрипта.");
                }
            } else {
                console.error(`========== Ошибка загрузки внешнего скрипта. Статус: ${response.status}`);
            }
        },
        onerror: function(error) {
            console.error("========== Сетевая ошибка при загрузке внешнего скрипта:", error);
        }
    });
})();