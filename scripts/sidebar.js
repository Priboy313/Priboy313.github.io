console.log("%csidebar.js connected!", "color: yellow; font-size: 20px;");

function Open(num){
    var menu = document.getElementById("menu");

    var list = menu.getElementsByClassName("menu_link_list");

    var link = list[num-1].getElementsByTagName("menu_link");

    for (let i = 0; i < list.length; i++) {
        $(list[i]).css({
            "heigth": '1px',
            "display": 'none'
        })
        $(link[i]).css({
            "heigth": '1px',
            "display": 'none'
        })
    }
 
    $(list[num-1]).css({
        "display": 'block'
    })
    
    $(link[0]).css({
        "heigth": '150px'
    })

}