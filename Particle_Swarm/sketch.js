let swarm, fish, tot = 200;
let sliderCohesion, sliderAlign, sliderSep;

function setup() {
	createCanvas(window.innerWidth, window.innerHeight, WEBGL);
	imageMode(CENTER)
	swarm = new Swarm(tot);

	sliderCohesion = createSlider(0, 100, 42.9686);
	sliderCohesion.position(10, 5)
	sliderAlign = createSlider(0, 100, 81);
	sliderAlign.position(10, 25)
	sliderSep = createSlider(1, 200, 40);
	sliderSep.position(10, 45)
}

function draw() {
	background(0, 0, 30);
	translate(-width / 2, -height / 2);
	swarm.cohesionCoeff = Math.pow(2, -0.13286413 * (sliderCohesion.value() - 100))+9;
	console.log(swarm.cohesionCoeff)
	swarm.alignmentCoeff = map(sliderAlign.value(), 0, 100, 100, 1);
	swarm.separationCoeff = sliderSep.value();
	swarm.update();
}

function preload() {
	fish = loadImage("fish_low.png");
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}