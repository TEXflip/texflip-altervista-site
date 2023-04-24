let spaces, nutBackgrounds, selectScale, selectTone;

const SCALES = {
	"major": [0, 2, 2, 1, 2, 2, 2],
	"minor": [0, 2, 1, 2, 2, 1, 2],
	"dorian": [0, 2, 1, 2, 2, 2, 1],
	"phrygian": [0, 1, 2, 2, 2, 1, 2],
	"lydian": [0, 2, 2, 2, 1, 2, 2],
	"mixolydian": [0, 2, 2, 1, 2, 2, 1],
	"locrian": [0, 1, 2, 2, 1, 2, 2],
}

window.onload = function () {
	selectScale = document.getElementById("scales");
	selectTone = document.getElementById("tones");
	document.getElementById("showNotes").onchange = updateShowNotes;
	selectScale.onchange = updateBollini;
	selectTone.onchange = updateBollini;
	for (const scale in SCALES) {
		let tag = document.createElement("option");
		tag.value = scale;
		tag.innerHTML = scale[0].toLocaleUpperCase() + scale.substring(1);
		selectScale.appendChild(tag);
	}
	spaces = document.getElementsByClassName("space");
	nutBackgrounds = document.getElementsByClassName("nut-background");
	let scaleLength = 17.817, i = 0, distance, precDistance;

	for (const div of spaces) {
		if (i++ % 13 == 0) {
			distance = 0;
			precDistance = 0;
		}

		distance += (scaleLength - distance) / 17.817;

		div.style["flex-grow"] = distance - precDistance;
		precDistance = distance;
	}
	updateBollini();
}

function updateShowNotes() {
	let showNotes = document.getElementById("showNotes");
	if (showNotes.checked){
		document.querySelectorAll('.tooltiptext').forEach(e => e.classList.add("visible"));
		document.querySelectorAll('.white-keynote').forEach(e => e.classList.add("visible"));
		document.querySelectorAll('.black-keynote').forEach(e => e.classList.add("visible"));
	}
	else {
		document.querySelectorAll('.tooltiptext').forEach(e => e.classList.remove("visible"));
		document.querySelectorAll('.white-keynote').forEach(e => e.classList.remove("visible"));
		document.querySelectorAll('.black-keynote').forEach(e => e.classList.remove("visible"));
	}
}

/**
 * 
 * @param {int} string number of the string
 * @param {int} fret number of the fret
 * @param {String} interval interval symbol
 * @param {String} noteName note symbol
 */
function createBollinoGuitar(string, fret, interval, noteName) {
	let tag = document.createElement("div");
	tag.className = "bollino";
	let label = document.createElement("label");
	label.className = "num-bollino";
	label.innerHTML = interval;
	tag.appendChild(label);
	let tooltip = document.createElement("span");
	tooltip.className = "tooltiptext";
	tooltip.innerHTML = noteName;
	tag.appendChild(tooltip)
	tag.style.backgroundColor = "var(--col-" + interval.replace(/[^0-9]/g, '') + ")";
	let offY = nutBackgrounds[1].offsetHeight / 2;
	if (fret == 0) {
		nutBackgrounds[string - 1].appendChild(tag);
		tag.style.transform = "translate(-22px, -" + offY + "px)"
	}
	else {
		if (string == 1) {
			spaces[13 * (string) + fret - 1].appendChild(tag);
			tag.style.transform = "translate(0px, -" + offY + "px)";
		}
		else {
			spaces[13 * (string - 1) + fret - 1].appendChild(tag);
			tag.style.transform = "translate(0px, " + offY + "px)";
		}
	}
}

function createBollinoPiano(color, color_relative_pos, interval, note_str) {
	let tag = document.createElement("div");
	tag.className = "bollino";
	let label = document.createElement("label");
	label.className = "num-bollino";
	label.innerHTML = interval;
	tag.appendChild(label);
	tag.style.position = "absolute";
	tag.style.backgroundColor = "var(--col-" + interval.replace(/[^0-9]/g, '') + ")";
	let piano = document.getElementById(color + "-keys");
	let key = piano.children[color_relative_pos];
	key.appendChild(tag);
	if (color == "black")
		tag.style.transform = `translate(${key.offsetWidth * 0.075}px, ${-key.offsetHeight * 0.5}px)`;
	else
		tag.style.transform = `translate(${key.offsetWidth * 0.25}px, ${key.offsetHeight * 0.68}px)`;
}

function updateBollini() {
	document.querySelectorAll('.bollino').forEach(e => e.remove());
	let foundamental = new Note(selectTone.value);

	// iterate over the scale
	for (const semitones of SCALES[selectScale.value]) {
		foundamental.addSemitones(semitones); // shift the note to the next one of the scale

		// ======================== guitar ========================
		let positions = foundamental.toStringAndFret(true); // get all the guitar positions of the note

		for (const pos of positions)
			createBollinoGuitar(pos.string, pos.fret, foundamental.interval, foundamental.note_str);

		// ======================== piano =========================
		positions = foundamental.toPianoKey(2); // get all the piano positions of the note

		for (const pos of positions)
			createBollinoPiano(pos.color, pos.color_relative_pos, foundamental.interval, foundamental.note_str);
	}

	updateShowNotes();
}


class Note {

	static NOTES = {
		"C": 0,
		"C#": 1,
		"Db": 1,
		"D": 2,
		"D#": 3,
		"Eb": 3,
		"E": 4,
		"F": 5,
		"F#": 6,
		"Gb": 6,
		"G": 7,
		"G#": 8,
		"Ab": 8,
		"A": 9,
		"A#": 10,
		"Bb": 10,
		"B": 11
	};

	static NOTES_SYMB = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

	static STRING_NOTES = [76, 71, 67, 62, 57, 52];

	static SEMITONES_TO_INTERVALS = ["8", "2m", "2", "3m", "3", "4", "d5", "5", "6m", "6", "7m", "7"];

	constructor(foundamental) {
		if (typeof foundamental == 'string') {
			let num = foundamental.replace(/[^0-9]/g, '');
			if (num.length != 1)
				num = "4";
			let symb = foundamental.replace(/[^(#|b)]/g, '');
			if (symb.length == 1) {
				foundamental = foundamental.replace(/[(#|b|0-9)]/g, '').toUpperCase();
				if (foundamental.length == 0) {
					foundamental = "B";
					symb = "";
				}
				this.note = parseInt(num) * 12 + Note.NOTES[foundamental + symb];
			}
			else if (symb.length == 2)
				this.note = parseInt(num) * 12 + Note.NOTES["Bb"];
			else if (symb.length == 0) {
				foundamental = foundamental.replace(/[(#|b|0-9)]/g, '').toUpperCase();
				this.note = parseInt(num) * 12 + Note.NOTES[foundamental];
			}
		}
		else if (typeof foundamental == 'number' && foundamental >= 0 && foundamental <= 107)
			this.note = foundamental;
		else
			this.note = 57; // A 440Hz
		this.foundamental = this.note;
	}

	/**
	 * return a list of all the positions (string and fret) of the note in the guitar
	 * 
	 * @param {bool} allOctaves if true, returns all the positions of the note in all the octaves
	 * @returns {Array<object>}
	 */
	toStringAndFret(allOctaves = false, numOfFrets = 13) {
		let positions = [], string = 1;
		if (allOctaves) {
			for (const noteBase of Note.STRING_NOTES) {
				let noteBaseMod = noteBase % 12;
				for (let note = this.note % 12; note <= noteBaseMod + numOfFrets; note += 12)
					if (noteBaseMod <= note)
						positions.push({ "string": string, "fret": note - noteBaseMod })
				string++;
			}
		}
		else {
			for (const noteBase of Note.STRING_NOTES) {
				if (this.note >= noteBase && this.note <= noteBase + numOfFrets)
					positions.push({ "string": string, "fret": this.note - noteBase });
				string++;
			}
		}
		return positions;
	}

	/**
	 * return a list of all the positions (key and color) of the note in the piano
	 * 
	 * @param {int} octaves number of octaves to return 
	 * @returns {Array<object>}
	 */
	toPianoKey(octaves = 2) {
		let positions = [];
		let note_from_c = this.note % 12;
		
		// black keys are 1, 3, 6, 8, 10; white keys are 0, 2, 4, 5, 7, 9, 11
		let color = (note_from_c == 1 || note_from_c == 3 || note_from_c == 6 || note_from_c == 8 || note_from_c == 10) ? "black" : "white";
		
		// map the note from C to the relative position in the color
		let color_relative_map = [0, 0, 1, 1, 2, 3, 2, 4, 3, 5, 4, 6];
		let color_relative_pos = color_relative_map[note_from_c];

		for (let i = 0; i < octaves; i++)
			positions.push({ "key": note_from_c + i * 12, 
							 "color": color, 
							 "color_relative_pos": color_relative_pos + i * ((color == "black") ? 5 : 7) });
		
		return positions;
	}

	/**
	 * change the note by adding/subtracting semitones
	 * @param {int} semitones 
	 */
	addSemitones(semitones) {
		// add the semitones to the current note
		this.note += semitones;

		// get the note name (es. C#)
		this.note_str = Note.NOTES_SYMB[this.note % 12];

		// intervals are relative to the foundamental
		this.interval = Note.SEMITONES_TO_INTERVALS[(this.note - this.foundamental) % 12];
	}
}

