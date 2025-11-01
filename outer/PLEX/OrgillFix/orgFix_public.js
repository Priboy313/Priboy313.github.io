// orgFix_public.js
(function(settingsJSON, role = "user") {

	const SCRIPT_ID = 'orgFix';

	const ROLE = role;

	const DEFAULTS  = {
		showFactoryPack: true,

		hideSayt: true,

		styleFix: true,
		relativeHeader: true,
		fixHeader: true,
		fixHeaderGreyBar: true,
		fixHeaderLogoBar: true,
		fixNavBar: true,
		fixBreadcrumb: true,
		fixNoResult: true,

		disableClickableElements: false,
	};

	function loadConfig() {
		console.log(`== [${SCRIPT_ID}] Обработка полученной конфигурации...`, settingsJSON);
		
        let settingsData = {};
        try {
            if (settingsJSON && typeof settingsJSON === 'string') {
                settingsData = JSON.parse(settingsJSON);
            }
        } catch (e) {
            console.error(`== [${SCRIPT_ID}] Ошибка парсинга JSON-строки настроек:`, e);
            console.warn(`== [${SCRIPT_ID}] Используются настройки по умолчанию.`);
            return DEFAULTS;
        }

		const mySavedSettings = settingsData[SCRIPT_ID] || {};
		console.log(`== [${SCRIPT_ID}] Получены настройки для этого скрипта:`, mySavedSettings);
		
		const finalConfig = { ...DEFAULTS, ...mySavedSettings };
		console.log(`== [${SCRIPT_ID}] Финальный конфиг после слияния:`, finalConfig);
		
		return finalConfig;
	}

	async function main() {
		console.log(`========== ${SCRIPT_ID} PUBLIC`);

		const config = loadConfig();
		
		if (config.styleFix){
			addCustomCSS(config);
		}

		const isItemPage = (window.location.href.includes('index.aspx?tab=7&sku='));

		if (isItemPage){
			if (config.showFactoryPack){
				SetFactoryPack();
			}
		} else {
			if (config.disableClickableElements){
				DisableClickableElements();
			}
		}
	}

	function DisableClickableElements(){
		const clickableElements = document.querySelectorAll(".clickable");

		clickableElements.forEach(element => {
			element.onclick = null;
		});
	}

	function SetFactoryPack(){
		
		if(document.querySelector("#custom-factory-pack-row")) return;

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
			customFPTr.id = "custom-factory-pack-row"; 
		const customFPTdText = document.createElement("td");
			customFPTdText.classList.add("width-item-100");
			customFPTdText.innerText = ` ${factoryPackText}: `;

		const customFPTdVal = document.createElement("td");
			customFPTdVal.innerText = factoryPackVal;

		customFPTr.appendChild(customFPTdText);
		customFPTr.appendChild(customFPTdVal);
		placeShelfPackTableBody.appendChild(customFPTr);
	}

	function addCustomCSS(config){
		const customStyle = document.createElement('style');
			customStyle.id = `custom-${SCRIPT_ID}-css`;
			customStyle.innerHTML = `/* Custom ${SCRIPT_ID} CSS */`;
		
		if (config.relativeHeader){
			customStyle.innerHTML += `
				header {
					position: relative !important;
				}
			`;
		}

		if (config.fixHeader){
			customStyle.innerHTML += `
				.body-content-start{
					margin-top: 0!important;
				}

				.top-nav-container{
					height: 143px!important;
				}
			`;
		}

		if (config.hideSayt){
			customStyle.innerHTML += `
				.sayt{
					height: 1px!important;
					width: 1px!important;
					display: none!important;
				}
			`;
		}

		if (config.fixHeaderGreyBar){
			customStyle.innerHTML += `
				.top-grey-bar{
					height: 40px!important;
				}
				
				.v8-header-top-link{
					padding: 10px 12px!important;
				}
			`;
		}

		if (config.fixHeaderLogoBar){
			customStyle.innerHTML += `
				.top-logo-bar{
					padding: 6px 0px!important;
				}
			`;
		}

		if (config.fixNavBar){
			customStyle.innerHTML += `
				.w-menu-lvl1-container-item,
				.w-menu-lvl1-container-item-active{
					padding: 10px 16px!important;
				}
			`;
		}

		if (config.fixBreadcrumb){
			customStyle.innerHTML += `
				.breadcrumb-bar{
					padding: 8px 0px!important;
				}
			`;
		}

		if (config.fixNoResult){
			customStyle.innerHTML += `
				.v8-pt-20{
					padding-top: 5px!important;
				}

				.v8-pt-20 .v8-page-header-text {
					font-size: 24px!important;
				}
			`;
		}

		document.head.appendChild(customStyle);
	}

	main();
})(settingsJSON, role);