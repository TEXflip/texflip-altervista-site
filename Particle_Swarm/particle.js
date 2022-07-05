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
		this.dimension = 25;
		this.drawFish = true;
		this.maxVel = 20;
		this.stableVel = 5;
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
		const v1 = p5.Vector.add(vel, this.pos);
		const v2 = p5.Vector.rotate(vel, HALF_PI).mult(0.02 * this.dimension).add(this.pos);
		const v3 = p5.Vector.rotate(vel, -HALF_PI).mult(0.02 * this.dimension).add(this.pos);
		if (this.drawFish) {
			push()
			translate(this.x, this.y);
			rotate(atan2(-vel.y, -vel.x));
			tint(120, 120, 200);
			image(fish, 0, 0, this.dimension, this.dimension * 0.46)
			pop()
		}
		else {
			fill(100, 100, 255);
			beginShape()
			vertex(v1.x, v1.y)
			vertex(v2.x, v2.y)
			vertex(v3.x, v3.y)
			endShape()
		}
	}

	detectBoundary() {
		const v = p5.Vector.normalize(this.vel).add(this.pos);
		const out = createVector(0, 0);
		const f = 0.01,
			margin = 50;
		if (v.x > width - margin)
			out.x = -f * (v.x - width + margin);
		else if (v.x < 0 + margin)
			out.x = f * (-v.x + margin);
		if (v.y > height - margin)
			out.y = -f * (v.y - height + margin);
		else if (v.y < 0 + margin)
			out.y = f * (-v.y + margin);
		return out;
	}
}

class Swarm {
	constructor(n) {
		this.swarm = [];

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
		for (const p of this.swarm) {
			let neighbours = this.nearest(p.pos, 10);

			p.updateVelocity(neighbours, this.cohesion, this.cohesionCoeff);
			p.updateVelocity(neighbours, this.alignment, this.alignmentCoeff);
			p.updateVelocity(neighbours, this.separation, this.separationCoeff);
			p.update();
		}
	}

	show() {
		for (const p of this.swarm)
			p.show();
	}

	cohesion(neighbours, pos, vel, cohesionCoeff) {
		let pAvg = createVector(0, 0);
		for (const p of neighbours)
			pAvg.add(p.pos);
		pAvg.div(neighbours.length);
		return pAvg.sub(pos).div(cohesionCoeff);
	}

	alignment(neighbours, pos, vel, alignmentCoeff) {
		let pAvg = createVector(0, 0);
		for (const p of neighbours)
			pAvg.add(p.vel);
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