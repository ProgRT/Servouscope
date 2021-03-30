import {graph} from './graphsimple.mjs'
import {drange} from './drange.mjs'

let defaults = {
	params: [
		'PRESSION',
		'DÉBIT',
		'VOLUME',
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
		this.dataset = dataset;

		let availableParams = dataset.monitoredParams.map(d=>d.split(' ')[0]);
		
		this.graphs = [];
		this.graphDiv.innerHTML = null;

		for(let p of this.params.filter(p=>availableParams.includes(p))){
			this.makeGraph(dataset, p);
		}

		if(this.zoomable){

			let data = dataset.data;
			let fx = d => (d.Durée.getTime() - dataset.date.getTime())/1000;
			let fy = d => d.DÉBIT;

			d3.select(this.graphDiv)
				.append('svg')
				.attr('id', 'grPager');

			this.pager = new graph('#grPager')
				.setscale(data, fx, fy)
				.tracer(data, fx, fy)
				.setidx("Temps (s)")
				.setidy('Débit');

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

	updateZoom = ()=>{
		let data = this.dataset.data;
		let fx = d => (d.Durée.getTime() - this.dataset.date.getTime())/1000;
		let dataStart = data[0].Durée.getTime();

		let tStart = this.range.start;
		let tEnd = this.range.end;

		let plage = this.pager.plagesx[0];
		plage.min = fx(data[tStart]);
		plage.max = fx(data[tEnd]);
		this.pager.plagexDraw(plage);

		this.subset = data.filter((d, i)=>{
			return i > tStart && i < tEnd;	
		});

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
