
var menu = document.getElementsByClassName('menu')[0];

for(x=0; x < 4; x++){
	var menu_btn = document.createElement("a")
		menu_btn.classList.add("menu_btn")
		values = SetBtnContent(x);
			menu_btn.href = values.href;
			menu_btn.innerHTML = values.cont;

	for(y=0; y<4; y++){
		var menu_btn_dec = document.createElement("span")
			menu_btn_dec.classList.add("menu_btn_dec")
		menu_btn.appendChild(menu_btn_dec)
	}
	menu.appendChild(menu_btn)
}

function SetBtnContent(num){
	switch (num) {
		case 0:
			href = "https://priboy313.github.io/";
			cont = "Главная";
			break;
		case 1:
			href = "/pages/about.html";
			cont = "Обо мне";
			break;
		case 2:
			href = "/pages/projects.html";
			cont = "Проекты";
			break;
		case 3:
			href = "#";
			cont = "Мини";
			break;
	
		default:
			href = "#"
			cont = ""
			break;
	}
	return {
		href: href,
		cont: cont,
	};
}