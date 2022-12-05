import {display} from './display.js';
import {parseDataset} from './dataset.js';

let defaults = {
	dParams: {
	}
};

export class sudev {
	constructor(target, param){

		if(param){
			for(var i in param){
				this[i] = param [i];
			}
		}

		for(var i in defaults){
			if(!this[i]){this[i] = defaults[i]}
		}

		this.target = document.querySelector(target);
		this.target.classList.add('landing');

		this.header = document.createElement('div');
		this.header.id = 'sudevHeader';
		this.target.appendChild(this.header);

		this.filesSelector = document.createElement('input');
		this.filesSelector.type = 'file';
		this.filesSelector.id = 'suvedFilesSelect';

		if(this.multiple){
			this.filesSelector.multiple = true;
		}

		this.filesSelector.addEventListener("change", this.fileInputHandler);
		this.header.appendChild(this.filesSelector);

		let logoTemplate = document.querySelector('template#logo');
		let templateClone = logoTemplate.content.firstElementChild.cloneNode(true);
		this.header.appendChild(templateClone);
		
		this.display = new display(target, this.dParams); 

		this.filesList = document.createElement('div');
		this.filesList.id = 'sudevFilesList';
		this.target.appendChild(this.filesList);

		this.datasets = [];
	}

	fileInputHandler = e=>{ 
		this.filesList.innerHTML = null;
		var nfiles = e.target.files.length;	
		for(var file of e.target.files){
			let reader = new FileReader();
			reader.onload = e=>{
				var ds = parseDataset(e.target.result);
				if(!ds.date){ds.date = new Date(file.lastModified);}
				this.datasets.push(ds);
				this.display.display(ds);

				if(this.multiple && nfiles > 1){
					var dsb = dataSetBlock(ds);
					dsb.addEventListener('click', (e)=>{
						for (var but of this.filesList.querySelectorAll('button')){
							but.disabled = false;
						}
						e.target.disabled = true;
						this.display.display(ds);
					});
					this.filesList.appendChild(dsb);
				}
			};
			reader.readAsText(file);
		}
		if(e.target.files.length == 0){this.target.classList.add("landing")}
		else{this.target.classList.remove("landing")}
	}
}

function dataSetBlock(dataset){

	var block = document.createElement("button");
	block.className = "dataSetBlock";
	block.innerHTML = '';

	if(dataset.date){
		block.innerHTML += dataset.date.toISOString().split(".")[0].replace("T", " ") + '<br/>';
	}

	if(dataset.mode){
		block.innerHTML += dataset.mode;
	}
	else if (dataset.appareil){
		block.innerHTML += dataset.appareil;
	}

	return block;
}
