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
        this.filesSelector.accept = '.txt, .rwa';
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
		this.datasets = [];
		let nfiles = e.target.files.length;	

		for(let file of e.target.files){
			let reader = new FileReader();
			reader.onload = e=>{
				let ds = parseDataset(e.target.result);
                ds.fichier = file.name;
				if(!ds.date){ds.date = new Date(file.lastModified);}
				this.datasets.push(ds);

				this.display.display(ds);

                if(this.multiple && nfiles > 1){
                    this.makeHorizontalTL();
                }
			};

			reader.readAsText(file);
		}
		if(e.target.files.length == 0){this.target.classList.add("landing")}
		else{this.target.classList.remove("landing")}
	}

    makeFilesTimeLine () {
        let container = document.createElement('ul');
        container.className = 'timeline';

        let groups = Object.groupBy(this.datasets, f=>new Intl.DateTimeFormat().format(f.date))
        for (let date in groups){
            let label = document.createElement('li');
            label.textContent = date;
            container.append(label);
            let sublist = document.createElement('ul');
            for (let file of groups[date]) {
                let label = document.createElement('li');
                let hour = new Intl.DateTimeFormat(navigator.language, {hour: 'numeric', minute: 'numeric'}).format(file.date);
                label.textContent = hour;
                label.onclick = ()=>{
                    this.display.display(file);
                }
                sublist.append(label);
            }
            container.append(sublist);
        }
        return container;
    }

    makeBtnList () {
		this.filesList.innerHTML = null;

		for(let ds of this.datasets){
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
    }

    makeHorizontalTL () {
		this.filesList.innerHTML = null;

        let groups = Object.groupBy(this.datasets, f=>new Intl.DateTimeFormat().format(f.date))
        let dates = Object.keys(groups);
        dates.sort();
        for (let date of dates){
            let grpBlock = document.createElement('div');
            grpBlock.className = 'grpBlock';
            let grpLabel = document.createElement('div');
            grpLabel.className = 'grpLabel';
            grpLabel.textContent = date;
            grpBlock.append(grpLabel);

            let grpContent = document.createElement('div');
            grpContent.className = 'grpContent';
            grpBlock.append(grpContent);

            groups[date].sort((a,b)=>a.date-b.date);
            for(let ds of groups[date]){
                let btn = document.createElement('button');
                let hour = new Intl.DateTimeFormat(navigator.language, {hour: 'numeric', minute: 'numeric'}).format(ds.date);
                btn.textContent = hour;
                btn.addEventListener('click', (e)=>{
                    for (var but of this.filesList.querySelectorAll('button')){
                        but.disabled = false;
                    }
                    e.target.disabled = true;
                    this.display.display(ds);
                });
                grpContent.append(btn);
            }
            this.filesList.appendChild(grpBlock);
        }
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
