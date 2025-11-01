// ==UserScript==
// @name         PMS FBA InvValue Observer
// @version      1.2
// @description  Apply fixes for PMS FBA Inventory Value!
// @author       Priboy313
// @match        https://pms.plexsupply.com/pms/listfbavalue.xhtml*
// @match        https://pms.officechase.com/pms/listfbavalue.xhtml*
// @match        https://pms.marksonsupply.com/pms/listfbavalue.xhtml*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @connect      cdn.jsdelivr.net
// @connect      api.github.com
// @icon         https://www.google.com/s2/favicons?sz=64&domain=plexsupply.com
// ==/UserScript==

const config = {
	rowFixes: true,
	userObserver: true,
	hideAmznGr: true,
	clearYellowRow: true,
};

const SuitableUsers = [
	"IgorP",
	"Jerry",
	"IgorDemping"
];

const amznGrForm = "amzn.gr";

const wrongUserClass = "wrong-user";
const amznGrClass = "grade-sku";

(function() {
	'use strict';

	addCustomCSS();

	setSubscribe();
})();

function setSubscribe(){
	const table = document.querySelector('.table-hover');
	const observer = subscribeToTableUpdates(table, (updatedTable) => {
		checkTableRows(updatedTable);
	});
}

function checkTableRows(table){
	let tableBody = table.querySelector('tbody');
	let rows = Array.from(tableBody.querySelectorAll('tr'));

	if (rows.length <= 0){
		return;
	}
	
	rows.forEach(row => {
		let cells = row.querySelectorAll('td');
		
		if (config.userObserver) setUserMark(row, cells)
		if (config.hideAmznGr) hideAmzngrRows(row, cells);
		if (config.clearYellowRow) clearYellowRow(row, cells);
	});
}

function clearYellowRow(row, cells){
	row.style = null;

	cells.forEach(cell => {
		const hasFK = cell.querySelector('input.factorK');
		if (!hasFK && !cell.innerText.includes('%')){
			cell.style = null;
		}
	});
}

function hideAmzngrRows(row, cells){
	let skuCellNum = 1;

	if (!cells[0].classList.contains("sorting_1")){
		skuCellNum = 0;
	}

	let sku = cells[skuCellNum].innerText;

	if (sku.includes(amznGrForm)){
		row.classList.add(amznGrClass);
	}
}

function setUserMark(row, cells){
	let user = cells[cells.length - 2].innerText;

	if (SuitableUsers.includes(user) == false){
		row.classList.add(wrongUserClass);
	}
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

function addCustomCSS(){
	const style = document.createElement('style');

	if (config.userObserver){
		style.textContent = `
			.${wrongUserClass} {
				background-color: rgba(255, 146, 146, 0.5) !important;
			}
		`;
	}
	
	if (config.rowFixes){
		style.innerHTML += `
			#dt_list .list-col1 .select2 {
				display: none!important;
			}
		`;

		const tableStyle = document.createElement('style');
		tableStyle.innerHTML = `
			.row-highlight{
				background-color: #ffffff !important;
			}
		`;
		document.body.appendChild(tableStyle);
	}

	if (config.hideAmznGr){
		style.innerHTML += `
			.${amznGrClass}{
				display: none!important;
			}
		`;
	}

	document.head.appendChild(style);

}