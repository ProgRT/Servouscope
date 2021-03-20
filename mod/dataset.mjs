const knownParams = [
	"Niv. AI sur PEP",
	"PEP",
	"Trigger en débit",
	"Fin d'insuff.",
	"Pentetps insp. (s)",
	"Ti",
	"Volume courant",
	"F resp.",
	"Trigger en pression",
	"Conc. O2",
	"Niveau NAVA",
	"Trigger Edi",
];

const numParams = [
	'PRESSION',
	'DÉBIT',
	'VOLUME',
	'Edi'
]

const toDiscard = [
	"[REC]",
	"==========",
	""
];

export class dataset {
	constructor(string) {
		let [pstr, dstr] = string.split('[DATA]');
		[this.params, this.unparsedLines] = parseParams(pstr);	
		[this.data, this.monitoredParams] = parseData(dstr);
		this.data = this.data.map(d=>{
			let t = d.Durée.split(':');
			let ndate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), t[0], t[1], t[2], t[3]);
			d.Durée = ndate;
			return d;
		});
	}

	get mode() {
		return this.unparsedLines.find(d=>d[0] == 'Mode de ventilation')[1];
	}

	get date() {
		let dstr =  this.unparsedLines.find(d=>d[0] == "Date de l'enregistrement")[1];
		return parseDate(dstr);
	}
}

function parseParams(string) {
	var params = [];
	var unparsed = [];

	var lines = string.split("\n");
	for(let line of lines){
		let param = line.split('\t')
		if(param[0] === '[DATA]'){break}
		if(param.length == 3){params.push(param)}
		else if(! toDiscard.includes(param[0])){unparsed.push(param)}
	}
	return [params, unparsed];
}

function parseData(string) {
	var lines = string.split("\n");
	lines = lines.filter(l => l != "")
	let monitoredParams = lines.shift().split('\t');
	let labels = monitoredParams.map(s=>s.split(' ')[0]);
	let data = lines.map(d=>d.split('\t'));
	data = data.map(d=>{
		return d.map(d=>d.replace(',', '.'));
	});

	// Convert array to object
	data = data.map(d=>{
		let obj = {};

		for(let i in d){
			if(numParams.includes(labels[i])){
				obj[labels[i]] = parseFloat(d[i]);
			}
			else{
				obj[labels[i]] = d[i];
			}
		}
		
		return obj;
	});

	return [data, monitoredParams];
}

function parseDate(str){
	var d, h;
	var dd, dm, dy;
	var hh, hm, hs;
	[d, h] = str.split(" ");
	[dd, dm, dy] = d.split("/");
	[hh, hm, hs] = h.split(":");

	return new Date("20" + dy, dm, dd, hh, hm, hs);
}
