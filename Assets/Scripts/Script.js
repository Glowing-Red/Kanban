let showing = false;

function DropDown(){
    svg = document.getElementById("svg")
    path = document.getElementById("path")

    if(!showing){
        document.getElementById("drop-down").classList.add("show")
        showing = true;
        svg.classList.remove("bi-arrow-up-short");
        svg.classList.add("bi-arrow-down-short");
        path.setAttribute("d", "M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4")
        
    }else{
        document.getElementById("drop-down").classList.remove("show")
        showing = false;
        svg.classList.remove("bi-arrow-down-short");
        svg.classList.add("bi-arrow-up-short");
        path.setAttribute("d", "M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5");
    }
}

function Selected(element){
    document.getElementById("select-text").innerText = "Selected: " + element.innerText;
    document.getElementById("drop-down").classList.remove("show")
    showing = false;
}

function PopUp(){
    document.getElementById("pop-overlay").classList.add("show")
}