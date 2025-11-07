// IVO_public.js
(function(settingsJSON, role = "user") {

	const SCRIPT_ID = 'invValueObserver';

	const ROLE = role;

	const DEFAULTS  = {
		userObserver: true,
		allowedUsers: ["IgorP", "Jerry", "IgorDemping"],

		hideAmznGr: true,
		skuColIndex: 2,

		replaceHighlight: true,
		customHighlightColor: "#ffffff",

		clearYellowRow: true,
		exludesYellowClearing: true,
		protectMrg: true,
		protectK: true,

		customMrgColoring: false,
		lowMrgCol: "#FFE0E0",
		okMrgCol: "#FFF5C0",
		highMrgCol: "#D4EDDA",
		overMrgCol: "#c99aee",

		fixLabels: true
	};

	const amznGrForm = "amzn.gr"; 
	const amznGrClass = "hidden-amzn-gr";
	const wrongUserClass = "wrong-user";

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

	let config;

	async function main() {
		console.log(`========== ${SCRIPT_ID} PUBLIC`);

		config = loadConfig();
		
		addCustomCSS();

		setSubscribe();
	}

	function setSubscribe(){
		const table = document.querySelector('.table-hover');
		const observer = subscribeToTableUpdates(table, (updatedTable) => {
			checkTableRows(updatedTable);
		});
	}

	function subscribeToTableUpdates(tableElement, callback) {
		if (!tableElement || (tableElement instanceof Node) == false) {
			console.error('Table element is not a valid Node', tableElement);
			return;
		}

		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
					callback(tableElement);
				}
			});
		});

		observer.observe(tableElement, {
			childList: true,
			subtree: true
		});

		return observer;
	}

	function checkTableRows(table){
		let tableBody = table.querySelector('tbody');
		let rows = Array.from(tableBody.querySelectorAll('tr'));

		if (rows.length <= 0){
			return;
		}
		
		rows.forEach(row => {
			let cells = row.querySelectorAll('td');
			
			if (config.userObserver) setUserMark(row, cells);
			if (config.hideAmznGr) hideAmzngrRows(row, cells);
			if (config.clearYellowRow) clearYellowRow(row, cells);
			if (config.customMrgColoring) setCustomMrgColor(cells);
		});
	}

	function clearYellowRow(row, cells){
		row.style = null;

		cells.forEach(cell => {
			let shouldClear = true;

			if (config.exludesYellowClearing) {
				const hasFK = cell.querySelector('input.factorK');
				const isMargin = cell.innerText.includes('%');

				if (config.protectK && hasFK) {
					shouldClear = false;
				}

				if (config.protectMrg && isMargin) {
					shouldClear = false;
				}
			}

			if (shouldClear) {
				cell.style = null;
			}
		});
	}

	function hideAmzngrRows(row, cells){
		try {
			let skuCellNum = config.skuColIndex - 1;
			let sku = cells[skuCellNum]?.innerText || "";

			if (sku.includes(amznGrForm)){
				row.classList.add(amznGrClass);
			}
		} catch (error) {
			console.error(`========== ${SCRIPT_ID} Ошибка в определении колонки СКУ!`);
		}
	}

	function setUserMark(row, cells){
		let user = cells[cells.length - 2]?.innerText?.trim() || "";

		if (config.allowedUsers.includes(user) == false){
			row.classList.add(wrongUserClass);
		}
	}

	function setCustomMrgColor(cells){
		for (let i = cells.length - 1; i >= 0; i--) {
			const cell = cells[i];

			if (cell.innerText.includes('%')){
				const margin = parseFloat(cell?.innerText || 0);
				let customColor = null;

				if (isNaN(margin)) {
					break;
				}

				if (margin < 10){
					customColor = config.lowMrgCol;
				} 
				else if (margin < 13){
					customColor = config.okMrgCol;
				}
				else if (margin < 30){
					customColor = config.highMrgCol;
				}
				else {
					customColor = config.overMrgCol;
				}

				if (customColor){
					cell.style.backgroundColor = customColor;
				}

				break;
			}
		}
	}

	function addCustomCSS(){
		const customStyle = document.createElement('style');
			customStyle.id = `custom-${SCRIPT_ID}-css`;
			customStyle.innerHTML = `/* Custom ${SCRIPT_ID} CSS */`;
		
		if (config.userObserver){
			customStyle.innerHTML += `
				.${wrongUserClass} {
					background-color: rgba(255, 146, 146, 0.5) !important;
				}
			`;
		}
		
		if (config.fixLabels){
			customStyle.innerHTML += `
				#dt_list .list-col1 .select2 {
					display: none!important;
				}
			`;
		}

		if (config.replaceHighlight){
			const tableStyle = document.createElement('style');

			tableStyle.innerHTML = `
				.row-highlight{
					background-color: ${config.customHighlightColor} !important;
				}
			`;
			document.body.appendChild(tableStyle);
		}

		if (config.hideAmznGr){
			customStyle.innerHTML += `
				.${amznGrClass}{
					display: none!important;
				}
			`;
		}

		document.head.appendChild(customStyle);
	}

	main();
})(settingsJSON, role);