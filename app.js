import {parse, dataSetBlock} from "./mod/sudev.mjs";

var dataSets = [];
var dataSetsList = document.querySelector("div#dataSetsList");
const fileInput = document.getElementById("fileInput");

function fileLoadedHandler(e){
		var str = e.target.result;
		var ds = parse(str);
		var block = dataSetBlock(ds);

		dataSetsList.appendChild(block);
		dataSets.push(ds);
}

function read(file){
	var reader = new FileReader();
	reader.onload = fileLoadedHandler;
	reader.readAsText(file);
}

fileInput.addEventListener("change", function(){
	dataSets = [];
	dataSetsList.innerHTML = null;

	for(var file of this.files){read(file);}
});
