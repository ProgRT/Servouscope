import {display, pDisplay} from './display.js';
//import {display as aDisplay} from '../simvent.js/src/animatedDisplay.js';
//import {display as aDisplay} from 'https://progrt.github.io/simvent.js/src/animatedDisplay.js'
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
		
        if (this.displayStyle == 'aDisplay'){
            let params = {
                toolbar: this.header,
                availableNumParams: [],
                activeNumParams: ['Vt'],
                datasets: ['PRESSION', 'DÉBIT'],
                units: null
            };
            this.display = new aDisplay(params); 
            console.log(this.display.units);

        }

        else { this.display = new display(target, this.dParams); }

		this.pDisplay = new pDisplay(target, this.dParams); 

        this.display.cursTblTarget = this.pDisplay.infoDiv;
        this.display.infoDiv = this.pDisplay.infoDiv;


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


                if(this.multiple && nfiles > 1){
                    this.makeHorizontalTL();

                    let btnid = 'btn' + ds.fichier;
                    let dsbtn = document.getElementById(btnid);
                    dsbtn.disabled = true;

                }

				this.display.display(ds);
				this.pDisplay.display(ds);
			};

			reader.readAsText(file);
		}
		if(e.target.files.length == 0){this.target.classList.add("landing")}
		else{this.target.classList.remove("landing")}
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
                btn.id = 'btn' + ds.fichier;
                btn.addEventListener('click', (e)=>{
                    for (var but of this.filesList.querySelectorAll('button')){
                        but.disabled = false;
                    }
                    e.target.disabled = true;
                    this.display.display(ds);
                    this.pDisplay.display(ds);
                });
                grpContent.append(btn);
            }
            this.filesList.appendChild(grpBlock);
        }
    }
}
