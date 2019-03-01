import {parse, dataSetBlock, table} from "./mod/sudev.mjs";

gs.defaults.margeG = 70;
gs.defaults.margeB = 60;
gs.defaults.padH = 0.1;
gs.defaults.padB = 0.1;

var dataSetsList = document.querySelector("div#dataSetsList");
const fileInput = document.getElementById("fileInput");

function fileLoadedHandler(e){
	var str = e.target.result;
	var ds = parse(str);
	var block = dataSetBlock(ds);

	block.addEventListener("click", (e)=>{

		for (let b of dataSetsList.childNodes){ b.classList.remove("selected"); }

		if(e.target.nodeName == "P"){ e.target.parentNode.classList.add("selected"); }
		else{ e.target.classList.add("selected"); }

		display(ds);
	});

	for (let b of dataSetsList.childNodes){ b.classList.remove("selected"); }

	dataSetsList.prepend(block);
	display(ds)
	block.classList.add("selected");
}

function read(file){
	var reader = new FileReader();
	reader.onload = fileLoadedHandler;
	reader.readAsText(file);
}

function display(dataSet){
	// Mark dataset as **displayed** in the list
	
	// Clear the graphs
	
	// Clear the info section
	
  // Draw the waveforms
	
	var ts = dataSet.date.getTime();
	let fx = function(d){
		return (d.time.getTime() - dataSet.date.getTime())/1000;
	};
	var fy = (d)=>d.pressure;

	document.querySelector("#pressure").innerHTML = null;
	var graph = new gs.graph("#pressure");
	graph.setscale(dataSet.data, fx, fy);
	graph.tracer(dataSet.data, fx, fy)
		.setidx("Temps (s)")
		.setidy("Pression (cmH₂O)");

	var fy = (d)=>d.flow;

	document.querySelector("#flow").innerHTML = null;
	var graph = new gs.graph("#flow");
	graph.setscale(dataSet.data, fx, fy);
	graph.tracer(dataSet.data, fx, fy)
		.setidx("Temps (s)")
		.setidy("Débit (l/s)");

	var panel = document.querySelector("#panel");
	panel.innerHTML = null;

	var caption = document.createElement("caption");
	caption.textContent = "Paramètres";

	var t = table(dataSet.params);
	t.prepend(caption);
	panel.appendChild(t);

	/*
	var h2 = document.createElement("h2");
	h2.textContent = "Plus";

	panel.appendChild(h2);
	panel.appendChild(table(dataSet.unparsedLines));
	*/
}

fileInput.addEventListener("change", function(){
	dataSetsList.innerHTML = null;

	for(var file of this.files){read(file);}
	if(fileInput.files.length == 0){document.body.classList.add("landing")}
	else{document.body.classList.remove("landing")}
});

window.addEventListener("load", function(){
	dataSetsList.innerHTML = null;

	for(var file of fileInput.files){read(file);}
	if(fileInput.files.length == 0){document.body.classList.add("landing")}
});
