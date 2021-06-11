export function parseSu(string){
	var params, data, unparsed, monitored;
	let [paramString, dataString] = string.split('[DATA]');

	[params, unparsed] = parseSuParams(paramString);
	[data, monitored] = parseSuData(dataString);

	//const datestr =  this.unparsedLines.find(d=>d[0] == "Date de l'enregistrement")[1];
	//this.date =  parseDate(datestr);


	//this.data = this.data.map(d=>{
	//	let t = d.Durée.split(':');
	//	d.Durée = new Date(
	//		this.date.getFullYear(),
	//		this.date.getMonth(),
	//		this.date.getDate(),
	//		...d.Durée.split(':')
	//	);
	//	return d;
	//});
	return {
		data: data,
		monitored: monitored,
		params: params,
		unparsed: unparsed,
		appareil: 'Servo U',
		mode: unparsed.find(d=>d[0] == 'Mode de ventilation')[1]
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

	let lines = string.split("\n");
	for(let line of lines){
		let param = line.split('\t')
		if(param[0] === '[DATA]'){break}
		if(param.length == 3){params.push(param)}
		else if(! toDiscard.includes(param[0])){unparsed.push(param)}
	}
	return [params, unparsed];
}

function parseSuData(string) {
	var lines = string.split("\n").filter(l => l != "");

	let monitoredParams = parseSuMonitored(lines.shift());

	let data = lines.map(line=>{
		let fields = line.split('\t').map(replaceComa);
		fields[0] = parseSuTime(fields[0]);
		//fields = fields.map(field=>parseFloat(field)||field);
		let obj = {};

		fields.forEach((field, fieldNum)=>{
			let label = monitoredParams[fieldNum].id;
			obj[label] = parseFloat(field) || field;
		});

		return obj;
	});

	let startTime = data[0].Time;
	data = data.map(d=>{
		d.Time -= startTime;
		d.Time = parseFloat(d.Time);
		return d;
	});
	return [data, monitoredParams];
}

export function parseSuTime(string){
	var h, m, s, ms;
	[h, m, s, ms] = string.split(':').map(parseFloat);

	return h*360 + m*60 + s + ms/1000; 
}

let unitRE = /\((.*)\)/;
let descRE = /^([^\(]+)(?:\(.*\))?/;

function parseSuMonitored(string){
	let array = string.split('\t');
	array[0] = 'Time';
	return array.map(s=>{
		let unitMatch = s.match(unitRE);
		let descMatch = s.match(descRE);

		return {
			id: descMatch[1].replaceAll(' ', ''),
			description: descMatch[1],
			unit: unitMatch ? unitMatch[1] : null,
			label: s,
		}
	});
}

const replaceComa = d=>d.replace(',', '.');
