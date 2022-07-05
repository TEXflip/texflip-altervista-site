
let pokemonsTable, pokemon = [], selectedPokemon = 1, tassoCattura = 45,
	selStyle = "background-color: #e0e0e0;", ps, pokeinput, pokeball = 1.0, pokeballInput, stati, psAtt,
	pokeballSelect = [1, 1.5, 2, 255, 1.5, 2, 3, 4, 1, 8, 40, 4, 1.5, 3, 4, 3, 1, 1, 1, 3.5, 3.5, 5, 1, 1, 255, 255, 5],
	pokeballTable, pr,tn,statsClass,pesoball,currIndexPokeball = 1;
	r1 = 9, r2 = 12;

function setup() {
	noCanvas();
	pesoball = document.getElementById("pesoball");
	statsClass = document.getElementsByClassName("stats");
	psAtt = document.getElementById("range");
	ps = document.getElementById("ps");
	pr = document.getElementById("pr");
	tn = document.getElementById("tn");
	stati = document.getElementById("stati");
	pokeinput = document.getElementById("pokemonInput");
	table = document.getElementById("pokemonList");
	pokemonsTable = table.rows;
	pokeballInput = document.getElementById("pokeballInput");
	pokeballTable = document.getElementById("pokeballList").rows;
	pokemonsTable[selectedPokemon].style = selStyle;
	pokeballTable[1].style = selStyle;
	tassoCattura = parseInt(pokemonsTable[selectedPokemon].cells[3].innerHTML.replace(' ', ''));

	
	for (let i = 1; i < pokeballTable.length; i++) {
		pokeballTable[i].onmousedown = function () {
			pokeballTable[currIndexPokeball].style = "";
			currIndexPokeball = i;
			pokeballTable[i].style = selStyle;
			pokeballInput.value = pokeballSelect[i - 1];
			pokeball = pokeballSelect[i - 1];
			if(i == 11)
				pesoball.checked  = true;
			else
				pesoball.checked  = false;
		};
	}
	for (let i = 1; i < pokemonsTable.length; i++) {
		pokemon[i] = [parseInt(pokemonsTable[i].cells[0].innerHTML.slice(r1, r2)),
		pokemonsTable[i].cells[2].innerHTML.replace(' ', ''),
		parseInt(pokemonsTable[i].cells[3].innerHTML.replace(' ', ''))];
		pokemonsTable[i].onmousedown = function () {
			switchSelect(i);
			selectedPokemon = i;
			tassoCattura = pokemon[i][2];
			pokeinput.innerHTML = pokemon[i][1];
		};
	}
	setInterval(function(){
		Probability();
		window.requestAnimationFrame(update);
	}, 15);
}

function switchSelect(index) {
	let flagA = false, flagB = false;
	for (let i = 1; i < pokemonsTable.length && (!flagA || !flagB); i++) {
		let curr = parseInt(pokemonsTable[i].cells[0].innerHTML.slice(r1, r2));
		if (selectedPokemon == curr) {
			pokemonsTable[i].style = "";
			flagA = true;
		}
		if (index == curr) {
			pokemonsTable[i].style = selStyle;
			flagB = true;
		}
	}
}

function showVal(value) {
	ps.innerHTML = value + "%";
}

function pokeballChaged(value) {
	pokeball = parseFloat(value);
}

function Probability() {
	let a, b, p, PsMax = 100.0, probMax = 0.97;
	psCurr = parseFloat(psAtt.value);
	if(!pesoball.checked)
		a = ((3 * PsMax - 2 * psCurr) * tassoCattura * pokeball) / (3 * PsMax) * parseFloat(stati.value);
	else
		a = (((3 * PsMax - 2 * psCurr) * tassoCattura) / (3 * PsMax) * parseFloat(stati.value))+pokeball;
	b = 1048560 / Math.sqrt(Math.sqrt(16711680 / a));
	p = a >= 255 ? 1 : Math.pow((b + 1) / 65536, 4);
	pr.innerHTML = Math.round(p * 1000)/10 + "%";
	r = parseInt((Math.log(1-probMax)/Math.log(1-p)))+1;
	tn.innerHTML = r;
	console.log(pokemon[selectedPokemon][2]);
}

function update(){
	for(let i = 0; i < statsClass.length; i++){
		statsClass[i].style = "top: "+window.scrollY+";";
	}
}