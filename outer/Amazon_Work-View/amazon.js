console.log('--------------- AmazonWorkView injected!');



setTimeout(function() {
	setInterval(function() {
  	set_fee_in_revseller_calc();
	}, 100);
	
	// set_fee_in_revseller_calc();
  set_mirror_links();
  check_hidden_price();
  check_discount();
}, 2500);




function check_discount(){
	var price_to_pay_high = ""
	var price_to_pay = ""

	let amz_disc_label = document.getElementById('promoMessagingDiscountValue_feature_div');
	let amz_disc_label2 = document.getElementById('promoMessaging');
	
	if (amz_disc_label){
		
		if (amz_disc_label.innerText.includes(" Amazon discount.")) {
		    console.log('Скидка найдена! Type 1');
		    price_to_pay_high = document.getElementsByClassName("priceToPay")[0]
				price_to_pay = parseFloat(price_to_pay_high.innerText.replace(/(\r\n|\n|\r)/gm, "").substring(1))
		    
		    set_price(amz_disc_label, "corePriceDisplay_desktop_feature_div", price_to_pay)
		}
		
	} else if (amz_disc_label2) {
		if (amz_disc_label2.innerText.includes(" Amazon discount.")) {
		    console.log('Скидка найдена! Type 2');
		    price_to_pay_high = document.getElementsByClassName("apexPriceToPay")[0]
				price_to_pay = parseFloat(price_to_pay_high.innerText.replace(/(\r\n|\n|\r)/gm, "").substring(1))
		
		    set_price(amz_disc_label2, "corePrice_desktop", price_to_pay)
		}
	} else {console.log("Скидка не найдена.");}
	
}

function set_price(disc_label, price_box_class, price_to_pay){
	console.log("PRICE: " + price_to_pay);
	
	var disc = disc_label.getElementsByClassName('a-offscreen')[0].innerText
  		disc = parseFloat(disc.substring(1))
  
  console.log("DISCOUNT: " + disc);
  
  var full_price = price_to_pay + disc;
  		full_price = full_price.toFixed(2)
  
  console.log("FUll price: " + full_price);
  
  var price_box = document.getElementById(price_box_class);
  		price_box.className += " price_box_w_disc";
  
  // add full price to page
	var price_holder = document.getElementById(price_box_class);
  
  var full_price_span = document.createElement('div')
  		full_price_span.className = "a-section a-spacing-none aok-align-center aok-relative custom-full-price"
  		full_price_span.innerHTML = `Full price: $${full_price}`;
  		
  price_holder.appendChild(full_price_span)
}

function get_fee_from_revseller_calc(){
	
	calc_peak_checkbox = document.getElementById("aic-ext-input-peak")
	
	// console.log(calc_peak_checkbox)
	
	calc_peak_container = document.getElementById("aic-ext-peak-container");
	calc_peak_span = calc_peak_container.getElementsByTagName("span")[0];
	calc_peak_text = calc_peak_span.innerText;
	
	// console.log(calc_peak_text);
	
	let popup_window = document.getElementById("aic-ext-popup-fba-result-available");
	// console.log(popup_window);
	
	let popup_rows = popup_window.getElementsByClassName('aic-ext-bg-white')[0]
	
	let row_referral = popup_rows.getElementsByClassName('aic-ext-flex-row')[1]
	let row_fulfilment = popup_rows.getElementsByClassName('aic-ext-flex-row')[2]
	
	let referral_fee = row_referral.getElementsByTagName('span')[2]
			referral_fee = parseFloat(referral_fee.innerHTML)
	
	let fulfilment_fee_fba = 0;
	
	if (calc_peak_text == "Non-Peak rate" && calc_peak_checkbox.checked == false) {
		// is Peak rate default case! Winter time!
			fulfilment_fee_fba = row_fulfilment.getElementsByTagName('span')[2]
	} else {
		// is Non-Peak rate default case!
			fulfilment_fee_fba = row_fulfilment.getElementsByTagName('span')[1]
	}
			// console.log(fulfilment_fee_fba);
			fulfilment_fee_fba = parseFloat(fulfilment_fee_fba.innerHTML)
	
	let fee_fba = referral_fee + fulfilment_fee_fba
			// console.log(popup_window);
			// console.log(`Referral fee: ${referral_fee}`)
			// console.log(`Fulfilment fee: ${fulfilment_fee_fba}`)
			// console.log(`FBA fee: ${fee_fba}`)

	return [fee_fba, referral_fee]
}

function set_fee_in_revseller_calc(){
	let calc_root = document.getElementsByClassName("aic-ext-@container")[0];
	let calc_body = calc_root.getElementsByClassName("aic-ext-group/calculator")[0];
	let calc_place = calc_body.getElementsByClassName("aic-ext-h-full")[0];
	// console.log(calc_place)
	
	if (!calc_place.getElementsByClassName('custom-fee-row')[0]){
		let calc_fee_row = document.createElement('div')
				calc_fee_row.className = 'custom-fee-row aic-ext-flex aic-ext-items-center aic-ext-justify-center aic-ext-mb-3'
				
		let fee_row_title = document.createElement('div')
				fee_row_title.className = 'aic-ext-w-3/12 aic-ext-text-m aic-ext-text-black group-[.aic-ext-collapsed]/calculator:aic-ext-w-5/12'
				fee_row_title.innerText = 'Fee'
		
		let fee_row_fbm_cell = document.createElement('div')
				fee_row_fbm_cell.className = 'fee-row-fbm-cell aic-ext-w-4/12 aic-ext-text-m aic-ext-text-black aic-ext-text-right aic-ext-pr-[18px] group-[.aic-ext-collapsed]/calculator:aic-ext-hidden'
				fee_row_fbm_cell.innerText = ' '
		
		let fee_row_space_cell = document.createElement('div')
				fee_row_space_cell.className = 'aic-ext-w-1/12 group-[.aic-ext-collapsed]/calculator:aic-ext-hidden'
		
		let fee_row_fba_cell = document.createElement('div')
				fee_row_fba_cell.className = 'fee-row-fba-cell aic-ext-w-4/12 aic-ext-text-right aic-ext-text-m aic-ext-text-black aic-ext-pr-[18px] @xl:group-[.aic-ext-collapsed]/calculator:aic-ext-flex-1 @xl:group-[.aic-ext-collapsed]/calculator:aic-ext-flex-grow'
				fee_row_fba_cell.innerText = ' '
		
		calc_fee_row.appendChild(fee_row_title)
		calc_fee_row.appendChild(fee_row_fbm_cell)
		calc_fee_row.appendChild(fee_row_space_cell)
		calc_fee_row.appendChild(fee_row_fba_cell)
		
		calc_place.appendChild(calc_fee_row)
	} else {
		
		let fee_row_fba_cell = calc_place.getElementsByClassName('fee-row-fba-cell')[0];
		let fee_row_fbm_cell = calc_place.getElementsByClassName('fee-row-fbm-cell')[0];
		
		let fee = get_fee_from_revseller_calc();
		let fba_fee = fee[0].toFixed(2);
		let fbm_fee = fee[1].toFixed(2);
			
		if (fee_row_fba_cell.innerText != fba_fee)
		{
			fee_row_fba_cell.innerText = fba_fee;
			fee_row_fbm_cell.innerText = fbm_fee;
		}
		
	}
	

}


function check_hidden_price(){
	var price_hide_box = document.getElementById("corePriceDisplay_desktop_feature_div");
		// price_hide_box.className += " price_box_w_disc";

	if (price_hide_box){
		if (price_hide_box.innerText.includes("See price in cart")){
			console.log("HIDDEN PRICE FINDED!");
			
			// hidden_price = document.getElementsByClassName("aic-ext-offers-row")[0]
			// hidden_price = hidden_price.getElementsByClassName("aic-ext-offers-item")[3]
			// hidden_price = hidden_price.getElementsByClassName("aic-ext-offers-item-body-price")[0]
			// hidden_price = parseFloat(hidden_price.innerText.substring(1))
			
			// console.log(hidden_price)
			
			// var full_price_span = document.createElement('div')
  	// 	full_price_span.className = "a-section a-spacing-none aok-align-center aok-relative custom-full-price"
  	// 	full_price_span.innerHTML = `Hidden price: $${hidden_price}`;
  		
  		price_hide_box.className += " price_box_w_disc";
  		// price_hide_box.appendChild(full_price_span)
		}
	}
}


function set_mirror_links(){
	var title_section = document.getElementById("titleSection")
	
	let currentURL = window.location.href;
  let regex = /\bB0\w*\b/g;
  let asin = currentURL.match(regex);
  		asin = asin[0]

	
	var title_link_section = document.createElement("div")
			title_link_section.className = "title_link_section"
	
	var link_us = document.createElement("a")
			link_us.className = "amazon_mirror_link"
			link_us.innerText="AmzUS"
			link_us.href = `https://www.amazon.com/gp/product/`
			
	var link_ca = document.createElement("a")
			link_ca.className = "amazon_mirror_link"
			link_ca.innerText="AmzCA"
			link_ca.href = `https://www.amazon.ca/gp/product/`
			
	var link_mx = document.createElement("a")
			link_mx.className = "amazon_mirror_link"
			link_mx.innerText="AmzMX"
			link_mx.href = `https://www.amazon.com.mx/gp/product/`
	
	title_section.appendChild(title_link_section)
	
	if (asin) {
		console.log("ASIN: " + asin);
		
			link_us.innerText="AmzUS"
			link_us.href = `https://www.amazon.com/gp/product/${asin}`
	
			link_ca.innerText="AmzCA"
			link_ca.href = `https://www.amazon.ca/gp/product/${asin}`
	
			link_mx.innerText="AmzMX"
			link_mx.href = `https://www.amazon.com.mx/gp/product/${asin}`
		
	} else {
		console.log("--! ASIN not found in page info !--");
		
		let error_asin_span = document.createElement('span')
				error_asin_span.innerText = "ASIN not found\n"
		
		title_link_section.appendChild(error_asin_span)
		
	}

	title_link_section.appendChild(link_us)
	title_link_section.appendChild(link_ca)
	title_link_section.appendChild(link_mx)
	
}