let dim = 4,
	mode = 0,
	time = 0,
	queueModeCreator = false,
	steps_per_frame = 50;
	dim_selection = [4, 8, 16, 32, 64, 128, 256]

let maze_builder, exit_finder, interval, info_el;

function setup() {
	frameRate(60);
	canvas_width = parseInt(window.innerWidth / dim) * dim - 1;
	canvas_height = parseInt(window.innerHeight / dim) * dim - 1;
	createCanvas(canvas_width, canvas_height);
	strokeWeight(2);
	info_el = document.getElementById("info")
	reset();
}

function draw() {
	translate(1, 1);
	switch (mode) {
		case 0:
			for (let i = 0; i < steps_per_frame; i++)
				if (!maze_builder.step()) {
					info("Finding exit");
					info_el.style.opacity = 100;
					mode = 1;
					exit_finder = new Dijkstra(maze_builder.start, maze_builder.mat, xMat, yMat, maze_builder.cell_size);
					break;
				}
			break;
		case 1:
			for (let i = 0; i < steps_per_frame; i++)
				if (!exit_finder.step()) {
					info("Done");
					info_el.style.opacity = 100;
					mode = 2;
					time = Date.now();
					break;
				}
			break;
		case 2:
			if (Date.now() - time > 5000)
				reset();
			break;
	}
	info_el.style.opacity = info_el.style.opacity * 0.95;
}

function mouseWheel(event) {
	steps_per_frame = event.delta < 0 ? steps_per_frame * 1.2 : steps_per_frame / 1.2;
	if (steps_per_frame < 1) steps_per_frame = 1;
	if (steps_per_frame > 1e6) steps_per_frame = 1e6;
	info("Steps per frame: " + steps_per_frame.toFixed(0));
}

function keyPressed() {
	if (key == "q") {
		queueModeCreator = !queueModeCreator;
		info("Queue mode creator: " + queueModeCreator);
	}
	// space for dimension
	if (keyCode == 32) {
		dim = dim_selection[(dim_selection.indexOf(dim) + 1) % dim_selection.length];
		info("Cell size: " + dim);
	}
	// r for reset
	if (key == "r") {
		reset();
	}
	// h for help
	if (key == "h") {
		info("Q: toggle queue mode creator, SPACE: toggle cell size,  R: reset,  H: help,  Mouse Wheel: change steps per frame");
	}
}

function reset() {
	info("Maze Building");
	info_el.style.opacity = 100;
	mode = 0;
	xMat = parseInt(width / dim) + 1;
	yMat = parseInt(height / dim) + 1;
	maze_builder = new MazeBuilder(xMat, yMat, dim);
	// walls
	background(255);
	fill(0,0,0,100)
	noStroke();
	// rect(-dim * 0.5, -dim * 0.5, width, dim * 0.5 - 1);
	stroke(0);
}

function info(msg) {
	info_el.innerHTML = msg;
	info_el.style.opacity = 100;
}

class MazeBuilder {
	constructor(xDim, yDim, cell_size) {
		let x = parseInt(xDim * 0.5);
		let y = parseInt(yDim * 0.5);
		this.start = new Vect(x, y);
		this.curr = this.start.copy();
		this.prev = this.start.copy();
		this.size = new Vect(xDim, yDim);
		this.cell_size = cell_size;
		this.stack = [this.curr.copy()];
		this.mat = [];
		for (let i = 0; i < this.size.x; i++) {
			this.mat[i] = new Array(this.size.y);
			for (let j = 0; j < this.size.y; j++)
				this.mat[i][j] = -1;
		}
		this.mat[x][y] = 5;
		this.draw_mode = false;
		this.draw_progress = 0;
		this.draw_progress_step = 1;
	}
	step() {
		if (!this.draw_mode)
			return this.build_step();
		else
			return this.draw_step();
	}
	build_step() {
		let neighbours = this.neighbours();

		while (neighbours.length < 1) {
			if (this.stack.length < 1)
				return false;
			this.curr = queueModeCreator ? this.stack.shift() : this.stack.pop();
			neighbours = this.neighbours();
		}

		let next = random(neighbours);
		this.prev = this.curr.copy();

		switch (next) {
			case 0: this.curr.x--; break;//	1
			case 1: this.curr.y--; break;//0	 	2
			case 2: this.curr.x++; break;//	3
			case 3: this.curr.y++; break;
		}
		this.stack.push(this.curr.copy());
		if (this.mat[this.curr.x][this.curr.y] != 5)
			this.mat[this.curr.x][this.curr.y] = (next + 2) % 4;
		this.draw_mode = true;
		this.draw_progress = this.draw_progress_step;
		this.draw_step();
		return true
	}
	draw_step() {
		let x0 = this.prev.x * this.cell_size;
		let y0 = this.prev.y * this.cell_size;
		let x1 = this.curr.x * this.cell_size;
		let y1 = this.curr.y * this.cell_size;
		let x_d = x1 - x0;
		let y_d = y1 - y0;
		if (this.draw_progress >= 1) {
			this.draw_progress = 1;
			this.draw_mode = false;
		}
		line(x0, y0, x0 + x_d * this.draw_progress, y0 + y_d * this.draw_progress);
		this.draw_progress += this.draw_progress_step;
		return true
	}
	neighbours() {
		let neigh = [];
		let x = this.curr.x;
		let y = this.curr.y;
		if (x - 1 >= 0 && this.mat[x - 1][y] < 0) neigh.push(0);
		if (y - 1 >= 0 && this.mat[x][y - 1] < 0) neigh.push(1);
		if (x + 1 < this.size.x && this.mat[x + 1][y] < 0) neigh.push(2);
		if (y + 1 < this.size.y && this.mat[x][y + 1] < 0) neigh.push(3);
		return neigh;
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

class Dijkstra {
	constructor(start, matrix, xDim, yDim, cell_size) {
		this.piv = start.copy();
		this.cell_size = cell_size;
		this.size = new Vect(xDim, yDim);
		this.mat = matrix;
		this.left_free = (x, y) => this.mat[x][y] != 3 && this.mat[x][y + 1] != 1;
		this.right_free = (x, y) => this.mat[x + 1][y] != 3 && this.mat[x + 1][y + 1] != 1;
		this.up_free = (x, y) => this.mat[x][y] != 2 && this.mat[x + 1][y] != 0;
		this.down_free = (x, y) => this.mat[x][y + 1] != 2 && this.mat[x + 1][y + 1] != 0;
		this.is_exit = (x, y) => (x == 0 && this.left_free(x, y)) || (y == 0 && this.up_free(x, y)) || (x + 1 == this.size.x - 1 && this.right_free(x, y)) || (y + 1 == this.size.y - 1 && this.down_free(x, y))

		let u = this.xy_to_i(this.piv.x, this.piv.y)
		this.stack = [u];
		this.dist = {};
		this.prec = {};
		this.dist[u] = 0;
		this.prec[u] = -1;
		this.shortest_path = [];
		this.active = true;
		noStroke();
		fill(0, 255, 0);
		rect(this.piv.x * this.cell_size + 1, this.piv.y * this.cell_size + 1, this.cell_size - 2, this.cell_size - 2);
		stroke(0);

		this.draw_mode = false;
		this.draw_source = new Vect(this.piv.x * this.cell_size + this.cell_size / 2, this.piv.y * this.cell_size + this.cell_size / 2);
	}
	next() {
		let u = this.stack.shift();
		let uxy = this.i_to_xy(u);
		if (this.is_exit(uxy.x, uxy.y)) {
			this.active = false;
			fill(255, 0, 0);
			rect(uxy.x * this.cell_size + 1, uxy.y * this.cell_size + 1, this.cell_size - 2, this.cell_size - 2);
			let temp = u;
			while (this.prec[temp] != -1) {
				this.shortest_path.push(this.i_to_xy(temp));
				temp = this.prec[temp];
			}
		}

		let neigh = this.neighbours(u);
		for (let i = 0; i < neigh.length; i++) {
			let v = neigh[i];
			this.stack.push(v);
			let alt = this.dist[u] + 1;
			let dist_v = this.dist[v] ? this.dist[v] : Infinity;
			if (alt < dist_v) {
				this.dist[v] = alt;
				this.prec[v] = u;
				let prev_pos = this.i_to_xy(u);
				let curr_pos = this.i_to_xy(v);
				this.draw_cell(curr_pos.x, curr_pos.y, prev_pos.x, prev_pos.y);
			}
		}
	}
	step() {
		if (this.active) {
			this.next();
			return true;
		}

		if (this.draw_mode) {
			let dx = this.draw_target.x - this.draw_source.x;
			let dy = this.draw_target.y - this.draw_source.y;
			line(this.p.x, this.p.y, this.p.x + dx * 0.1, this.p.y + dy * 0.1);
			this.p.x += dx * 0.1;
			this.p.y += dy * 0.1;
			let d = dist(this.p.x, this.p.y, this.draw_target.x, this.draw_target.y);
			if (d < 0.01) {
				this.draw_mode = false;
				this.draw_source = this.draw_target.copy();
			}
			return true;
		}

		if (this.shortest_path.length > 0) {
			let p = this.shortest_path.pop();
			this.draw_mode = true;
			this.draw_target = new Vect(p.x * this.cell_size + this.cell_size / 2, p.y * this.cell_size + this.cell_size / 2)
			this.p = this.draw_source.copy();
			let dx = this.draw_target.x - this.draw_source.x;
			let dy = this.draw_target.y - this.draw_source.y;
			this.p_vel = new Vect(dx * 0.1, dy * 0.1)
			fill(255, 0, 0);
			strokeWeight(2);
			stroke(255, 0, 0);
			return true
		}

		return false;
	}
	neighbours(u) {
		let neigh = [];
		let x = this.i_to_xy(u).x;
		let y = this.i_to_xy(u).y;
		if (x - 1 >= 0 && this.left_free(x, y)) neigh.push(this.xy_to_i(x - 1, y));
		if (y - 1 >= 0 && this.up_free(x, y)) neigh.push(this.xy_to_i(x, y - 1));
		if (x + 1 < this.size.x - 1 && this.right_free(x, y)) neigh.push(this.xy_to_i(x + 1, y));
		if (y + 1 < this.size.y - 1 && this.down_free(x, y)) neigh.push(this.xy_to_i(x, y + 1));
		neigh = neigh.filter((n) => n != this.prec[u]);
		return neigh;
	}
	min_dist_in_set() {
		let min = Infinity;
		let min_i = -1;
		for (let i = 0; i < this.dist.length; i++) {
			if (this.set.has(i) && this.dist[i] < min) {
				min = this.dist[i];
				min_i = i;
			}
		}
		return min_i;
	}
	i_to_xy(i) {
		return new Vect(i % this.size.x, parseInt(i / this.size.x));
	}
	xy_to_i(x, y) {
		return x + y * this.size.x;
	}
	draw_cell(x, y, prev_x, prev_y) {
		colorMode(HSB, 360, 100, 100, 100);
		let col = atan2(y * this.cell_size - height / 2, x * this.cell_size - width / 2);
		fill(map(col, PI, -PI, 0, 360), 100, 100, 50);
		colorMode(RGB);
		noStroke();
		let xd = x - prev_x;
		let yd = y - prev_y;
		rect(x * this.cell_size + 1 - max(xd * 2, 0), y * this.cell_size + 1 - max(yd * 2, 0), this.cell_size - abs(yd) * 2, this.cell_size - abs(xd) * 2);
	}
	is_active() {
		return this.active;
	}
}