// ==UserScript==
// @name         PMS FBA InvValue Users Observer
// @version      1.1
// @description  Checking current user in rows!
// @author       Priboy313
// @match        https://pms.plexsupply.com/pms/listfbavalue.xhtml*
// @match        https://pms.officechase.com/pms/listfbavalue.xhtml*
// @match        https://pms.marksonsupply.com/pms/listfbavalue.xhtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=plexsupply.com
// ==/UserScript==

const SuitableUsers = [
	"IgorP",
	"Jerry",
	"IgorDemping"
];

const wrongUserClass = "wrong-user";

(function() {
	'use strict';

	addCustomCSS();

	setSubcribe();
})();

function setSubcribe(){
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
		let user = cells[cells.length - 2].innerText;

		if (SuitableUsers.includes(user) == false){
			row.classList.add(wrongUserClass);
		}

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

function addCustomCSS(){
	const style = document.createElement('style');
    style.textContent = `
        .${wrongUserClass} {
            background-color: rgba(255, 146, 146, 0.5) !important;
        }
    `;
    document.head.appendChild(style);
}