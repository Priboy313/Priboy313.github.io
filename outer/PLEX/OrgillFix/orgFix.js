// ==UserScript==
// @name         Orgill Style Fix
// @version      2025-09-15
// @description  fix
// @author       Priboy313
// @match        https://www.orgill.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=orgill.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const headerStyle = document.createElement('style');
    headerStyle.innerHTML = `
	// fixHeader
		header {
			position: relative !important;
		}

		.body-content-start{
			margin-top: 0!important;
		}
	// -
	// hideSayt
		.sayt{
			height: 1px!important;
			width: 1px!important;
			display: none!important;
		}
	// -
	
		.top-grey-bar{
			height: 40px!important;
		}

		.top-nav-container{
			height: 143px!important;
		}

		.v8-header-top-link{
			padding: 10px 12px!important;
		}

		.top-logo-bar{
			padding: 6px 0px!important;
		}

		.w-menu-lvl1-container-item{
			padding: 10px 16px!important;
		}

		.breadcrumb-bar{
			padding: 8px 0px!important;
		}

		.v8-pt-20{
			padding-top: 5px!important;
		}

		.v8-pt-20 .v8-page-header-text {
			font-size: 24px!important;
		}
	`;	

    document.head.appendChild(headerStyle);
})();