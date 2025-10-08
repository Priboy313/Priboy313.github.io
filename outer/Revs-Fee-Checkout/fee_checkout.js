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
					const referenceId = item.referenceId;
					const price = item.price;
					const estimatedFee = item.estimatedFee;
					const user = item.userName;

					// console.log("---- REQUEST ----\n", `${corp}: ${referenceId} - $${estimatedFee}`);

					responses.addSKU(corp, referenceId, price, estimatedFee, user);
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

class Responses{
	constructor(){
		this.skuPL = [];
		this.skuOC = [];
		this.skuMK = [];
	
		this.prohibitedSKU = [
			"amzn.gr",
			"RMRT"
		]
	}

	addSKU(corp, sku, price, fee, user){
		const lowerCaseSku = sku.toLowerCase();

		const isProhibited = this.prohibitedSKU.some(pro => 
			lowerCaseSku.includes(pro.toLowerCase()) 
		);

		if (isProhibited) {
			return;
		}

		switch (corp) {
			case "PL":
				this.skuPL.push(new SKU(sku, price, fee, user));
				break;

			case "OC":
				this.skuOC.push(new SKU(sku, price, fee, user));
				break;

			case "MK":
				this.skuMK.push(new SKU(sku, price, fee, user));
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