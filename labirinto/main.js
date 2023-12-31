let dim = 64, queueMode = true, queueModeCreator = false, invSpeed = 1, speedV2 = 1;//fattore moltiplicativo
let xMat = 0, yMat = 0, piv, oldPiv, exit, interval;
let mat = [], stack = [], exitMat = [];

function setup() {
	frameRate(60);
	createCanvas(window.innerWidth - 1, window.innerHeight - 1);
	translate(dim * 0.25, dim * 0.25);
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
	fill(0, 0, 255)
	// rect(piv.x * dim, piv.y * dim, dim, dim)
	textAlign(CENTER, CENTER);
	textSize(dim / 3);
	text("Start!", piv.x * dim + dim * 0.5, piv.y * dim + dim * 0.5);
	stroke(0);
	strokeWeight(2);
	interval = setInterval(drawLab, invSpeed);
}

function drawLab() {
	for (let i = 0; i < speedV2; i++) {
		if (stack.length > 0)
			nextStep();
		else if (exit.stack.length > 0)
			exit.next();
		// else if (exit.shortest_path.length > 0) {
		// 	let temp = exit.shortest_path.shift();
		// 	fill(255, 0, 0);
		// 	circle(temp.x * dim + dim * 0.5, temp.y * dim + dim * 0.5, dim * 0.25);
		// }
		else {
			// stop the loop
			clearInterval(interval);
		}
	}
}

function nextStep() {
	let choice = [];
	if (piv.x - 1 >= 0 && mat[piv.x - 1][piv.y] < 0) choice.push(0);
	if (piv.y - 1 >= 0 && mat[piv.x][piv.y - 1] < 0) choice.push(1);
	if (piv.x + 1 < xMat && mat[piv.x + 1][piv.y] < 0) choice.push(2);
	if (piv.y + 1 < yMat && mat[piv.x][piv.y + 1] < 0) choice.push(3);

	let next = random(choice);
	oldPiv = piv.copy();

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
		this.shortest_path = [];
		this.haiPoppato = false;
		this.color = 0;
		this.left_free = () => mat[this.piv.x][this.piv.y] != 3 && mat[this.piv.x][this.piv.y + 1] != 1;
		this.right_free = () => mat[this.piv.x + 1][this.piv.y] != 3 && mat[this.piv.x + 1][this.piv.y + 1] != 1;
		this.up_free = () => mat[this.piv.x][this.piv.y] != 2 && mat[this.piv.x + 1][this.piv.y] != 0;
		this.down_free = () => mat[this.piv.x][this.piv.y + 1] != 2 && mat[this.piv.x + 1][this.piv.y + 1] != 0;
	}
	next() {
		let choice = [];
		if (this.piv.x - 1 >= 0 && !exitMat[this.piv.x - 1][this.piv.y] && this.left_free()) choice.push(0);
		if (this.piv.y - 1 >= 0 && !exitMat[this.piv.x][this.piv.y - 1] && this.up_free()) choice.push(1);
		if (this.piv.x + 1 < xMat - 1 && !exitMat[this.piv.x + 1][this.piv.y] && this.right_free()) choice.push(2);
		if (this.piv.y + 1 < yMat - 1 && !exitMat[this.piv.x][this.piv.y + 1] && this.down_free()) choice.push(3);

		// if you find the exit
		if ((this.piv.x == 0 && this.left_free())
			|| (this.piv.y == 0 && this.up_free())
			|| (this.piv.x + 1 == xMat - 1 && this.right_free())
			|| (this.piv.y + 1 == yMat - 1 && this.down_free())) {
			fill(0, 255, 0);
			rect(this.piv.x * dim + 1, this.piv.y * dim + 1, dim - 2, dim - 2);
			fill(0);
			text("Exit!", this.piv.x * dim + dim * 0.5, this.piv.y * dim + dim * 0.5);
			// for (let i = 0; i < this.stack.length; i++)
			// 	this.shortest_path.push(this.stack[i].copy());
		}

		if (choice.length > 0 && this.haiPoppato) {
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
			colorMode(HSB, 360, 100, 100, 100);
			let col = atan2(this.piv.y * dim - height / 2, this.piv.x * dim - width / 2);
			fill(map(col, PI, -PI, 0, 360), 100, 100, 50);
			colorMode(RGB);
			noStroke();
			rect(this.piv.x * dim + 1, this.piv.y * dim + 1, dim, dim);
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