// ==UserScript==
// @name         PMS FBA InvValue Users Observer
// @version      1.0
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

	const table = document.querySelector('.table-hover');
	const tableBody = table.querySelector('tbody');
	// console.log(tableBody);

	const observer = subscribeToTableUpdates(table, (updatedTable) => {
		// console.log('Таблица обновлена!');

		checkTableRows(updatedTable);
	});
})();

function checkTableRows(tableBody){
	let rows = tableBody.querySelectorAll('tr');
	rows = Array.from(rows).slice(1);
	
	rows.forEach(row => {
		let cells = row.querySelectorAll('td');
		let user = cells[cells.length - 2].innerText;

		// console.log("Row: ", row);
		// console.log("User: ", user);

		if (SuitableUsers.includes(user) == false){
			setCustomClass(row);
		}

	});
}

function setCustomClass(row){
	if (!row.classList.contains(wrongUserClass)) {
        row.classList.add(wrongUserClass);
    }
}

function subscribeToTableUpdates(tableElement, callback) {
	if (!tableElement || !(tableElement instanceof Node)) {
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
            color: red !important;
        }
    `;
    document.head.appendChild(style);
}