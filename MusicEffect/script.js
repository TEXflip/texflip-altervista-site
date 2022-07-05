var particles = [];
var attractors = [];
var div = 64, spectrumDim = 512,
	normalizer = logb(div,spectrumDim);
var fft = new p5.FFT(0,spectrumDim);
var spectrum, kickFreqPos = 0;

function setup(){
	sound = loadSound("audio.mp3",function(){
		sound.setVolume(1);
		sound.play();
	});
	
	
	createCanvas(window.innerWidth,window.innerHeight);
	for(var i = 0; i < 500; i++)
		particles.push(new Particle(random(width),random(height)));
	//attractors.push(new Attractor(1));
	colorMode(HSB,360,100,100,100);
}

function draw(){
	spectrum = fft.analyze();
	var val = 0;//map(spectrum[kickFreqPos],0,255,30,100);
	background(0,val,val);
	//for(var i in spectrum)
	//	line(i,0,i,spectrum[i]);
	//line(320,0,320,500);
	
	/*for(var i = 0; i < div; i++){
		stroke(0);
		line(i*(width/div),0,i*(width/div),height);
	}*/
	if(mouseIsPressed)
		for(var i in particles)
			particles[i].applyForce(createVector(mouseX-particles[i].pos.x,mouseY-particles[i].pos.y).mult(0.0001));	
	for(var i in attractors)
		attractors[i].show();
	for(var i in particles){
		particles[i].update();
		particles[i].show();
	}
}

function mousePressed(){
	
}

class Particle{
	constructor(x=width/2,y=height/2){
		this.pos = createVector(x,y);
		this.vel = createVector(random(),random());
		this.acc = createVector(0,0);
	}
	update(){
		this.vel.add(this.acc);
		var amp = parseInt(Math.pow(0.991,-spectrum[kickFreqPos]));
		this.pos.add(this.vel.copy().mult(/*map(amp,0,256,1,10)*/amp));
		this.acc.mult(0);
		if(this.pos.y > height)
			this.pos.y = 0;
		else if(this.pos.y < 0)
			this.pos.y = height;
		else if(this.pos.x > width)
			this.pos.x = 0;
		else if(this.pos.x < 0)
			this.pos.x = width;
	}
	applyForce(force){
		this.acc.add(force);
	}
	show(){
		noStroke();
		var dim = map(spectrum[spectrumIndex(this.pos.x)],0,256,2,20);
		var brightness = map(spectrum[spectrumIndex(this.pos.x)],0,256,0,100);
		//var alpha = this.pos.y > map(brightness,0,100,height,0) ? 100 : 0;
		fill(divColor(this.pos.x),100,brightness);
		ellipse(this.pos.x, this.pos.y,dim, dim);
	}
}

class Attractor{
	constructor(force){
		this.pos = createVector(width/2+100,height/2);
		this.force = force;
	}
	show(){
		for(var i in particles)
			particles[i].applyForce(this.pos.copy().sub(particles[i].pos).mult(0.01));
		noStroke();
		fill(255,0,0);
		ellipse(this.pos.x,this.pos.y,10,10);
	}
}

function divColor(x){
	for(var i = 0; i < div; i++)
		if(x>i*(width/div) && x<(i+1)*(width/div))
			return map(i,0,div-1,0,180);
}
function spectrumIndex(x){
	for(var i = 0; i < div; i++)
		if(x>i*(width/div) && x<(i+1)*(width/div))
			return parseInt(Math.pow(i,normalizer));
}

function logb(x, y) {
  return Math.log(y) / Math.log(x);
}

function allowDrop(e){
	e.preventDefault();
}

function drop(e){
	e.preventDefault();
	sound.stop();
	sound = loadSound(e.dataTransfer.files[0],function(){
		sound.connect();
		sound.play();
	});
}