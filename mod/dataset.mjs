export class dataset {
	constructor(string) {
		if(string.substring(0,5) == '[REC]'){this.parseSu(string)}
		else if(string.substring(0,18) == 'ASL 3.4 .rwa ASCII'){
			console.log('Looks like ASL data')
			this.parseASL(string);
		}
		else {console.log('Unkonwn data format')}
	}

	parseSu(string){
		let [pstr, dstr] = string.split('[DATA]');

		[this.params, this.unparsedLines] = parseSuParams(pstr);	
		[this.data, this.monitoredParams] = parseSuData(dstr);

		this.mode =  this.unparsedLines.find(d=>d[0] == 'Mode de ventilation')[1];
		const datestr =  this.unparsedLines.find(d=>d[0] == "Date de l'enregistrement")[1];
		this.date =  parseDate(datestr);


		this.data = this.data.map(d=>{
			let t = d.Durée.split(':');
			d.Durée = new Date(
				this.date.getFullYear(), 
				this.date.getMonth(), 
				this.date.getDate(), 
				...d.Durée.split(':')
			);
			return d;
		});
	}
	
	parseASL(string){
		[this.data, this.monitoredParams] = parseASLData(string);
	}

}

function parseSuParams(string) {
	const toDiscard = [
		"[REC]",
		"==========",
		""
	];

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

function parseSuData(string) {
	const numParams = [
		'PRESSION',
		'DÉBIT',
		'VOLUME',
		'Edi'
	]

	var lines = string.split("\n").filter(l => l != "");
	let monitoredParams = lines.shift().split('\t').map(s=>{
		return {
			id: s.match(/^[A-z0-9À-ú]+/),
			description: null,
			unit: null,
			label: null,
		}
	});
	const replaceComa = d=>d.replace(',', '.');

	let data = lines.map(line=>line.split('\t').map(replaceComa));

	// Convert array to object
	data = data.map(line=>{
		let obj = {};

		for(let fieldNum in line){

			if(numParams.includes(monitoredParams[fieldNum].id)){
				obj[monitoredParams[fieldNum].id] = parseFloat(line[fieldNum]);
			}
			else{
				obj[monitoredParams[fieldNum].id] = line[fieldNum];
			}
		}
		
		return obj;
	});

	console.log(data[0]);
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
