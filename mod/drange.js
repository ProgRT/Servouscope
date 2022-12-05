export class drange {
	constructor(param) {
		for(var i in param){
			this[i] = param[i];
		}
		//this.target = param.target;
		this.container = document.createElement('div');
		this.container.classList.add('drange');
		this.container.style.display = 'flex';
		this.container.style.flexDirection = 'column';
		this.container.style.marginLeft = param.marginLeft;
		this.container.style.marginRight = param.marginRight;
		this.target.appendChild(this.container);

		//this.min = param.min;
		//this.max = param.max

		this.inputStart = document.createElement('input');
		this.inputStart.type = 'range';
		this.inputStart.min = this.min;
		this.inputStart.max = this.max;
		this.inputStart.value = this.min;
		this.inputStart.addEventListener('input', e=>{
			let fractStart = 100 * this.start/this.max;
			this.inputEnd.min = this.start;
			this.inputEnd.style.marginLeft = fractStart + '%';
		});
		if(this.inputHandler){this.inputStart.addEventListener('input', this.inputHandler)}
		this.container.appendChild(this.inputStart);

		this.inputEnd = document.createElement('input');
		this.inputEnd.type = 'range';
		this.inputEnd.min = this.min;
		this.inputEnd.max = this.max;
		this.inputEnd.value = this.max;
		this.inputEnd.addEventListener('input', e=>{
			let fractEnd = 100 * (this.max - this.end)/this.max;
			this.inputStart.max = this.end;
			this.inputStart.style.marginRight = fractEnd + '%';
		});
		if(this.inputHandler){this.inputEnd.addEventListener('input', this.inputHandler)}
		this.container.appendChild(this.inputEnd);
	}

	startChangeHandler = (evt)=>{
	}

	endChangeHandler = (evt)=>{
	}

	get start() {return parseFloat(this.inputStart.value)}
	get end()  {return parseFloat(this.inputEnd.value)}
}
