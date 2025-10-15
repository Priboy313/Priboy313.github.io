// ==UserScript==
// @name         PMS FBA InvValue Observer
// @version      1.2
// @description  Apply fixes for PMS FBA Inventory Value!
// @author       Priboy313
// @match        https://pms.plexsupply.com/pms/listfbavalue.xhtml*
// @match        https://pms.officechase.com/pms/listfbavalue.xhtml*
// @match        https://pms.marksonsupply.com/pms/listfbavalue.xhtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=plexsupply.com
// ==/UserScript==

const config = {
	rowFixes: true,
	userObserver: true,
	hideAmznGr: true,
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
		
		if (config.userObserver){
			setUserMark(row, cells)
		}

		if (config.hideAmznGr){
			hideAmzngrRows(row, cells);
		}
	});
}

function hideAmzngrRows(row, cells){
	let sku = cells[1].innerText;

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
	if (config.userObserver){
		const style = document.createElement('style');
		style.textContent = `
			.${wrongUserClass} {
				background-color: rgba(255, 146, 146, 0.5) !important;
			}
		`;
		document.head.appendChild(style);
	}

	if (config.rowFixes){
	    const labelStyle = document.createElement('style');
		labelStyle.innerHTML = `
			#dt_list .list-col1 .select2 {
				display: none!important;
			}
		`;
		document.head.appendChild(labelStyle);

		const tableStyle = document.createElement('style');
		tableStyle.innerHTML = `
			.row-highlight{
				background-color: #ffffff !important;
			}
		`;
		document.body.appendChild(tableStyle);
	}

	if (config.hideAmznGr){
		const gradeStyle = document.createElement('style');
		gradeStyle.innerHTML = `
			.${amznGrClass}{
				display: none!important;
			}
		`;
		document.head.appendChild(gradeStyle);
	}
}