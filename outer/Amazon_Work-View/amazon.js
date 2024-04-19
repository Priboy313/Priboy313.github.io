console.log('--------------- script injected!');


// price to pay
var price_to_pay_high = document.getElementsByClassName("priceToPay")[0]
var price_to_pay = parseFloat(price_to_pay_high.innerText.replace(/(\r\n|\n|\r)/gm, "").substring(1))

console.log("PRICE: " + price_to_pay);


// volume Amazon discount
let amz_disc_label = document.getElementById('promoMessagingDiscountValue_feature_div');

if (amz_disc_label.innerText.includes(" Amazon discount.")) {
    console.log('Скидка найдена!');
    
    var disc = amz_disc_label.getElementsByClassName('a-offscreen')[0].innerText
    		disc = parseFloat(disc.substring(1))
    
    var full_price = price_to_pay + disc;
    		full_price = full_price.toFixed(2)
    
    console.log("DISCOUNT: " + disc);
    
    var price_box = document.getElementById("corePriceDisplay_desktop_feature_div");
    		price_box.className += " price_box_w_disc";
    
    // add full price to page
    var price_holder = document.getElementById("corePriceDisplay_desktop_feature_div");
    
    var full_price_span = document.createElement('div')
    		full_price_span.className = "a-section a-spacing-none aok-align-center aok-relative custom-full-price"
    		// full_price_span.style.margin = '2px'
    		full_price_span.innerHTML = `Full price: $${full_price}`;
    		
    price_holder.appendChild(full_price_span)
}