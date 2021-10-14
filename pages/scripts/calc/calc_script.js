var act, num1, str;

// ===================================== Add** ===============================
function ADD(event) { 
	if (document.getElementById("BOX").value == 0) {
		
		document.getElementById("BOX").value = event.currentTarget.innerHTML;
		
	}else		
		document.getElementById("BOX").value += event.currentTarget.innerHTML;
	
	var str = document.getElementById("BOX").value;
	var k = 0;
	var f = -1;
	for (i=0;i<str.length;i++) {
		if (str[i]==".") {k++;f=i;}
	}
	if (k==2) {
		var res1 = str.substr(0,f);
		var res2 = str.substr(f+1,str.length);
		document.getElementById("BOX").value = res1+res2;
		
	}
	
}


// ===================================== Add** ==============================

function CLEAR() {
	var str;
	str = document.getElementById("BOX").value;
	document.getElementById("BOX").value = str.slice(0,str.length-1);

	
	if(document.getElementById("BOX").value == ""){
		document.getElementById("BOX").value = 0;
	}
	
}
function CLEAR_M(){
	document.getElementById("BOX").value = 0;
}

// ===================================== +-*/  ==============================

function SlaboumieAndOtvaga() {
	var evt = event.currentTarget.innerHTML;
	var str = document.getElementById("BOX").value;
	
	switch (event.currentTarget.innerHTML){
		case "-":
		num1 = str;
		act = evt;
		document.getElementById("BOX").value = "0";
		
		break;
		case "+":
		num1 = str;
		act = evt;
		document.getElementById("BOX").value = "0";
		
		break;
		case "*":
		num1 = str;
		act = evt;
		document.getElementById("BOX").value = "0";
		
		break;
		case "/":
		num1 = str;
		act = evt;
		document.getElementById("BOX").value = "0";
		
		break;
		case "Sin":
		document.getElementById("BOX").value = Math.sin(document.getElementById("BOX").value);
		
		break;
		case "Cos":
		document.getElementById("BOX").value = Math.cos(document.getElementById("BOX").value);
		
		break;
		case "%":
		document.getElementById("BOX").value = document.getElementById("BOX").value / 100;
		
		break;
		case "ln":
		document.getElementById("BOX").value = Math.log10(document.getElementById("BOX").value);
		
		break;
		case "log":
		document.getElementById("BOX").value = Math.log(document.getElementById("BOX").value);
		
		break;
		case '<img src="Root-rendered-by-TeX.svg.png">':
		document.getElementById("BOX").value = Math.sqrt(document.getElementById("BOX").value);
		
		break;
		case "^":
		document.getElementById("BOX").value = document.getElementById("BOX").value ** 2;
		
		break;
		default: 
		document.getElementById("BOX").value  = "ERROR";
}
}

function Calc(){
	
	document.getElementById("BOX").value = eval(+num1+act+document.getElementById("BOX").value)
	
}







