
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

for (let i = 0; i < 20; i++) {
	Full_master()
}

function Full_master(){
	var section = document.getElementsByClassName("back_animated_section")[0];

	section.appendChild(Dungeon())
}

function Dungeon(){
	var newrow = document.createElement("div")
	newrow.classList.add("row")

	var row_div = document.createElement("div")
	var row_div2 = document.createElement("div")
	for (value in row_icons){
		var icon = document.createElement('i')
		var icon2 = document.createElement('i')
		fclass = ""
		sclass = ""
		for (x in row_icons[value]){
			fclass = row_icons[value].slice(0, row_icons[value].indexOf(" "))
			sclass = row_icons[value].slice(row_icons[value].indexOf(" ") + 1)
			icon.classList.add(fclass, sclass)
			icon2.classList.add(fclass, sclass)
			row_div.appendChild(icon)
			row_div2.appendChild(icon2)
		}
	}
	newrow.appendChild(row_div)
	newrow.appendChild(row_div2)
	return newrow
}

