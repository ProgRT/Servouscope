export function parseASL(string) {
	let lines = string.split("\n").filter(l => l != "");
	let dataLines = lines.slice(4);
	let paramLine = lines[2];
	let monitored =	parseMonitored(paramLine);

	const parseData = line=>{
		let array = line.trim().split('\t');
		let obj = {};
		array.forEach( (field, fieldNum)=>{
			obj[monitored[fieldNum].id] = parseFloat(field);
		});
		return obj;
	};

	return {
		data: dataLines.map(parseData),
		monitored: monitored,
		model: 'ASL 5000'
	};
}

function parseMonitored(line){
	let array = line.trim().split('\t');
	return array.map(parseParams);
}

function parseParams(str){
		let description = str.match(/\w+(?:\s\w+)*/)[0];
		return {
			id: description.replaceAll(' ',''),
			description: description,
			unit: str.match(/\((.*)\)/)[1],
			label: str
		};
}
