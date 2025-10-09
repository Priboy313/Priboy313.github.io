// ==UserScript==
// @name         Revseller Fee Checkout
// @version      1.0
// @description  Add fee from PMS
// @author       Priboy313
// @match        https://www.amazon.com/*
// @connect      pms.plexsupply.com
// @connect      pms.officechase.com
// @connect      pms.marksonsupply.com
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

const requestURLs = {
	"PL": "https://pms.plexsupply.com/pms/listfba.xhtml?searchByAsin=ASINPLC",
	"OC": "https://pms.officechase.com/pms/listfba.xhtml?searchByAsin=ASINPLC",
	"MK": "https://pms.marksonsupply.com/pms/listfba.xhtml?searchByAsin=ASINPLC"
};

const prohibitedSKU = [
	"amzn.gr",
	"RMRT"
];

class Responses{
	constructor() {
        this.data = {};
    }

	addSKU(corp, sku, price, fee, user){
		const lowerCaseSku = sku.toLowerCase();

		const isProhibited = prohibitedSKU.some(pro => 
			lowerCaseSku.includes(pro.toLowerCase()) 
		);

		if (isProhibited
			|| fee <= 0
		) {
			return;
		}

		if (!this.data[corp]) {
            this.data[corp] = [];
        }

        this.data[corp].push(new SKU(sku, price, fee, user));
	}

	parseResponseTableBody(corp, tableBody){
		const rows = tableBody.querySelectorAll(".table-order");

		Array.from(rows).forEach((row) => {
			const cells = row.querySelectorAll("td");

			const sku = cells[1].querySelector("a").innerText;

			let price = cells[4].innerText.replace('$', '').split(': ')[0];
			price = parseFloat(price);
			
			let fee = 0
			try {
				fee = cells[14].innerText.split('$')[1].split(': ')[0];
				fee = parseFloat(fee);
			} catch {}

			const user = cells[17].innerText;

			if (!sku || !price || !fee || !user) {
				return;
			}

			this.addSKU(corp, sku, price, fee, user);
		});
	}
}

class SKU{
	constructor(sku, price, fee, user){
		this.sku = sku;
		this.price = price;
		this.fee = fee;
		this.user = user;
	}
}

function getASIN() {
	let currentURL = window.location.href;
	let regex = /\bB0\w*\b/g;
	let match = currentURL.match(regex);

	return match ? match[0] : null;
}

function sendGETRequest(asin, reqUrl, corp, responses, parser) {
	return new Promise((resolve, reject) => {
		GM_xmlhttpRequest({
			method: 'GET',
			url: reqUrl.replace("ASINPLC", asin),
			onload: function(response) {
				try {
					const data = parser.parseFromString(response.responseText, "text/html");
					const responseTable = data.querySelector("#dt_list");

					if (!responseTable){
						console.log(`--> Таблица #dt_list не найдена для ${corp}.`);
						resolve();
						return;
					}

					const responseTableBody = responseTable.querySelector("tbody");

					if (!responseTableBody){
						console.log(`--> Тело таблицы #dt_list не найдена для ${corp}.`);
						resolve();
						return;
					}

					responses.parseResponseTableBody(corp, responseTableBody);

					resolve();
				} catch (e) {
					console.error(`----- Ошибка парсинга для ${corp}:`, e);
					reject(e);
				}
			},
			onerror: function(error) {
				console.error(`----- Ошибка запроса для ${corp}:`, error);
				reject(error);
			}
		});
	});
}

function waitForElement(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }
            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

async function getSKUCustomTableFromRevSeller(){
	
	await waitForElement("#aic-ext-calculator");
	
	let revWrapper = document.getElementById("aic-ext-calculator");
	let revCustomTableRoot = revWrapper.getElementsByTagName("div")[0];
	
	const customTable = document.createElement("div");
	customTable.classList.add("custom-pms-fee-table-div");

	revCustomTableRoot.appendChild(customTable);

	console.log(revCustomTableRoot);
	

	return customTable;
}

function setRequestedSKUToCustomTable(responses, customTable){

}

(async function() {
	'use strict';

	const asin = getASIN();

	if (asin == null){
		console.error("ASIN не найден!");
		return;
	}

	const responses = new Responses();
	const parser = new DOMParser();

	// const requestPromises = Object.keys(requestURLs).map(corp => {
	// 	return sendGETRequest(asin, requestURLs[corp], corp, responses, parser);
	// });

	// const results = await Promise.allSettled(requestPromises);

	// results.forEach((result, index) => {
	// 	if (result.status === 'rejected') {
	// 		const corp = Object.keys(requestPromises)[index];
	// 		console.error(`Запрос для ${corp} завершился критической ошибкой:`, result.reason);
	// 	}
	// });

	console.log(" ----- RESPONSES ----- \nЗапросы успешно завершены. Результат:");
	console.log(responses.data);

	const customTable = await getSKUCustomTableFromRevSeller();
	setRequestedSKUToCustomTable(responses, customTable);
})();