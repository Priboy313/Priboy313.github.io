
	$.getScript("https://raw.githack.com/Priboy313/AutoPic/main/autopic_db_p.js", function(){
		var head = document.getElementsByTagName("head");
		
		var jq_link = document.createElement("script");
			jq_link.type = "text/javascript";
			jq_link.async = "";
			jq_link.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js";
	
		var js_link = document.createElement("script");
			js_link.type = "text/javascript";
			js_link.async = "";
			js_link.defer = "";
			js_link.src = "https://priboy313.github.io/src/outer/AutoPic/autopic.js";
			
			head[0].appendChild(jq_link);
			head[0].appendChild(js_link);
	});
