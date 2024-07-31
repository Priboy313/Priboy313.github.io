let bad_url = "health.amazon.com";

let referrer = document.referrer;


if (referrer){
	if (!referrer.includes(bad_url)){
		window.location.href = referrer;	
	}
}


console.log('URL реферера:', referrer);