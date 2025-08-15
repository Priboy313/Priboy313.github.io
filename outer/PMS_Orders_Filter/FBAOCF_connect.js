// ==UserScript==
// @name         PMS FBA Orders Custom Filters
// @version      1.0
// @author       Priboy313
// @description  PMS FBA Orders Custom Filters - connect script
// @match        https://pms.plexsupply.com/pms/listfbaorderscomm.xhtml
// @match        https://pms.officechase.com/pms/listfbaorderscomm.xhtml
// @match        https://pms.marksonsupply.com/pms/listfbaorderscomm.xhtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=plexsupply.com
// ==/UserScript==

const url = "https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@latest/outer/PMS_Orders_Filter/FBAOCF_public.js";

(function() {
'use strict';

    console.log("connect!");

	const outer_script = document.createElement("script");
	outer_script.type = "text/javascript";
	outer_script.language = "javascript";
	outer_script.src = url;

    //console.log(outer_script);

	document.head.appendChild(outer_script);
})();

