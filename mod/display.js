import {graph} from '../graphsimple.js/graphsimple.js'
//import {graph} from 'https://progrt.github.io/graphsimple.js/graphsimple.js'
import {drange} from './drange.js'

let defaults = {
	params: [
		'AirwayPressure',
		'TotalVolume',
		'PRESSION',
        'Pva',
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

        /*
		this.infoDiv = document.createElement('div');
		this.infoDiv.id = 'sudevInfodiv';
		this.target.appendChild(this.infoDiv);
        */
	}

	display(dataset){
		this.dataset = dataset;
		this.fx = d=>d.Time;

		this.plotable = dataset.monitored.filter(d=>this.params.includes(d.id));
		
		this.graphs = [];
		this.graphDiv.innerHTML = null;

		for(let p of this.plotable) this.makeGraph(dataset, p);

		if(this.zoomable){this.createPager()}

        for (let g of this.graphs)  g.redessiner();
	}

	createPager(){
		let data = this.dataset.data;
		let fy = d => d[this.plotable[0].id];

		d3.select(this.graphDiv)
			.append('svg')
			.attr('id', 'grPager');

		this.pager = new graph('#grPager', {nticksX: 0, nticksY: 0, margeB: 10})
			.setscale(data, this.fx, fy)
			.tracer(data, this.fx, fy)
			//.setidx("Temps (s)")
			//.setidy(this.plotable[0].label)
		;

		this.pager.plagex(
			0,
			Math.max(...data.map(this.fx)),
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

	redraw = ()=>{
		for(var gr of this.graphs){
			gr.redessiner();
		}
	}
}

export class pDisplay {

    constructor(target, param){
		this.target = document.querySelector(target);
		this.infoDiv = document.createElement('div');
		this.infoDiv.id = 'sudevInfodiv';
		this.target.appendChild(this.infoDiv);
    }

    display(ds){
        this.makeTable2(ds);
    }

	makeTable2(dataset){
        console.log(dataset.date);
		this.infoDiv.innerHTML = null;

        // Info table

        let dfmt = new Intl.DateTimeFormat('fr-ca', {dateStyle: 'short'});
        let tfmt = new Intl.DateTimeFormat('fr-ca', {timeStyle: 'medium'});
        let info = [
            ['Fichier', dataset.fichier],
            ['Date', dfmt.format(dataset.date)],
            ['Heure', tfmt.format(dataset.date)],
            ['Appareil', dataset.model],
        ];
        if(dataset.serial) info.push(['Numérot', dataset.serial]);
        if(dataset.mode) info.push(['Mode', dataset.mode]);
        var details = document.createElement('details');
        let summary = document.createElement("summary");
        details.append(summary);
        details.open=true;
        summary.textContent = "Fichier";

        var t2 = table(info);
        details.appendChild(t2);
        this.infoDiv.appendChild(details);

		// Main table

		if(dataset.params){
			let details = document.createElement("details");
			let summary = document.createElement("summary");
            details.append(summary);
			summary.textContent = "Paramètres";

			details.append(table(dataset.params));
            details.open=true;

			this.infoDiv.appendChild(details);
		}

		//Second table

		if(dataset.unparsed){
			var details = document.createElement('details');
			let summary = document.createElement("summary");
            details.append(summary);
			summary.textContent = "Détails";
			var t2 = table(dataset.unparsed);
			details.appendChild(t2);
			this.infoDiv.appendChild(details);
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
