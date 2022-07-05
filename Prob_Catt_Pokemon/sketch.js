let pokeballSelect = [1, 1.5, 2, 255, 1.5, 2, 3, 4, 1, 8, 40, 4, 1.5, 3, 4, 3, 1, 1, 1, 3.5, 3.5, 5, 1, 1, 255, 255, 5];
let pokemonList = JSON.parse(pokemonJson)
let pokeballList = JSON.parse(pokeballJson)
let selectedPokemon = pokemonList[0]
let selectedPokeball = pokeballList[0]

function setup() {
	$("#stati").change(function () {
		Probability();
	})
	$("#stati").change(function () {
		Probability()
	})
	$("#generation").change(function () {
		Probability()
		searchPokeball($("#searchPokeball").val())
		if ($("#generation").children("option:selected").val() == "1")
			$("#multiplicator").hide()
		else
			$("#multiplicator").show()
	})
	$("#pokeballInput").keyup(function () {
		Probability()
	})
	$("#pesoball").change(function () {
		Probability()
	})
	Probability()
	searchPokeball("")
}

function sliderChange(slider) {
	let value = slider.value - 0.5
	let color = value > slider.max / 2 ? "#16fd0c" : value > slider.max / 5 ? "#fbbe05" : "#e45b62"

	$("#ps").html(slider.value + "%")

	slider.style.background = 'linear-gradient(to right, ' + color + ' 0%, ' + color + ' ' + value + '%, white ' + value + '%, white 100%)'
	Probability()
}

function Probability() {
	let a, b, p, PsMax = 100.0, probMax = 0.97;
	let status = $("#stati").children("option:selected").val();
	let range = parseInt($("#range").val())
	let pokeballMult = parseFloat($("#pokeballInput").val())
	let pesoball = $("#pesoball").is(":checked")
	let generation = $("#generation").children("option:selected").val()

	switch (generation) {
		case "1":
			p = CatchRate.Calculate_1_Generation(selectedPokemon.value, status, range / 100., selectedPokeball.name)
			break;
		case "2":
			p = CatchRate.Calculate_2_Generation(selectedPokemon.value, status, range / 100., pokeballMult, pesoball)
			break;
		case "3":
		case "4":
			p = CatchRate.Calculate_3_4_Generation(selectedPokemon.value, status, range / 100., pokeballMult, pesoball)
			break;
		case "5":
			p = CatchRate.Calculate_5_Generation(selectedPokemon.value, status, range / 100., pokeballMult, 1, pesoball)
			break;
		default:
			p = CatchRate.Calculate_6_7_Generation(selectedPokemon.value, status, range / 100., pokeballMult, 1, pesoball)
			break;
	}
	p = p > 1 ? 1 : p;
	$("#pr").html(Math.round(p * 1000) / 10 + "%");
	let r = CatchRate.InverseProbability(p);
	$("#tn").html(r);
}

function searchPokemon(e) {
	let searchResult = []
	if ("" != e && undefined != e && null != e && (e.length > 1 || parseInt(e))) {
		let input = e.toLowerCase()

		switch (input) {
			case "all":
				for (const i of pokemonList)
					searchResult.push(i)
				break;
			case "1":
				for (let i = 0; i <= 152; i++)
					searchResult.push(pokemonList[i])
				break;
			case "2":
				for (let i = 153; i <= 252; i++)
					searchResult.push(pokemonList[i])
				break;
			case "3":
				for (let i = 253; i <= 387; i++)
					searchResult.push(pokemonList[i])
				break;
			case "4":
				for (let i = 388; i <= 494; i++)
					searchResult.push(pokemonList[i])
				break;
			case "5":
				for (let i = 495; i <= 650; i++)
					searchResult.push(pokemonList[i])
				break;
			case "6":
				for (let i = 651; i <= 722; i++)
					searchResult.push(pokemonList[i])
				break;
			case "7":
				for (let i = 723; i <= 810; i++)
					searchResult.push(pokemonList[i])
				break;
			case "8":
				for (let i = 811; i <= 891; i++)
					searchResult.push(pokemonList[i])
				break;

			default:
				for (let i = 0; i < pokemonList.length; i++) {
					let pok = pokemonList[i];
					let name = pok.name.toLowerCase()
					if (name.includes(input) || pok.id == parseInt(e))
						searchResult.push(pok)
				}
				break;
		}
	}
	showPokemon(searchResult)
}

function showPokemon(pokList) {
	$("#pokemonList").html("")
	for (let i = 0; i < pokList.length; i++)
		addPokemon(pokList[i]);
}

function addPokemon(pokemon) {
	let li = $('<li></li>')
	let div = $('<div></div>', { class: "row" })
	let id = $('<a></a>', { class: 'id' }).append($('<b></b>', { html: pokemon.id }))
	let img = $('<img></img>', { src: pokemon.img })
	let name = $('<a></a>', { class: 'name', html: pokemon.name })
	let value = $('<a></a>', { class: 'value', html: pokemon.value })

	div.append(id)
	div.append(img)
	div.append(name)
	div.append(value)
	li.append(div)
	li.bind("click", function () {
		$("#pokemonInput").html(pokemon.name)
		selectedPokemon = pokemon
		Probability()
	})
	$("#pokemonList").append(li)
}

function searchPokeball(e) {
	let searchResult = []
	if (undefined != e && null != e && e.length > 0) {
		let input = e.toLowerCase()

		switch (input) {
			default:
				for (let i = 0; i < pokeballList.length; i++) {
					let pok = pokeballList[i];
					let name = pok.name.toLowerCase()
					if (name.includes(input) || pok.id == parseInt(e))
						searchResult.push(pok)
				}
				break;
		}
		showPokeball(searchResult)
	}
	else {
		for (const i of pokeballList)
			searchResult.push(i)
		showPokeball(searchResult)
	}
}

function showPokeball(pokList) {
	$("#pokeballList").html("")
	let generation = parseInt($("#generation").children("option:selected").val())
	for (let i = 0; i < pokList.length; i++)
		if (generation >= pokList[i].generation)
			addPokeball(pokList[i]);
}

function addPokeball(ball) {
	let li = $('<li></li>')
	let div = $('<div></div>', { class: "rowBall" })
	let img = $('<img></img>', { src: ball.img })
	let name = $('<a></a>', { class: 'name', html: ball.name })
	let value = $('<a></a>', { class: 'value', html: ball.value })

	div.append(img)
	div.append(name)
	if ("1" != $("#generation").children("option:selected").val())
		div.append(value)
	li.append(div)
	li.on("click", function () {
		selectedPokeball = ball
		$("#pokeballInput").val(pokeballValue[ball.name])
		$("#pesoball")[0].checked = ball.name == "Peso Ball";
		Probability()
	})
	$("#pokeballList").append(li)
	$("#pokeballList").on("click", "li", function () {
		$("li").css("backgroundColor", "");
		$(this).css("backgroundColor", "D0E6FF");
	})
}