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

function getCurrentURL(asin, url){
	return url.replace("ASIN", asin);
}

function sendGETRequest(asin, url, corp, responses){
	GM_xmlhttpRequest({
		method: 'GET',
		url: getCurrentURL(asin, url),
		onload: function(response) {
			const data = JSON.parse(response.responseText);

			// console.log("-- aaData: ", data.aaData);

			if (data && data.aaData && data.aaData.length > 0){
				data.aaData.forEach(item => {
					responses.addSKU(corp, item.referenceId, item.price, item.estimatedFee, item.userName);
				});
			} else {
				console.log("Массив aaData не найден или пуст");
			}
		},
		onerror: function(error) {
			console.error('"---- REQUEST ----\n"Request failed:', error);
		}
	});
}

prohibitedSKU = [
	"amzn.gr",
	"RMRT"
]

class Responses{
	constructor(){
		this.skuPL = [];
		this.skuOC = [];
		this.skuMK = [];
	}

	addSKU(corp, sku, price, fee, user){
		const lowerCaseSku = sku.toLowerCase();

		const isProhibited = prohibitedSKU.some(pro => 
			lowerCaseSku.includes(pro.toLowerCase()) 
		);

		if (isProhibited) {
			return;
		}

		let newSKU = new SKU(sku, price, fee, user);

		switch (corp) {
			case "PL":
				this.skuPL.push(newSKU);
				break;

			case "OC":
				this.skuOC.push(newSKU);
				break;

			case "MK":
				this.skuMK.push(newSKU);
				break;
			
			default:
				break;
		}
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

function getASIN(){
	let currentURL = window.location.href;
	let regex = /\bB0\w*\b/g;
	let asin = currentURL.match(regex);
	return asin[0]
}


(function() {
    'use strict';

	let asin = getASIN();

	const responses = new Responses();

	Object.keys(requestURLs).forEach((corp) => {
		sendGETRequest(asin, requestURLs[corp], corp, responses);
	});
	
	console.log(responses);
})();