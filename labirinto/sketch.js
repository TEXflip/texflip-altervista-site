let dim = 4, queueMode = true, queueModeCreator = false, invSpeed = 1, speedV2 = 100;//fattore moltiplicativo
let xMat = 0, yMat = 0, piv, oldPiv, exit;
let mat = [], stack = [], exitMat = [];

function setup() {
	frameRate(1024);
	rectMode(CENTER);
	//angleMode(DEGREES);
	createCanvas(window.innerWidth, window.innerHeight);
	piv = new Vect(0, 0);
	xMat = parseInt(width / dim) + 1;
	yMat = parseInt(height / dim) + 1;
	for (let i = 0; i < xMat; i++) {
		mat[i] = new Array(yMat);
		for (let j = 0; j < yMat; j++)
			mat[i][j] = -1;
	}
	for (let i = 0; i < xMat - 1; i++) {
		exitMat[i] = new Array(yMat);
		for (let j = 0; j < yMat - 1; j++)
			exitMat[i][j] = false;
	}
	piv.x = parseInt(xMat / 2);
	piv.y = parseInt(yMat / 2);
	mat[piv.x][piv.y] = 5;
	stack.push(piv.copy());
	exit = new exiter(piv.x, piv.y);
	noStroke();
	fill(0, 0, 255, 180)
	rect(piv.x * dim + dim / 2, piv.y * dim + dim / 2, dim, dim)
	textAlign(CENTER, CENTER);
	textSize(dim / 3);
	text("Start!", piv.x * dim + dim / 2, piv.y * dim + dim / 2);
	stroke(0);
	setInterval(drawLab, invSpeed);
}

function drawLab() {
	for (let i = 0; i < speedV2; i++) {
		if (stack.length > 0)
			nextStep();
		else if (exit.stack.length > 0)
			exit.next();
	}
}

function mousePressed() {

}

function nextStep() {
	let choice = [];
	if (piv.x - 1 >= 0 && mat[piv.x - 1][piv.y] < 0) choice.push(0);
	if (piv.y - 1 >= 0 && mat[piv.x][piv.y - 1] < 0) choice.push(1);
	if (piv.x + 1 < xMat && mat[piv.x + 1][piv.y] < 0) choice.push(2);
	if (piv.y + 1 < yMat && mat[piv.x][piv.y + 1] < 0) choice.push(3);

	let next = random(choice);
	oldPiv = piv.copy();

	//console.log(choice,next,xPiv,yPiv);

	switch (next) {
		case 0: piv.x--; break;//	1
		case 1: piv.y--; break;//0	 	2
		case 2: piv.x++; break;//	3
		case 3: piv.y++; break;
	}
	if (choice.length > 0) {
		stack.push(piv.copy());
		if (mat[piv.x][piv.y] != 5)
			mat[piv.x][piv.y] = (next + 2) % 4;
		line(oldPiv.x * dim, oldPiv.y * dim, piv.x * dim, piv.y * dim);
	}
	else {
		if (queueModeCreator)
			piv = stack.shift();
		else
			piv = stack.pop();
		//stroke(random(255),random(255),random(255));
	}
}

class Vect {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	copy() {
		return new Vect(this.x, this.y);
	}
}

class exiter {
	constructor(x, y) {
		this.piv = new Vect(x, y)
		this.stack = [];
		this.stack.push(this.piv.copy());
		this.scale = 1;
		this.haiPoppato = false;
		this.color = 0;
	}
	next() {
		let choice = [];
		if (this.piv.x - 1 >= 0 && !exitMat[this.piv.x - 1][this.piv.y] && mat[this.piv.x][this.piv.y] != 3 && mat[this.piv.x][this.piv.y + 1] != 1) choice.push(0);
		if (this.piv.y - 1 >= 0 && !exitMat[this.piv.x][this.piv.y - 1] && mat[this.piv.x][this.piv.y] != 2 && mat[this.piv.x + 1][this.piv.y] != 0) choice.push(1);
		if (this.piv.x + 1 < xMat - 1 && !exitMat[this.piv.x + 1][this.piv.y] && mat[this.piv.x + 1][this.piv.y] != 3 && mat[this.piv.x + 1][this.piv.y + 1] != 1) choice.push(2);
		if (this.piv.y + 1 < yMat - 1 && !exitMat[this.piv.x][this.piv.y + 1] && mat[this.piv.x][this.piv.y + 1] != 2 && mat[this.piv.x + 1][this.piv.y + 1] != 0) choice.push(3);

		if ((this.piv.x - 1 == -1 && mat[this.piv.x][this.piv.y] != 3 && mat[this.piv.x][this.piv.y + 1] != 1)
			|| (this.piv.y - 1 == -1 && mat[this.piv.x][this.piv.y] != 2 && mat[this.piv.x + 1][this.piv.y] != 0)
			|| (this.piv.x + 1 == xMat - 1 && mat[this.piv.x + 1][this.piv.y] != 3 && mat[this.piv.x + 1][this.piv.y + 1] != 1)
			|| (this.piv.y + 1 == yMat - 1 && mat[this.piv.x][this.piv.y + 1] != 2 && mat[this.piv.x + 1][this.piv.y + 1] != 0)) {
			fill(0, 255, 0);
			rect(this.piv.x * dim + dim / 2, this.piv.y * dim + dim / 2, dim * this.scale, dim * this.scale);
		}

		if (choice.length > 0)
			if (this.haiPoppato) {
				this.stack.push(this.piv.copy());
				this.haiPoppato = false;
			}

		let next = random(choice);

		switch (next) {
			case 0: this.piv.x--; break;//	1
			case 1: this.piv.y--; break;//0	 	2
			case 2: this.piv.x++; break;//	3
			case 3: this.piv.y++; break;
		}
		if (choice.length > 0) {
			this.stack.push(this.piv.copy());
			colorMode(HSB,360,100,100,100);
			let col = atan2(this.piv.y * dim - height / 2, this.piv.x * dim - width / 2);
			fill(map(col, PI, -PI, 0, 360), 100, 100, 50);
			colorMode(RGB);
			noStroke();
			rect(this.piv.x * dim + dim / 2, this.piv.y * dim + dim / 2, dim * this.scale, dim * this.scale);
			exitMat[this.piv.x][this.piv.y] = true;
		}
		else {
			if (queueMode)
				this.piv = this.stack.shift();
			else
				this.piv = this.stack.pop();
			this.haiPoppato = true;
		}
	}
}