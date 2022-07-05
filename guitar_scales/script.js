let spaces, nutBackgrounds, selectScale, selectTone;

const SCALES = {
	"major": [0, 2, 2, 1, 2, 2, 2, 1],
	"minor": [0, 2, 1, 2, 2, 1, 2, 2],
	"dorian": [0, 2, 1, 2, 2, 2, 1, 2],
	"phrygian": [0, 1, 2, 2, 2, 1, 2, 2],
	"lydian": [0, 2, 2, 2, 1, 2, 2, 1],
	"mixolydian": [0, 2, 2, 1, 2, 2, 1, 2],
	"locrian": [0, 1, 2, 2, 1, 2, 2, 2],
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
	if (showNotes.checked)
		document.querySelectorAll('.tooltiptext').forEach(e => e.classList.add("visible"));
	else
		document.querySelectorAll('.tooltiptext').forEach(e => e.classList.remove("visible"));
}

function createBollino(string, fret, interval, noteName) {
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

function updateBollini() {
	document.querySelectorAll('.bollino').forEach(e => e.remove());
	let foundamental = new Note(selectTone.value), s = 0;
	for (const semitones of SCALES[selectScale.value]) {
		foundamental.addSemitones(semitones);
		let positions = foundamental.toStringAndFret(true);
		s += semitones;
		for (const pos of positions)
			createBollino(pos.string, pos.fret, Note.SEMITONES_TO_INTERVALS[s % 12], foundamental.symbol());
	}
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

	constructor(note) {
		if (typeof note == 'string') {
			let num = note.replace(/[^0-9]/g, '');
			if (num.length != 1)
				num = "4";
			let symb = note.replace(/[^(#|b)]/g, '');
			if (symb.length == 1) {
				note = note.replace(/[(#|b|0-9)]/g, '').toUpperCase();
				if (note.length == 0) {
					note = "B";
					symb = "";
				}
				this.note = parseInt(num) * 12 + Note.NOTES[note + symb];
			}
			else if (symb.length == 2)
				this.note = parseInt(num) * 12 + Note.NOTES["Bb"];
			else if (symb.length == 0) {
				note = note.replace(/[(#|b|0-9)]/g, '').toUpperCase();
				this.note = parseInt(num) * 12 + Note.NOTES[note];
			}
		}
		else if (typeof note == 'number' && note >= 0 && note <= 107)
			this.note = note;
		else
			this.note = 57;
	}

	toStringAndFret(allOctaves = false) {
		let totFrets = 13;
		let positions = [], i = 1;
		if (allOctaves) {
			for (const noteBase of Note.STRING_NOTES) {
				let noteBaseMod = noteBase % 12;
				for (let note = this.note % 12; note <= noteBaseMod + totFrets; note += 12)
					if (noteBaseMod <= note)
						positions.push({ "string": i, "fret": note - noteBaseMod })
				i++;
			}
		}
		else {
			for (const noteBase of Note.STRING_NOTES) {
				if (this.note >= noteBase && this.note <= noteBase + totFrets)
					positions.push({ "string": i, "fret": this.note - noteBase });
				i++;
			}
		}
		return positions;
	}

	addSemitones(semitones) {
		this.note += semitones;
	}

	symbol() {
		return Note.NOTES_SYMB[this.note % 12];
	}
}

