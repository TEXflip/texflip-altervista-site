const Status = {
	None: 'none',
	Burn: 'burn',
	Freeze: 'freeze',
	Paralysis: 'paralysis',
	Poison: 'poison',
	Sleep: 'sleep'
}

const pokeballValue = {
	"Poké Ball": 1,
	"Mega Ball": 1.5,
	"Ultra Ball": 2,
	"Master Ball": 255,
	"Safari Ball": 1.5,
	"Level Ball": 8,
	"Esca Ball": 3,
	"Luna Ball": 4,
	"Friend Ball": 1,
	"Love Ball": 8,
	"Peso Ball": 40,
	"Rapid Ball": 4,
	"Gara Ball": 1.5,
	"Rete Ball": 3,
	"Minor Ball": 4,
	"Bis Ball": 3,
	"Timer Ball": 4,
	"Premier Ball": 1,
	"Chic Ball": 1,
	"Sub Ball": 3.5,
	"Scuro Ball": 3.5,
	"Velox Ball": 5,
	"Cura Ball": 1,
	"Pregio Ball": 1,
	"Parco Ball": 255,
	"Dream Ball": 255,
	"UC Ball": 5
}

class CatchRate {

	static Calculate_1_Generation(catchRate, status, PsRate, pokeball) {
		catchRate = parseInt(catchRate)

		if(pokeball == "Master Ball")
			return 1;

		let ball1 = pokeball == "Mega Ball" ? 8 : 12;
		let f = Math.floor(((1 / PsRate) * 1020) / ball1) + 1;

		let ball2 = pokeball == "Poké Ball" ? 255 : pokeball == "Mega Ball" ? 200 : 150;
		let statusVal = 0;
		switch (status) {
			case Status.Sleep:
			case Status.Freeze:
				statusVal = 25;
				break;
			case Status.Burn:
			case Status.Paralysis:
			case Status.Poison:
				statusVal = 12;
				break;
			default:
				statusVal = 0;
				break;
		}

		return Math.min((statusVal / (ball2 + 1)) + ((catchRate + 1) / (ball2 + 1)) * (f / 256), 1)
	}

	static Calculate_2_Generation(catchRate, status, PsRate, ball, pesoball = false) {
		catchRate = parseInt(catchRate)
		ball = ball instanceof String ? pokeballValue[ball] : ball
		let PsMax = 100
		let Ps = Math.floor(PsMax * PsRate + 0.5)

		let statusVal = 0;
		switch (status) {
			case Status.Sleep:
			case Status.Freeze:
				statusVal = 10;
				break;
			// case Status.Burn:
			// case Status.Paralysis:
			// case Status.Poison:
			// 	statusVal = 5;
			// 	break;
			default:
				statusVal = 0;
				break;
		}

		let a;
		if (pesoball)
			a = Math.floor(Math.max(((3 * PsMax - 2 * Ps) * catchRate) / (3 * PsMax), 1) + statusVal + ball);
		else
			a = Math.floor(Math.max(((3 * PsMax - 2 * Ps) * catchRate * ball) / (3 * PsMax), 1) + statusVal);

		a = a > 255 ? 255 : a;

		return a / 255
	}

	static Calculate_3_4_Generation(catchRate, status, PsRate, ball) {
		catchRate = parseInt(catchRate)
		ball = ball instanceof String ? pokeballValue[ball] : ball
		let PsMax = 100;
		let Ps = Math.floor(PsMax * PsRate + 0.5)

		let statusVal = 1;
		switch (status) {
			case Status.Sleep:
			case Status.Freeze:
				statusVal = 2;
				break;
			case Status.Burn:
			case Status.Paralysis:
			case Status.Poison:
				statusVal = 1.5;
				break;
			default:
				statusVal = 1;
				break;
		}

		let a;
		if (pesoball)
			a = (statusVal * (((3 * PsMax - 2 * Ps) * catchRate) / (3 * PsMax))) + ball;
		else
			a = statusVal * (((3 * PsMax - 2 * Ps) * catchRate * ball) / (3 * PsMax));

		let b = 1048560 / Math.sqrt(Math.sqrt(16711680 / a));

		return Math.pow(b / 65535, 4)
	}

	static Calculate_5_Generation(catchRate, status, PsRate, ball, CapturePower, pesoball = false) {
		catchRate = parseInt(catchRate)
		ball = ball instanceof String ? pokeballValue[ball] : ball
		let PsMax = 100;
		let Ps = Math.floor(PsMax * PsRate + 0.5)

		let statusVal = 1;
		switch (status) {
			case Status.Sleep:
			case Status.Freeze:
				statusVal = 2.5;
				break;
			case Status.Burn:
			case Status.Paralysis:
			case Status.Poison:
				statusVal = 1.5;
				break;
			default:
				statusVal = 1;
				break;
		}

		let a;
		if (pesoball)
			a = (CapturePower * statusVal * (((3 * PsMax - 2 * Ps) * catchRate) / (3 * PsMax))) + ball;
		else
			a = CapturePower * statusVal * (((3 * PsMax - 2 * Ps) * catchRate * ball) / (3 * PsMax));

		let b = 65535 / Math.sqrt(Math.sqrt(255 / a));

		return Math.pow(b / 65535, 3)
	}

	static Calculate_6_7_Generation(catchRate, status, PsRate, ball, OPower, pesoball = false) {
		catchRate = parseInt(catchRate)
		ball = ball instanceof String ? pokeballValue[ball] : ball
		let PsMax = 100;
		let Ps = Math.floor(PsMax * PsRate + 0.5)

		let statusVal = 1;
		switch (status) {
			case Status.Sleep:
			case Status.Freeze:
				statusVal = 2.5;
				break;
			case Status.Burn:
			case Status.Paralysis:
			case Status.Poison:
				statusVal = 1.5;
				break;
			default:
				statusVal = 1;
				break;
		}

		let a;
		if (pesoball)
			a = (OPower * statusVal * (((3 * PsMax - 2 * Ps) * catchRate) / (3 * PsMax))) + ball;
		else
			a =  OPower * statusVal * (((3 * PsMax - 2 * Ps) * catchRate * ball) / (3 * PsMax));

		let b = 65535 / Math.pow(255. / a, 3. / 16.);

		return Math.pow(b / 65535, 4)
	}

	static InverseProbability(p, probMax = 0.98) {
		return parseInt((Math.log(1 - probMax) / Math.log(1 - p))) + 1;
	}
}