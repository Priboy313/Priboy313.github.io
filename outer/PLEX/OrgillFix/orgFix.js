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

	function DisableClickableElements(){
		const clickableElements = document.querySelectorAll(".clickable");

		clickableElements.forEach(element => {
			element.onclick = null;
		});
	}

	function SetFactoryPack(){
		const orderSpecificationDiv = document.body.querySelector("#orderSpecificationDiv");
		const orderSpicificationCol = orderSpecificationDiv.querySelector(".col-sm-6");
		const orderFactoryPackRow = orderSpicificationCol.querySelectorAll(".row ")[2];

		const factoryPackInfo = orderFactoryPackRow.querySelectorAll(".detail-row");
		const factoryPackText = "Factory Pack";
		const factoryPackVal = factoryPackInfo[1].innerText;

		const mainContent = document.body.querySelector("#cphMainContent_ctl00_productDetailsDiv");
		const mainTextDetails = mainContent.querySelectorAll(".text-details")[0];
		const placeShelfPackRow = mainTextDetails.querySelectorAll(".padding-bottom-5")[5];
		const placeShelfPackTableBody = placeShelfPackRow.querySelector("tbody");

		const customFPTr = document.createElement("tr");
		const customFPTdText = document.createElement("td");
			customFPTdText.classList.add("width-item-100");
			customFPTdText.innerText = ` ${factoryPackText}: `;

		const customFPTdVal = document.createElement("td");
			customFPTdVal.innerText = factoryPackVal;

		customFPTr.appendChild(customFPTdText);
		customFPTr.appendChild(customFPTdVal);
		placeShelfPackTableBody.appendChild(customFPTr);
	}

	function FixStyle(){
		const headerStyle = document.createElement('style');
		headerStyle.innerHTML = `
		// relativeHeader
			header {
				position: relative !important;
			}
		// -
		// fixHeader
			.body-content-start{
				margin-top: 0!important;
			}

			.top-nav-container{
				height: 143px!important;
			}
		// -
		// hideSayt
			.sayt{
				height: 1px!important;
				width: 1px!important;
				display: none!important;
			}
		// -
		// Gray bar
			.top-grey-bar{
				height: 40px!important;
			}
			
			.v8-header-top-link{
				padding: 10px 12px!important;
			}
		// -
		// fixHeaderLogoBar
			.top-logo-bar{
				padding: 6px 0px!important;
			}
		// -
		// fixNavBar
			.w-menu-lvl1-container-item{
				padding: 10px 16px!important;
			}
		// -
		// fixBreadcrumb
			.breadcrumb-bar{
				padding: 8px 0px!important;
			}
		// 
		// fixNoResult
			.v8-pt-20{
				padding-top: 5px!important;
			}

			.v8-pt-20 .v8-page-header-text {
				font-size: 24px!important;
			}
		// 
		`;	
		document.head.appendChild(headerStyle);

	}

})();