
let mic, recorder, state = 0, sound, col, alpha = 0.80, levelp = 1.0,
	normal, reverse;

function setup() {
	separator = document.getElementById("separator");
	normal = document.getElementById("normal");
	reverse = document.getElementById("reverse");
	createCanvas(separator.offsetWidth, window.innerHeight);
	canvas = document.getElementById("defaultCanvas0");
	canvas.style = "left: " + separator.getBoundingClientRect().left;
	col = color(255, 255, 255);
	mic = new p5.AudioIn(micNotFound);
	mic.start();
	recorder = new p5.SoundRecorder();
	recorder.setInput(mic);
	sound = new p5.SoundFile();
}

function draw() {
	background(col);
	canvas.style = "left: " + separator.getBoundingClientRect().left;
	let level = mic.getLevel();
	level = map(level, 0, 1, 0, height);
	level = level < 1 ? 1 : level;
	level = (5 * Math.pow(Math.log2(level), 2) / Math.log2(1.4)) + 1;
	if (!isFinite(levelp)) levelp = level;
	levelp = alpha * levelp + (1 - alpha) * level;
	fill(0);
	noStroke();
	rect(0, height, width, -levelp);
}

function keyPressed(value) {
	if (state == 0 && mic.enabled && (keyCode == 32 || keyCode == 17 || value > 0)) {
		recorder.record(sound);
		state = 1;
	}
}

async function keyReleased(value) {
	if (state == 1 && (keyCode == 32 || keyCode == 17 || value == 1 || value == 2)) {
		recorder.stop();
		await sleep(500);
		if (keyCode == 17 || value == 2) {
			sound.play();
			sound.onended(roversa);
		}
		else
			roversa();
	}
}

function roversa() {
	if (state == 1) {
		sound.reverseBuffer();
		sound.play();
		state = 0;
	}
}

function micNotFound() {
	col = color(0);
	text("microfone not found", width / 2, height / 2)
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}