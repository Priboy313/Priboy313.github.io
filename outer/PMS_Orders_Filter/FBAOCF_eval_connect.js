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
// @connect      pms.plexsupply.com
// @connect      pms.officechase.com
// @connect      pms.marksonsupply.com
// ==/UserScript==

(function() {
    'use strict';

    const externalScriptUrl = "https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@latest/outer/PMS_Orders_Filter/FBAOCF_public.js";

    console.log(`Загрузка внешнего скрипта...`);

    GM_xmlhttpRequest({
        method: 'GET',
        url: externalScriptUrl,
        onload: function(response) {
            if (response.status >= 200 && response.status < 400) {
                console.log("Внешний скрипт успешно загружен. Выполняю...");
                eval(response.responseText);

            } else {
                console.error(`Ошибка загрузки внешнего скрипта. Статус: ${response.status}`);
            }
        },
        onerror: function(error) {
            console.error("Сетевая ошибка при загрузке внешнего скрипта:", error);
        }
    });
})();