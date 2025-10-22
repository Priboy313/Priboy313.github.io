// ==UserScript==
// @name         Amazon Work View (Connect)
// @version      1.0
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
    
    GM_xmlhttpRequest({
        method: 'GET',
        url: externalScriptUrl,
        onload: function(response) {
            if (response.status >= 200 && response.status < 400) {
                new Function(response.responseText)();
                if (typeof initializeAmazonWorkView === 'function') {
                    initializeAmazonWorkView();
                }
            }
        }
    });
})();