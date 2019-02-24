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

					// Other things
				default :
					dataSet.unparsedLines.push(param);
					break;
			}

			line = lines.shift();
		}

		while(line = lines.shift()){
			dataSet.data.push(line.split("\t"));
		}
	}

	return dataSet;
}

function dataSetBlock(dataset){

	var block = document.createElement("div");
	block.className = "dataSetBlock";

	var pd = document.createElement("p"); var d = dataset.date;
	var datestring = d.toISOString().split("T")[0];
	pd.textContent = datestring;


	var pm = document.createElement("p"); var d = dataset.date;
	pm.textContent = dataset.mode;

	block.appendChild(pd);
	block.appendChild(pm);

	return block;
}

export {parse, dataSetBlock};
