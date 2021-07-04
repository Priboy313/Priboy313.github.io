	
    //  https://ficbook.net/readfic/
    
	var bnext = document.getElementsByClassName("btn-next")[0];
	var bback = document.getElementsByClassName("btn-back")[0];

document.addEventListener("keydown", function(event) {
	if(event.keyCode == 17){
		document.addEventListener("keydown", arrowtap);
	}
});

var arrowtap = function(event){
	if(event.keyCode == 39){
		window.open(bnext, "_self");
	} else if(event.keyCode == 37){
		window.open(bback, "_self");
	}
};

$(document).on('keyup',function (event) {
    if (event.ctrlKey) {
      document.removeEventListener("keydown", arrowtap);
    }
});