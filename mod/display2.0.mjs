//import {graph} from '../graphsimple.js/graphsimple.js'
import {graph} from 'https://progrt.github.io/graphsimple.js/graphsimple.js'
import {drange} from './drange.mjs'

let defaults = {
	params: [
		'AirwayPressure',
		'TotalVolume',
		'PRESSION',
		'DÉBIT',
		//'VOLUME',
		'Edi'
	],
};

export class display {
	constructor(target, param){

		if(param){
			for(var i in param){
				this[i] = param [i];
			}
		}

		for(var i in defaults){
			if(!this[i]){this[i] = defaults[i]}
		}

		this.graphs = [];
		this.target = document.querySelector(target);

		this.graphDiv = document.createElement('div');
		this.graphDiv.id = 'sudevGrdiv';
		this.target.appendChild(this.graphDiv);

		this.infoDiv = document.createElement('div');
		this.infoDiv.id = 'sudevInfodiv';
		this.target.appendChild(this.infoDiv);
	}

	display(dataset){
		//console.table(dataset.monitored);
		this.dataset = dataset;
		//this.fx = d => (d.Durée.getTime() - dataset.date.getTime())/1000;
		this.fx = d=>d.Time;

		//let availableParams = dataset.monitoredParams.map(d=>d.split(' ')[0]);
		var availableParams = dataset.monitored.map(d=>d.id);
		this.plotable = dataset.monitored.filter(d=>this.params.includes(d.id));
		
		this.graphs = [];
		this.graphDiv.innerHTML = null;

		for(let p of this.plotable){
			this.makeGraph(dataset, p);
		}

		if(this.zoomable){this.createPager()}

		this.makeTable(dataset);
	}

	createPager(){
		let data = this.dataset.data;
		let fy = d => d[this.plotable[0].id];

		d3.select(this.graphDiv)
			.append('svg')
			.attr('id', 'grPager');

		this.pager = new graph('#grPager')
			.setscale(data, this.fx, fy)
			.tracer(data, this.fx, fy)
			.setidx("Temps (s)")
			.setidy(this.plotable[0].label);

		this.pager.plagex(
			this.pager.echellex(0),
			this.pager.echellex(data.length - 1),
			'',
			0
		);

		let rParam = {
			target: this.graphDiv,
			min: 0 ,
			max: data.length - 1,
			marginLeft : this.graphs[0].margeG + 'px',
			marginRight : this.graphs[0].margeD + 'px',
			inputHandler: this.updateZoom,
		}

		this.range = new drange(rParam);
	}

	makeGraph(dataset, param){
		let data = dataset.data;

		d3.select(this.graphDiv)
			.append('svg')
			.attr('id', 'gr'+param.id);

		let fy = d => d[param.id];

		this.graphs.push(
			new graph('#gr' + param.id)
			.setscale(data, this.fx, fy)
			.tracer(data, this.fx, fy)
			.setidx("Temps (s)")
			.setidy(param.label)
		);
	}

	updateZoom = ()=>{
		let data = this.dataset.data;
		let dataStart = data[0].Time;

		let tStart = this.range.start;
		let tEnd = this.range.end;

		let plage = this.pager.plagesx[0];
		plage.min = this.fx(data[tStart]);
		plage.max = this.fx(data[tEnd]);
		this.pager.plagexDraw(plage);

		this.subset = data.filter((d, i)=>{
			return i > tStart && i < tEnd;	
		});

		// Reducing functions
		var rData = [];
		for(let r of this.reducers||[]){
			var result = this.subset.reduce(r.f, 0);
			if(r.round){result = Math.round(result)}
			if(result){
				rData.push([r.name, result, r.unit]);
			}
		}
		var rTable = document.querySelector('#rTable');
		if(rTable){rTable.remove()};
		rTable = table(rData);
		rTable.id = 'rTable';
		this.infoDiv.appendChild(rTable);


		for(var gr of this.graphs){
			gr.donnees[0].donnees = this.subset;
			let d0 = gr.donnees[0];
			gr.setscale(d0.donnees, d0.fx, d0.fy);
			for(var c of gr.courbes){c.remove()}
			for(var d of gr.donnees){gr.Tracer(d.donnees, d.fx, d.fy)}
			gr.drawGridX();
			gr.drawGridY();
		}

	}

	makeTable(dataset){
		this.infoDiv.innerHTML = null;

		// Main table

		if(dataset.params){
			var caption = document.createElement("caption");
			caption.textContent = "Paramètres";

			var t = table(dataset.params);

			t.prepend(caption);
			this.infoDiv.appendChild(t);
		}

		//Second table

		if(dataset.unparsed){
			var details = document.createElement('details');
			var t2 = table(dataset.unparsed);
			details.appendChild(t2);
			this.infoDiv.appendChild(details);
		}

	}

	redraw = ()=>{
		for(var gr of this.graphs){
			gr.redessiner();
		}
	}
}

function table(data){

	var table = document.createElement("table");
	table.classList.add("params");

	for (var row of data){
		var tr = document.createElement("tr");

		for (var item of row){
			var td = document.createElement("td");
			td.textContent = item;
			tr.appendChild(td);
		}

		table.appendChild(tr);
	}
	
	return table;
}
