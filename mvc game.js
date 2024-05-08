class Mancala{
	squares=[0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	playerOnMove=0;
	moveQueue=[];
	currentMove=null;
	constructor(){
		this.squares=[0,4,4,4,4,4,4,0,4,4,4,4,4,4];
		this.playerOnMove=0;
	}

	eventListeners={};
	addEventListener(type,listener){
		const f = this.eventListeners[type];
		if(f){
			f.push(listener);
		}else{
			this.eventListeners[type] = [listener];
		}
	}
	emitEvent(type,...args){
		const f = this.eventListeners[type];
		if(f){
			f.forEach(listener => {
				listener(...args);
			});
		}
	}

	update(){

	}
}

class MancalaVM{
	
}