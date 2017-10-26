//javascript for betcoin/index.html by cturner314

//vars	
var menu=document.getElementById("menu");
var arrow=document.getElementById("arrow");
var dice=document.getElementById("diceGameArea");
var auto=document.getElementById("autoBetArea");
var analyse=document.getElementById("analyseArea");
var expandMenu=1;

// bet option variables
var
capitalOption = 0.00000000,
bet = 0.00000000,
profit = 0.00000000,
roll = 50.49,
rollover = true,
payout = 2.0000,
chance = 49.5,
speed = 1,
winChange = false,
winIncrease = 0,
lossChange = false,
lossIncrease = 0;

//variables for auto roll display
var 
rollInterval,
firstRoll = 1,
last5Rolls = ["N/A", "N/A", "N/A", "N/A", "N/A"],
last5Success = [4,4,4,4,4],
rolling =  false,
totalRolls = 0,
currentBet = 0.00000000,
wins = 0,
losses = 0,
winStreak = 0,
winStreakHigh = 0,
lossStreak = 0,
lossStreakHigh = 0,
lucky,
wagered = 0.00000000,
capital = 0.00000000;

//set up anything that needs to be done at a) all times or; b) once at load of page
function Start(){
	var speedInput = document.getElementById('betSpeed');
	speedInput.addEventListener("mousemove", function () {
	    document.getElementById('bps').innerHTML = this.value;
	    speed = document.getElementById('betSpeed').value; 
	});	
}


// expand the menu
function Menu(){
	if(expandMenu == 1){
		menu.style.left = 450;
		menu.style.opacity = 1;
		menu.style.pointerEvents = 'auto';
		arrow.innerHTML = "&#8249;"
		expandMenu = 0;
	}else{
		menu.style.left = 55;
		menu.style.opacity = 0;
		menu.style.pointerEvents = 'none';
		expandMenu = 1;
		arrow.innerHTML = "&#8250";
	}
}

function SwitchGame(n){
	dice.style.opacity=0;
	dice.style.pointerEvents = "none";
	auto.style.pointerEvents = "none";
	auto.style.opacity = 0;
	analyse.style.opacity=0;
	analyse.style.pointerEvents = "none";
	switch(n){
		case 1:
			dice.style.opacity=1;
			dice.style.pointerEvents = "auto";
			break;
		case 2:
			auto.style.pointerEvents = "auto";
			auto.style.opacity = 1;
			break;
		case 3:
			analyse.style.opacity=1;
			analyse.style.pointerEvents = "auto";
			break;
	}
}

function InputBlur(i){
	switch(i){
		case "capital":
			var capitalInput = document.getElementById("editable-capital");
			if(!isNaN(Number(capitalInput.value))){
				capitalOption = Number(capitalInput.value);
				capitalInput.value = capitalOption.toFixed(8);
			}else{
				alert("Please enter a numerical value for CAPITAL");
			}
			break;
		case "bet":
			var betInput = document.getElementById("editable-bmt");
			if(!isNaN(Number(betInput.value))){
				bet = Number(betInput.value);
				betInput.value = bet.toFixed(8);
			}else{
				alert("Please enter a numerical value for BET AMOUNT");
			}
			profit = payout * bet - bet;
			document.getElementById("profitOption").innerHTML = profit.toFixed(8);
			break;
		case "payout":
			var payoutInput = document.getElementById("payout");
			if(!isNaN(Number(payoutInput.value))){
				payout = Number(payoutInput.value);
				payoutInput.value = payout.toFixed(4) + "x";
				InputBlur("bet")
				chance = ((100/payout)/100*99).toFixed(2);
				document.getElementById("chance").value = chance + "%";
				if(rollover){
					roll = (99.99-chance).toFixed(2);
					document.getElementById("roll").innerHTML = ">" + roll;
				}else{
					roll = (chance).toFixed(2);
					document.getElementById("roll").innerHTML = "<" + roll;
				}
			}else{
				alert("Please enter a numerical value for PAYOUT");
				payoutInput.value = "";
			}
			break;
		case "chance":
			var chanceInput = document.getElementById("chance");
			if(!isNaN(Number(chanceInput.value))){
				chance = Number(chanceInput.value);
				chanceInput.value = chance.toFixed(2) + "%";
				InputBlur("bet");
				payout = 99/chance;
				document.getElementById("payout").value = payout.toFixed(4);
				InputBlur("payout")
			}else{
				alert("Please enter a numerica value for CHANCE")
			}
	}
}
// when user selects to change their bet using a button
function ChangeBet(v){
	switch(v){
		case 1:
			bet = bet*2;
			break;
		case 2:
			bet = bet/2;
			break;
		case 3:
			bet = capitalOption;
			break;
	}
	document.getElementById("editable-bmt").value = bet.toFixed(8);
	InputBlur("bet");
}


// when user clicks the roll over/under
function RollChange(){
	if(rollover){
		rollover=false; 
		roll = (99.99-roll).toFixed(2);
		document.getElementById('roll').innerHTML = '<' + roll
		document.getElementById('rollLbl').innerHTML = "ROLL UNDER"
	}else{
		rollover=true; 
		roll = (99.99-roll).toFixed(2); 
		document.getElementById('roll').innerHTML = '>' + roll
		document.getElementById('rollLbl').innerHTML = "ROLL OVER"
	}
}

function ChangeSpeed(){
	if(rolling){
		clearInterval(rollInterval);
		rollInterval = setInterval(function(){ Roll() }, 1000/speed)
	}
}

function InitRoll(){
	if(rolling == true){
		clearInterval(rollInterval);
		rolling = false;
		capitalOption = capital;
		UpdateStats();
		ClearStats();
		document.getElementById("rollBtn").innerHTML = "ROLL";
		document.getElementById("betOptions").style.pointerEvents = "auto"
	}else{
		document.getElementById("betOptions").style.pointerEvents = "none"
		document.getElementById("divBetSpeed").style.pointerEvents = "auto";
		rolling = true;
		firstRoll = true;
		currentBet = bet;
		capital = capitalOption;
		document.getElementById("capital").innerHTML = capital.toFixed(8);
		if(document.getElementById("return-on-win").checked){
			winChange = false;
		}else{
			winChange = true;
			winIncrease = document.getElementById("winIncrease").value;
		}
		if(document.getElementById("return-on-loss").checked){
			lossChange = false;
		}else{
			lossChange = true;
			lossIncrease = document.getElementById("lossIncrease").value;
		}

		rollInterval = setInterval(function(){ Roll() }, 1000/speed)

		document.getElementById("rollBtn").innerHTML = "STOP AUTO ROLL";
	}
}

// function to be run every roll
function Roll(){
	if(capital-currentBet<0){
		alert("Auto roll stopped after " + totalRolls + " bets due to insufficient capital");
		InitRoll();
		return("stopped");
	}

	var rollNum = Math.floor(Math.random() * 10000) / (100);
	totalRolls++;

	if(rollover && (rollNum > roll)){
		DisplayRolls(rollNum, 1)
		wins++;
		winStreak++;
		lossStreak = 0;
		if(winStreak>winStreakHigh){
			winStreakHigh = winStreak;
		}
		profit+=currentBet*payout-currentBet;
		capital+=currentBet*payout-currentBet;
		if(winChange && !firstRoll){
			currentBet = currentBet + currentBet*(winIncrease/100);
			currentBet = Math.round(currentBet*100000000)/100000000;
		}else{
			currentBet = bet;
		}
	}else if(!rollover && (rollNum < roll)){
		DisplayRolls(rollNum, 1);
		wins++;
		winStreak++;
		lossStreak=0;
		if(winStreak>winStreakHigh){
			winStreakHigh = winStreak;
		}
		profit+=currentBet*payout-currentBet;
		capital+=currentBet*payout-currentBet;
		if(winChange && !firstRoll){
			currentBet = currentBet + currentBet*(winIncrease/100);
			currentBet = (Math.round(currentBet*100000000)/100000000);
		}else{
			currentBet = bet;
		}
	}else{
		DisplayRolls(rollNum, 0);
		losses++;
		lossStreak++;
		winStreak =0;
		if(lossStreak>lossStreakHigh){
			lossStreakHigh = lossStreak;
		}
		profit -= currentBet;
		capital -= currentBet;
		if(lossChange && !firstRoll){
			currentBet = currentBet + currentBet*(lossIncrease/100);
			currentBet = Math.round(currentBet*100000000)/100000000;
		}else{
			currentBet = bet;
		}
	}
	lucky = ((((wins/totalRolls)*100)/chance)*100).toFixed(2);
	wagered+=currentBet;
	UpdateStats()
	firstRoll = false;
}

// display last 5 rolls, takes rollnum and success
function DisplayRolls(r,s){
		// Storing and displaying 5 most recent rolls

	if ( last5Rolls.length >= 5 )
	{
	   last5Rolls.shift();
	   last5Success.shift();
	}       
	last5Rolls.push(r); 
	last5Success.push(s);

	document.getElementById("roll5").innerHTML = last5Rolls[last5Rolls.length-1];
	ColorRolls("roll5", 1);
	document.getElementById("roll4").innerHTML = last5Rolls[last5Rolls.length-2];
	ColorRolls("roll4", 2);
	document.getElementById("roll3").innerHTML = last5Rolls[last5Rolls.length-3];
	ColorRolls("roll3", 3);
	document.getElementById("roll2").innerHTML = last5Rolls[last5Rolls.length-4];
	ColorRolls("roll2", 4);
	document.getElementById("roll1").innerHTML = last5Rolls[last5Rolls.length-5];
	ColorRolls("roll1", 5);
}

function ColorRolls(n, s){
	switch(last5Success[last5Success.length-s]){
		case 1:
			document.getElementById(n).style.borderColor = "green";
			break;
		case 0:
			document.getElementById(n).style.borderColor = "red";
			break;
		default:
			document.getElementById(n).style.borderColor = "blue";
			break;
	}
}

function UpdateStats(){
	document.getElementById("betsWon").innerHTML = wins;
	document.getElementById("betsLost").innerHTML = losses;
	document.getElementById("winStreak").innerHTML = winStreakHigh;
	document.getElementById("lossStreak").innerHTML = lossStreakHigh;
	document.getElementById("lucky").innerHTML = lucky;
	document.getElementById("wagered").innerHTML = wagered.toFixed(8);
	document.getElementById("currentBet").innerHTML = currentBet.toFixed(8);
	document.getElementById("profit").innerHTML = profit.toFixed(8);
	document.getElementById("capital").innerHTML = capital.toFixed(8);
	document.getElementById("editable-capital").value = capitalOption.toFixed(8);
}

function ClearStats(){
	last5Rolls = ["N/A", "N/A", "N/A", "N/A", "N/A"];
	last5Success = [4,4,4,4,4];
	rolling =  false;
	totalRolls = 0;
	wins = 0;
	losses = 0;
	winStreak = 0;
	winStreakHigh = 0;
	lossStreak = 0;
	lossStreakHigh = 0;
	lucky = 0;
	wagered = 0.00000000,
	profit = 0;
}