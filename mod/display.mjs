import {graph} from './graphsimple.mjs'

export class display {
	constructor(target){
		this.graphs = [];
		this.target = document.querySelector(target);

		this.graphDiv = document.createElement('div');
		this.graphDiv.id = 'sudevGrdiv';
		this.target.appendChild(this.graphDiv);

		let o = new ResizeObserver(this.redraw);
		o.observe(this.graphDiv);

		this.infoDiv = document.createElement('div');
		this.infoDiv.id = 'sudevInfodiv';
		this.target.appendChild(this.infoDiv);
	}

	display(dataset){
		let params = [
			'PRESSION',
			'DÉBIT',
			'VOLUME',
		];
		
		this.graphs = [];
		this.graphDiv.innerHTML = null;

		for(let p of params){
			this.makeGraph(dataset, p);
		}

		this.makeTable(dataset);
		this.redraw();
	}

	makeGraph(dataset, param){
		let data = dataset.data;

		d3.select(this.graphDiv)
			.append('svg')
			.attr('id', 'gr'+param);

		let fx = d => (d.Durée.getTime() - dataset.date.getTime())/1000;
		let fy = d => d[param];

		this.graphs.push(
			new graph('#gr' + param)
			.setscale(data, fx, fy)
			.tracer(data, fx, fy)
			.setidx("Temps (s)")
			.setidy(param[0] + param.slice(1).toLowerCase())
		);
	}

	makeTable(dataset){
		this.infoDiv.innerHTML = null;
		// Main table
		var caption = document.createElement("caption");
		caption.textContent = "Paramètres";

		var t = table(dataset.params);

		t.prepend(caption);
		this.infoDiv.appendChild(t);
		//Second table

		var details = document.createElement('details');
		var t2 = table(dataset.unparsedLines);
		details.appendChild(t2);
		this.infoDiv.appendChild(details);

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
