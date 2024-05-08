var gameState = "idle";
var waiting = true;
var playerOnMove = 1;
var spaces = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var elements = [];
var takingSquare=-1;
const takingOutline=document.getElementById("taking-outline");
var MOVE_DELAY=200;
var TAKE_DELAY=100;
var FINAL_DELAY=200;

const dialogTitle=document.getElementById("dialog-title");



const menuElement=document.getElementById("dialog-menu");

function ForceUpdateElements(){
	elements.forEach((e,i)=>{
		e.innerText=spaces[i];
	});

	menuElement.style.display = gameState=="idle"?"initial":"none";

	if(waiting){
		switch(gameState){
			case "playerMove":
				elements.forEach((el,i)=>{
					if(BelongsToPlayer(playerOnMove,i) && spaces[i]>0){
						el.disabled=false;
					}else{
						el.disabled=true;
					}
				})
			break;
			case "playerTake":
				elements.forEach((el,i)=>{
					if(BelongsToPlayer(playerOnMove,i)){
						el.disabled=false;
					}else{
						el.disabled=true;
					}
				})
			break;
			case "idle":
				elements.forEach((el,i)=>{
					el.disabled=true;
				})
				var idx1=GetBase(1);
				var idx2=GetBase(2);
				if(spaces[idx1]>spaces[idx2]) elements[idx1].disabled=false;
				if(spaces[idx1]<spaces[idx2]) elements[idx2].disabled=false;
			break;
		}
	}else{
		elements.forEach((el,i)=>{
			el.disabled=true;
		})
	}

	if(takingSquare==-1){
		takingOutline.style.display="none";
	}else{
		takingOutline.style.display="block";
		takingOutline.setAttribute("data-n",takingSquare);
	}
}

function NewGame(){
	spaces = [4,4,4,4,4,4,0,4,4,4,4,4,4,0];
	gameState = "playerMove";
	playerOnMove = 1;
	waiting = true;
	ForceUpdateElements();
}


function Opponent(playerId){
	switch(playerId){
		case 1:
			return 2;
		case 2:
			return 1;
	}
}

function Adjacent(n){
	return 12-n;
}

function GetBase(playerId){
	switch(playerId){
		case 1:
			return 6;
		case 2:
			return 13;
	}
}

function BelongsToPlayer(playerId,n){
	switch(playerId){
		case 1:
			return n>=0 && n<=5;
		case 2:
			return n>=7 && n<=12;
	}
}

function IsPlayerBase(playerId,n){
	return n==GetBase(playerId);
}

function OnClick(el,n){
	return function(){
		if(!waiting) return;
		switch(gameState){
			case "playerMove":
				if(BelongsToPlayer(playerOnMove,n)){
					MakeMove(n);
				}
				break;
			case "playerTake":
				if(n==takingSquare||n==Adjacent(takingSquare)){
					TakeOpponentPoints();
				}else{
					gameState="playerMove";
					takingSquare=-1;
					PassTurn();
				}
				break;
		}
	}
}

function PassTurn(changePlayer=true){
	if(changePlayer) playerOnMove=Opponent(playerOnMove);

	const playablePoints = spaces.reduce((a,v,i)=>{
		if(BelongsToPlayer(playerOnMove,i)) a+=v;
		return a
	},0);
	if(playablePoints==0){
		FinalScoring();
	}else{
		waiting=true;
		ForceUpdateElements();
	}
}

function MakeMove(idFrom){
	waiting=false;
	var i = idFrom;
	var pointsLeft = spaces[i];
	spaces[i]=0;
	ForceUpdateElements();

	function DoStep(){
		if(pointsLeft==0) return;

		i++;
		if(IsPlayerBase(Opponent(playerOnMove),i)) i++;
		i%=14;

		var extraMove=false;
		var takeOpponents=false;
		if(pointsLeft==1){
			if(IsPlayerBase(playerOnMove,i)){
				extraMove=true;
			}
			else if(BelongsToPlayer(playerOnMove,i) && spaces[i]==0 && spaces[Adjacent(i)]>0){
				takeOpponents=true;
			}
		}

		spaces[i]+=1;
		pointsLeft-=1;

		ForceUpdateElements();

		if(pointsLeft==0){
			if(takeOpponents){
				gameState="playerTake";
				takingSquare=i;
				waiting=true;
				ForceUpdateElements();
			}else if(extraMove){
				PassTurn(false);
			}else{
				PassTurn();
			}
		}else{
			setTimeout(DoStep,MOVE_DELAY);
		}
	}

	setTimeout(DoStep,MOVE_DELAY);
}

function TakeOpponentPoints(){
	waiting=false;
	var idx1=Adjacent(takingSquare);
	var idx2=takingSquare;
	var idx3=GetBase(playerOnMove);

	takingSquare=-1;
	ForceUpdateElements();

	function DoMove(){
		var pointsLeft=false;

		if(spaces[idx1]>0){ spaces[idx1]-=1; spaces[idx3]+=1; pointsLeft=true;}
		if(spaces[idx2]>0){ spaces[idx2]-=1; spaces[idx3]+=1; pointsLeft=true;}
		

		if(pointsLeft){
			ForceUpdateElements();
			setTimeout(DoMove,TAKE_DELAY);
		}else{
			gameState="playerMove";
			PassTurn();
		}
	}
	setTimeout(DoMove,TAKE_DELAY);
}

function FinalScoring(){
	waiting=false;
	gameState="finalScoring";
	const base1=GetBase(1);
	const base2=GetBase(2);

	function DoMove(){
		var pointsLeft=false;
		spaces.forEach((v,i)=>{
			if(v==0) return;
			if(BelongsToPlayer(1,i)){
				spaces[i]-=1; spaces[base1]+=1;
				pointsLeft=true;
			}
			if(BelongsToPlayer(2,i)){
				spaces[i]-=1; spaces[base2]+=1;
				pointsLeft=true;
			}
		})
		ForceUpdateElements();
		if(pointsLeft){
			setTimeout(DoMove,FINAL_DELAY);
		}else{
			AnnounceWinner();
		}		
	}
	setTimeout(DoMove,FINAL_DELAY);
}

function AnnounceWinner(){
	var score1 = spaces[GetBase(1)];
	var score2 = spaces[GetBase(2)];
	if(score1==score2){
		dialogTitle.innerText = "It's a draw!!!";
	}else if(score1>score2){
		dialogTitle.innerText = "Player 1 wins!!!";
	}else{
		dialogTitle.innerText = "Player 2 wins!!!";
	}
	gameState="idle";
	waiting=true;
	ForceUpdateElements();
}


// const debug=document.getElementById("debug");

// (()=>{
// 	const elGameState = document.createElement("div");
// 	debug.appendChild(elGameState);
// 	const elPlayerOnMove = document.createElement("div");
// 	debug.appendChild(elPlayerOnMove);
// 	const elWaiting = document.createElement("div");
// 	debug.appendChild(elWaiting);
// 	setInterval(()=>{
// 		elGameState.innerText=`GameState=${gameState}`;
// 		elPlayerOnMove.innerText=`PlayerOnMove=${playerOnMove}`;
// 		elWaiting.innerText=`Waiting=${waiting}`;
// 	},100)
// })();