document.addEventListener("keydown", function(event) {
	if(event.keyCode == 113 && document.activeElement.classList.contains("im-chat-input--text")){
		var field = document.activeElement;
			if(field.innerHTML == "хелп"){
				var help = "";
				for (let key of Tags.keys()){
					if(key != "дублируй_меня_полностью") help += key + "<br />";
				}
				var length = Tags.size - 1;
				field.innerHTML = "Команд: " + length + '<br />' + help;
				}else{
				for (let key of Tags.keys()) {
					if (field.innerHTML == key && field != "дублируй_меня_полностью") {
						field.innerHTML = Tags.get(key);
					}
	}}}});
	
	//меню
	var dialog = document.getElementsByClassName("im_chat-input--buttons");
	//миниатюра
	var picwin = document.createElement("div");
		picwin.className = "autopic";
		$(picwin).css({
			"display": "block",
			"font-size": "23px",
			"width": "23px",
			"height": "23px",
			"margin": "auto 3px auto 0",
			"cursor": "default"
		});
			picwin_pic = document.createElement("img");
			picwin_pic.src = "data:image/svg+xml;charset=utf-8,%3Csvg%20fill%3D%22none%22%20height%3D%2220%22%20width%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20clip-rule%3D%22evenodd%22%20d%3D%22M6.84%2016.44c.76.06%201.74.06%203.16.06%201.42%200%202.4%200%203.16-.06a3.75%203.75%200%20001.43-.32%203.5%203.5%200%20001.53-1.53c.15-.29.26-.69.32-1.43l.03-.63-1.3-1.3c-.3-.3-.5-.5-.67-.64a.86.86%200%2000-.27-.18.75.75%200%2000-.46%200%20.86.86%200%2000-.27.18c-.16.13-.36.33-.67.64l-2.3%202.3a.75.75%200%2001-1.06%200l-.3-.3c-.3-.3-.5-.5-.67-.64a.86.86%200%2000-.27-.18.75.75%200%2000-.46%200%20.86.86%200%2000-.27.18c-.16.13-.36.33-.67.64L4.56%2015.5c.25.24.53.45.85.6.29.16.69.27%201.43.33zm9.39-6.27l.27.27V10c0-1.42%200-2.4-.06-3.16a3.75%203.75%200%2000-.32-1.43%203.5%203.5%200%2000-1.53-1.53%203.75%203.75%200%2000-1.43-.32A43.2%2043.2%200%200010%203.5c-1.42%200-2.4%200-3.16.06-.74.06-1.14.17-1.43.32a3.5%203.5%200%2000-1.53%201.53c-.15.29-.26.69-.32%201.43A43.2%2043.2%200%20003.5%2010c0%201.42%200%202.4.06%203.16.04.47.1.8.17%201.05l2.04-2.04.02-.02c.28-.28.52-.52.74-.7.23-.2.47-.37.77-.47.46-.15.94-.15%201.4%200%20.3.1.54.27.77.46.16.14.34.3.53.5l1.77-1.77.02-.02c.28-.28.52-.52.74-.7.23-.2.47-.37.77-.47.46-.15.94-.15%201.4%200%20.3.1.54.27.77.46.22.19.46.43.74.7zM2.54%204.73C2%205.8%202%207.2%202%2010c0%202.8%200%204.2.54%205.27a5%205%200%20002.19%202.19C5.8%2018%207.2%2018%2010%2018c2.8%200%204.2%200%205.27-.54a5%205%200%20002.19-2.19C18%2014.2%2018%2012.8%2018%2010c0-2.8%200-4.2-.55-5.27a5%205%200%2000-2.18-2.19C14.2%202%2012.8%202%2010%202c-2.8%200-4.2%200-5.27.54a5%205%200%2000-2.19%202.19zM7.25%206a1.25%201.25%200%20100%202.5%201.25%201.25%200%20000-2.5z%22%20fill%3D%22%235181b8%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E";
			$(picwin_pic).css({
				"height": "23px",
				"-webkit-filter": "grayscale(100%)",
    			"filter": "grayscale(100%)"
			});
		dialog[0].appendChild(picwin);
		picwin.appendChild(picwin_pic);
	//тело
	var picwin_block = document.createElement("div");
		picwin_block.className = "autopic_expanded";
		$(picwin_block).css({
			"padding": "5px",
			"font-size": "13px",
			"position": "relative",
				"bottom": "357px",
				"right": "285px",
			"width": "300px",
			"height": "300px",
			"background-color": "rgb(58, 58, 58)",
			"border-radius": "3%",
			"box-shadow": "1px 1px 3px rgb(40, 40, 40)", 
			"opacity": "0",
			"visibility": "hidden",
			"transition-property":  "opacity, visibility",
		    "transition-duration": ".3s, .3s",
		    "transition-delay": ".15s, .15s"
		});
		picwin.appendChild(picwin_block);
		$(picwin).hover(function(){
			$(picwin_block).css({
				"opacity": "1",
				"visibility": "visible",
			});
		},function(){
			$(picwin_block).css({
				"opacity": "0",
				"visibility": "hidden"
			});
		});
	//head
	var picwin_block_head = document.createElement("div");
		picwin_block_head.className = "autopic_head";
		picwin_block_head.innerHTML = "AutoPic by Priboy313";
		$(picwin_block_head).css({
			"width": "100%",
			"border-bottom":"solid 1px white",
			"text-align":"center"
		});
		picwin_block.appendChild(picwin_block_head);
	//content
	var picwin_block_cont = document.createElement("div");
		picwin_block_cont.className = "autopic_cont";
		picwin_block_cont.innerHTML = "";
		$(picwin_block_cont).css({
			"overflow-y": "scroll",
			"padding-top": "2px",
			"height": "275px",
			"width": "300px",
			"margin-top": "2px"
		});
		picwin_block.appendChild(picwin_block_cont);
	//left tab
	var picwin_block_cont_left = document.createElement("div");
		picwin_block_cont_left.className = "contTab contL";
		picwin_block_cont_left.innerHTML = "";
		$(picwin_block_cont_left).css({
			"display": "inline-block",
			"width": '145px',
			"float": 'left',
			"margin-left": "3px"
		});
		picwin_block_cont.appendChild(picwin_block_cont_left);
	//right tab
	var picwin_block_cont_right = document.createElement("div");
		picwin_block_cont_right.className = "contTab contR";
		picwin_block_cont_right.innerHTML = "";
		$(picwin_block_cont_right).css({
			"display": "inline-block",
			"width": '145px',
		});
		picwin_block_cont.appendChild(picwin_block_cont_right);
		
	var cont__i = 1;
		Tags.forEach(function(value,key){
			if(key != "дублируй_меня_полностью"){
				//оболочка
				var cont_but = document.createElement("div");
					cont_but.className = "autopic_pic_but";
					cont_but.style.margin = "2px";
				//имя
				var nam = document.createElement("div")
					nam.className = "autopic_pic_name";
					nam.style.textAlign = "center";
					nam.innerHTML = key;
				//картинка
				var min = document.createElement("input");
					min.type = "image";
					min.src = value;
					min.className = "autopic_pic";
					min.style.width = "140px";
					min.style.verticalAlign = "middle";
					min.style.boxShadow = "1px 2px 3px rgb(40, 40, 40)";
					min.addEventListener("mouseup", function(){
						var field = document.getElementsByClassName("im-chat-input--text")[0];
							field.focus();
							field.innerHTML = value;
					});
					
					cont_but.appendChild(nam); //добавление имени в оболочку
					cont_but.appendChild(min); //добавление картинки в оболочку
					
				//вставка оболочки в таблицу
				if(cont__i % 2 != 0){
					picwin_block_cont_left.appendChild(cont_but);
					cont__i++;
				}else{
					picwin_block_cont_right.appendChild(cont_but);
					cont__i++;
				}
		}});
