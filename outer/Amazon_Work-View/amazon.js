// console.log('--------------- script injected!');



// --------------- 
var price_to_pay_high = ""
var price_to_pay = ""


// volume Amazon discount
let amz_disc_label = document.getElementById('promoMessagingDiscountValue_feature_div');
let amz_disc_label2 = document.getElementById('promoMessaging');

if (amz_disc_label){
	
	
	if (amz_disc_label.innerText.includes(" Amazon discount.")) {
	    console.log('Скидка найдена! Type 1');
	    price_to_pay_high = document.getElementsByClassName("priceToPay")[0]
			price_to_pay = parseFloat(price_to_pay_high.innerText.replace(/(\r\n|\n|\r)/gm, "").substring(1))
	    
	    set_price(amz_disc_label, "corePriceDisplay_desktop_feature_div")
	}
	
} else if (amz_disc_label2) {
	if (amz_disc_label2.innerText.includes(" Amazon discount.")) {
	    console.log('Скидка найдена! Type 2');
	    price_to_pay_high = document.getElementsByClassName("apexPriceToPay")[0]
			price_to_pay = parseFloat(price_to_pay_high.innerText.replace(/(\r\n|\n|\r)/gm, "").substring(1))
	
	    set_price(amz_disc_label2, "corePrice_desktop")
	}
} else {console.log("Скидка не найдена.");}


function set_price(disc_label, price_box_class){
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

setTimeout(function() {
    // Код, который нужно выполнить после трех секунд
    check_hide_price();
}, 3000);


// hide boybox price replacement
function check_hide_price(){
	var price_hide_box = document.getElementById("corePriceDisplay_desktop_feature_div");
		// price_hide_box.className += " price_box_w_disc";

	if (price_hide_box){
		if (price_hide_box.innerText.includes("See price in cart")){
			console.log("HIDE PRICE FINDED!");
			
			hide_price = document.getElementsByClassName("aic-ext-offers-row")[0]
			hide_price = hide_price.getElementsByClassName("aic-ext-offers-item")[3]
			hide_price = hide_price.getElementsByClassName("aic-ext-offers-item-body-price")[0]
			hide_price = parseFloat(hide_price.innerText.substring(1))
			
			console.log(hide_price)
			
			var full_price_span = document.createElement('div')
  		full_price_span.className = "a-section a-spacing-none aok-align-center aok-relative custom-full-price"
  		full_price_span.innerHTML = `Hide price: $${hide_price}`;
  		
  		price_hide_box.className += " price_box_w_disc";
  		price_hide_box.appendChild(full_price_span)
		}
	}
}