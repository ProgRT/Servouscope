function parse(string){

	var dataSet = {
		unparsedLines: [],
		params: [],
		data: [],
		scrap: []
	};

	var lines = string.split("\n");

	var line = lines.shift();

	if(line != "[REC]"){
		throw "function parse: should check input file";
	}

	else{
		line = lines.shift();
		while(line != '[DATA]'){
			var param = line.split("\t");

			var t = param[0];
			switch (t){
					// Things to put to garbage
				case "==========":
					dataSet.scrap.push(param);
					break;

				case "":
					dataSet.scrap.push(param);
					break;

					// Named parameters

				case "Mode de ventilation":
					dataSet.mode = param[1];
					break;

				case "Date de l'enregistrement":
					var d, h;
					var dd, dm, dy;
					var hh, hm, hs;
					[d, h] = param[1].split(" ");
					[dd, dm, dy] = d.split("/");
					[hh, hm, hs] = h.split(":");

					dataSet.date = new Date("20" + dy, dm, dd, hh, hm, hs);
					break;

					// Other parameters
					
				case "Niv. AI sur PEP":
					dataSet.params.push(param);
					break;

				case "PEP":
					dataSet.params.push(param);
					break;

				case "Trigger en débit":
					dataSet.params.push(param);
					break;

				case "Fin d'insuff.":
					dataSet.params.push(param);
					break;

				case "Pentetps insp. (s)":
					dataSet.params.push(param);
					break;

				case "Ti":
					dataSet.params.push(param);
					break;

				case "Volume courant":
					dataSet.params.push(param);
					break;

				case "F resp.":
					dataSet.params.push(param);
					break;

				case "Trigger en pression":
					dataSet.params.push(param);
					break;

				case "Conc. O2":
					dataSet.params.push(param);
					break;

				case "Niveau NAVA":
					dataSet.params.push(param);
					break;

				case "Trigger Edi":
					dataSet.params.push(param);
					break;

					// Other things

				default :
					dataSet.unparsedLines.push(param);
					break;
			}

			line = lines.shift();
		}

		console.table(dataSet.unparsedLines);

		dataSet.monitoredParams= lines.shift().split("\t");
		if(dataSet.monitoredParams[5] == "Edi (uV)"){
			dataSet.hasEadi = true;
		}
		var trigPos = dataSet.monitoredParams.length - 1;

		while(line = lines.shift()){
			let d = line.split("\t");
			let t = d[0].split(":");
			var dataPoint = {
				time: new Date(dataSet.date.getFullYear(), dataSet.date.getMonth(), dataSet.date.getDate(), t[0], t[1], t[2], t[3]),
				phase: d[1],
				pressure: parseFloat(d[2].replace(",", ".")),
				flow: parseFloat(d[3].replace(",", ".")),
				volume: parseFloat(d[4].replace(",", ".")),
			}
			if(dataSet.hasEadi){dataPoint.eadi = parseFloat(d[5].replace(",", "."))}
			if(d[trigPos]){dataPoint.trigger = d[trigPos]}
			dataSet.data.push(dataPoint);
		}
	}

	return dataSet;
}

function dataSetBlock(dataset){

	var block = document.createElement("a");
	block.className = "dataSetBlock";

	var pd = document.createElement("p"); var d = dataset.date;
	var datestring = d.toISOString().split(".")[0].replace("T", " ");
	pd.textContent = datestring;


	var pm = document.createElement("p"); var d = dataset.date;
	pm.textContent = dataset.mode;

	block.appendChild(pd);
	block.appendChild(pm);

	return block;
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

export {parse, dataSetBlock, table};
