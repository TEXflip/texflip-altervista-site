class Particle {
	constructor() {
		if (arguments.length == 1)
			this.pos = arguments[0]
		else if (arguments.length == 2)
			this.pos = createVector(arguments[0], arguments[1]);
		else
			this.pos = createVector(0, 0);
		this.vel = createVector(random(-1, 1.1), random(-1, 1));
		this.x = this.pos.x;
		this.y = this.pos.y;
		this.dimension = 28;
		this.drawFish = true;
		this.maxVel = 20;
		this.stableVel = 5;
		this.color = [200, 40, 78.4];
		this.margin = 50;
		this.boundary_force = 0.01;
	}

	color_from_vel(){
		const speed = this.vel.mag();
		const v = map(speed, 0, this.maxVel, 60, 255);
		return color(this.color[0], this.color[1], v);
	}

	updateVelocity(neighbours, func, param) {
		this.vel.add(func(neighbours, this.pos, this.vel, param));
	}

	update(n) {
		this.vel.add(this.detectBoundary());
		const speed = this.vel.mag();
		if (speed > this.stableVel) {
			this.vel.sub(p5.Vector.normalize(this.vel).mult(0.1))
			if (speed > this.maxVel)
				this.vel.normalize().mult(this.maxVel);
		}

		this.pos.add(this.vel);
		this.x = this.pos.x;
		this.y = this.pos.y;

		this.show(n);
	}

	show() {
		const vel = p5.Vector.normalize(this.vel).mult(this.dimension);
		if (this.drawFish) {
			push()
			translate(this.x, this.y);
			rotate(atan2(-vel.y, -vel.x));
			tint(this.color_from_vel());
			image(fish, 0, 0, this.dimension, this.dimension * 0.46)
			pop()
		}
		else {
			const v1 = p5.Vector.add(vel, this.pos);
			const v2 = p5.Vector.rotate(vel, HALF_PI).mult(0.02 * this.dimension).add(this.pos);
			const v3 = p5.Vector.rotate(vel, -HALF_PI).mult(0.02 * this.dimension).add(this.pos);
			fill(this.color_from_vel());
			beginShape()
			vertex(v1.x, v1.y)
			vertex(v2.x, v2.y)
			vertex(v3.x, v3.y)
			endShape()
		}
	}

	detectBoundary() {
		const v = this.pos;
		const out = createVector(0, 0);
		const f = this.boundary_force;
		if (v.x > width - this.margin)
			out.x = -f * (v.x - width + this.margin);
		else if (v.x < 0 + this.margin)
			out.x = f * (-v.x + this.margin);
		if (v.y > height - this.margin)
			out.y = -f * (v.y - height + this.margin);
		else if (v.y < 0 + this.margin)
			out.y = f * (-v.y + this.margin);
		return out;
	}
}

class Grid {
	constructor(w, h, size = 15) {
		this.grid_size = size;
		this.grid_map = new Array(Math.ceil(w / size));
		for (let i = 0; i < this.grid_map.length; i++)
			this.grid_map[i] = new Array(Math.ceil(h / size));
	}
	update(particles) {
		for (let i = 0; i < this.grid_map.length; i++)
			for (let j = 0; j < this.grid_map[i].length; j++)
				this.grid_map[i][j] = undefined;
		for (const p of particles) {
			let x = Math.min(Math.max(0, p.x), width - 1);
			let y = Math.min(Math.max(0, p.y), height - 1);
			const i = Math.floor(x / this.grid_size),
				j = Math.floor(y / this.grid_size);
			if (this.grid_map[i][j] == undefined)
				this.grid_map[i][j] = [];
			p.color = color(i%2 * 255, j%2 * 255, 255 - (i%2 + j%2) * 255);
			this.grid_map[i][j].push(p);
		}
	}
	nearest(start, r) {
		let neighbours = [];
		let i = Math.floor(start.x / this.grid_size),
			j = Math.floor(start.y / this.grid_size),
			r_i = Math.ceil(r / this.grid_size);
		for (let k = Math.max(0, i - r_i); k < Math.min(this.grid_map.length, i + r_i); k++)
			for (let l = Math.max(0, j - r_i); l < Math.min(this.grid_map[k].length, j + r_i); l++)
				if (this.grid_map[k][l] != undefined)
					for (const p of this.grid_map[k][l])
						if (p5.Vector.dist(p.pos, start) < r)
							neighbours.push(p);
		return neighbours;
	}
}

class Swarm {
	constructor(n) {
		this.swarm = [];
		this.fps = 60;
		this.grid = new Grid(width, height, 100);

		for (let i = 0; i < n; i++) {
			const x = random(0, width);
			const y = random(0, height);
			this.swarm.push(new Particle(x, y));
		}

		this.distance = function (a, b) {
			return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
		}

		this.cohesionCoeff = 200;
		this.alignmentCoeff = 20;
		this.separationCoeff = 40;
	}

	update() {
		const startTime = performance.now();
		// this.grid.update(this.swarm);
		for (const p of this.swarm) {
			let neighbours = this.near(p, max(width, height) / 10);
			// let neighbours = this.grid.nearest(p.pos, 100);
			// console.log(neighbours.length);

			p.updateVelocity(neighbours, this.cohesion, this.cohesionCoeff);
			p.updateVelocity(neighbours, this.alignment, this.alignmentCoeff);
			p.updateVelocity(neighbours, this.separation, this.separationCoeff);
			p.update();
		}
		const endTime = performance.now();
		const fps = 1000/(endTime - startTime);
		const alpha = 0.02;
		this.fps = (1-alpha) * this.fps + alpha * fps;
		// const fps = endTime - startTime;
		console.log("FPS: " + this.fps.toFixed(0));
	}

	show() {
		for (const p of this.swarm)
			p.show();
	}

	cohesion(neighbours, pos, vel, cohesionCoeff) {
		let pAvg = createVector(0, 0);
		for (const p of neighbours)
			pAvg.add(p.pos);
		if (neighbours.length > 0)
			pAvg.div(neighbours.length);
		return pAvg.sub(pos).div(cohesionCoeff);
	}

	alignment(neighbours, pos, vel, alignmentCoeff) {
		let pAvg = createVector(0, 0);
		for (const p of neighbours)
			pAvg.add(p.vel);
		if (neighbours.length > 0)
			pAvg.div(neighbours.length);
		return pAvg.sub(vel).div(alignmentCoeff);
	}

	separation(neighbours, pos, vel, separationCoeff) {
		let pAvg = createVector(0, 0);
		for (const p of neighbours) {
			let sub = p5.Vector.sub(p.pos, pos);
			let mag = sub.mag();
			if (mag < separationCoeff) {
				let s = 50 * Math.pow(2, -0.33 * (mag * 30 / separationCoeff)) + 1;
				pAvg.sub(p5.Vector.mult(sub.div(200), s));
			}
		}
		let sub = p5.Vector.sub(createVector(mouseX, mouseY), pos);
		let mag = sub.mag();
		if (mag < 150) {
			let s = 50 * Math.pow(2, -0.33 * mag) + 1;
			pAvg.sub(p5.Vector.mult(sub.div(25), s));
		}
		return pAvg;
	}

	near(fish, r) {
		let neighbours = [];
		for (const p of this.swarm){
			if (p5.Vector.dist(p.pos, fish.pos) < r)
				neighbours.push(p);
		}
		fish.color[1] = map(neighbours.length, 0, this.swarm.length/2, 0, 255);
		return neighbours;
	}

	nearest(start, n) {
		let minDist = [], minIndex = [];
		for (let i = 0; i < n; i++) {
			minDist.push(10000000);
			minIndex.push(undefined);
		}
		for (const p of this.swarm) {
			let dist = p5.Vector.dist(p.pos, start)
			if (dist == 0)
				continue;

			if (dist < minDist[n - 1]) {
				minDist[n - 1] = dist;
				minIndex[n - 1] = p;
				for (let i = n - 1; i > 0; i--) {
					if (minDist[i] < minDist[i - 1]) {
						let temp1 = minDist[i - 1],
							temp2 = minIndex[i - 1];
						minDist[i - 1] = minDist[i];
						minIndex[i - 1] = minIndex[i];
						minDist[i] = temp1;
						minIndex[i] = temp2;
					}
				}
			}
		}
		return minIndex;
	}
}