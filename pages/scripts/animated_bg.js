
var row_icons = [
	"fas fa-copyright",
	"fab fa-discord",
	"fab fa-html5",
	"fas fa-file-code",
	"fab fa-github",
	"fab fa-python",
	"fab fa-steam",
	"fab fa-unity",
	"fas fa-ruble-sign",
	"fab fa-rust",
	"fas fa-info",
	"fab fa-btc",
	"fab fa-opera",
	"fas fa-yen-sign",
	"fab fa-css3-alt",
	"fas fa-italic",
	"fab fa-css3-alt",
	"fas fa-user-secret",
	"fab fa-app-store",
	"fas fa-atom",
	"fas fa-battery-three-quarters",
	"fas fa-bell-slash",
	"fab fa-bitbucket",
	"fab fa-bluetooth",
	"fas fa-broadcast-tower",
	"fab fa-chrome",
	"fas fa-wifi"
	]

var screen_width = $(window).width();
var screen_height = $(window).height();
var main_size = screen_width >= screen_height ? screen_width : screen_height;

var row_sum = Math.floor(main_size / 64) + 10;
var row_len = Math.floor(main_size / (64 * row_icons.length)) + 2;


//заполнение фона бегущими строчками
var section = document.getElementsByClassName("back_animated_section")[0];
for (let i = 0; i < row_sum; i++) {
	section.appendChild(Get_row());
}

function Get_row(){
	var newrow = document.createElement("div");
	newrow.classList = "row";

	var row_div = document.createElement("div");
	var row_div2 = document.createElement("div");
	for(i = 0; i < row_len; i++){
		for (value in row_icons){
			var icon = document.createElement('i');
			var icon2 = document.createElement('i');
			fclass = "";
			sclass = "";
			fclass = row_icons[value].slice(0, row_icons[value].indexOf(" "));
			sclass = row_icons[value].slice(row_icons[value].indexOf(" ") + 1);
			icon.classList.add(fclass, sclass);
			icon2.classList.add(fclass, sclass);

			icon.addEventListener("click", function() {
				this.classList += " i_active";
			});
			icon2.addEventListener("click", function() {
				this.classList += " i_active";
			});

			row_div.appendChild(icon);
			row_div2.appendChild(icon2);
		}
	}
	newrow.appendChild(row_div);
	newrow.appendChild(row_div2);
	return newrow
}

