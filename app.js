import {parse, dataSetBlock} from "./mod/sudev.mjs";

gs.defaults.margeG = 70;
gs.defaults.margeB = 60;
gs.defaults.padH = 0.1;
gs.defaults.padB = 0.1;

var dataSets = [];
var dataSetsList = document.querySelector("div#dataSetsList");
const fileInput = document.getElementById("fileInput");

function fileLoadedHandler(e){
	var str = e.target.result;
	var ds = parse(str);
	var block = dataSetBlock(ds);

	dataSetsList.appendChild(block);
	dataSets.push(ds);
	display(ds);
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
	
}

fileInput.addEventListener("change", function(){
	dataSets = [];
	dataSetsList.innerHTML = null;

	for(var file of this.files){read(file);}
});
