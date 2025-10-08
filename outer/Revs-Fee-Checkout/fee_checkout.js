// ==UserScript==
// @name         Revseller Fee Checkout
// @version      1.0
// @description  Add fee from PMS
// @author       Priboy313
// @match        https://www.amazon.com/*
// @match        https://www.amazon.ca/*
// @match        https://www.amazon.com.mx/*
// @connect      pms.plexsupply.com
// @connect      pms.officechase.com
// @connect      pms.marksonsupply.com
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

const requestURLs = {
	"PL": "https://pms.plexsupply.com/pms/listfbavalue.xhtml?fba-inventory-value-dt&marketPlaceId=5&searchBy=asin&searchValue=ASIN&userId=Not%20selected%20-%20All",
	"OC": "https://pms.officechase.com/pms/listfbavalue.xhtml?fba-inventory-value-dt&marketPlaceId=5&searchBy=asin&searchValue=ASIN&userId=Not%20selected%20-%20All",
	"MK": "https://pms.marksonsupply.com/pms/listfbavalue.xhtml?fba-inventory-value-dt&marketPlaceId=5&searchBy=asin&searchValue=ASIN&userId=Not%20selected%20-%20All"
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

		if (isProhibited) {
			return;
		}

		if (!this.data[corp]) {
            this.data[corp] = [];
        }

        this.data[corp].push(new SKU(sku, price, fee, user));
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
	let asin = currentURL.match(regex);
	return asin[0]
}

function sendGETRequest(asin, url, corp, responses) {
	return new Promise((resolve, reject) => {
		GM_xmlhttpRequest({
			method: 'GET',
			url: url.replace("ASIN", asin),
			onload: function(response) {
				try {
					const data = JSON.parse(response.responseText);
					if (data && data.aaData && data.aaData.length > 0) {
						data.aaData.forEach(item => {
							responses.addSKU(corp, item.referenceId, item.price, item.estimatedFee, item.userName);
						});
					}
					resolve();
				} catch (e) {
					console.error(`Ошибка парсинга JSON для ${corp}:`, e);
					reject(e);
				}
			},
			onerror: function(error) {
				console.error(`Ошибка запроса для ${corp}:`, error);
				reject(error);
			}
		});
	});
}

(async function() {
	'use strict';

	const asin = getASIN();
	const responses = new Responses();
	const requestPromises = Object.keys(requestURLs).map(corp => {
		return sendGETRequest(asin, requestURLs[corp], corp, responses);
	});

	try {
		await Promise.all(requestPromises);

		console.log("Все запросы успешно завершены. Результат:");
		console.log(responses.data);

		// Место под функцию которая будет отображать эти данные на странице

	} catch (error) {
		console.error("Один из запросов завершился с ошибкой:", error);
	}
})();