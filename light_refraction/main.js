let x_c, y_c, small_side, large_side, _n1 = 1, _n2 = 1.31;
let input_n1, input_n2;
let light_size = 3

function sign(x) {
	return x > 0 ? 1 : -1;
}

function refract(v, n, n1, n2) {
	_v = v.copy().normalize();
	_n = n.copy().normalize();
	let = r = n1/n2;
	let c = _v.dot(_n.copy().mult(-1));
	let k = 1 - r*r * (1 - c*c);
	k = k < 0 ? 0 : k;
	return _v.mult(r).add(_n.mult(r*c - sqrt(k)));
}

function reflection_energy(n1, n2, v, n) {
	_v = v.copy().normalize();
	_n = n.copy().normalize();
	th1 = acos(_v.dot(_n));
	th2 = asin(n1/n2 * sin(th1));
	let c1 = n1 * cos(th1);
	let c2 = n2 * cos(th2);
	let R_e = abs((c1 - c2) / (c1 + c2));
	R_s = R_e * R_e;
	c1 = n1 * cos(th2);
	c2 = n2 * cos(th1);
	R_e = abs((c1 - c2) / (c1 + c2));
	R_p = R_e * R_e;
	return (R_s + R_p) * 0.5;
}

function update() {
	background(255);

	// half of the screen rect
	fill(0, 0, 100, 100);
	noStroke();
	rect(0, height * 0.5, width, height);
	
	// angle between the mouse and the center of the screen
	let angle = atan2(mouseY - height * 0.5, mouseX - width * 0.5);

	v_light = createVector(mouseX - x_c, mouseY - y_c);
	v_normal = createVector(0, sign(angle));
	v_reflected = v_light.copy().reflect(createVector(1, 0));
	let n1 = _n1;
	let n2 = _n2;
	if (angle > 0)
		[n1, n2] = [n2, n1]
	v_refracted = refract(v_light.copy().mult(-1), v_normal, n1, n2);
	
	// snells law
	let th1 = acos(v_light.copy().normalize().dot(v_normal.copy().normalize()));
	let th2 = asin(n1/n2 * sin(th1));

	// arc of th1
	fill(0, 100, 0, 100);
	let a1 = angle;
	let a2 = sign(angle) * PI * 0.5;
	if (a2 < a1)
		[a1, a2] = [a2, a1]
	arc(x_c, y_c, small_side*0.5, small_side*0.5, a1, a2);
	
	// light energies
	R_e = reflection_energy(n1, n2, v_light, v_normal)
	if (isNaN(R_e))
		R_e = 1;
	else
	{
		// arc of th2
		fill(0, 100, 0, 100);
		a1 = -sign(angle) * PI * 0.5;
		a2 = atan2(v_refracted.y, v_refracted.x)
		if (a2 < a1)
			[a1, a2] = [a2, a1]
		arc(x_c, y_c, small_side*0.5, small_side*0.5, a1, a2);
	}
	T_e = 1 - R_e;
	
	// draw the normal
	// stroke(255, 0, 0)
	strokeWeight(light_size);
	// line(x_c, y_c, x_c + v_normal.x * large_side, y_c + v_normal.y * large_side);

	// infinite line from the center of the screen to the mouse
	stroke(235, 192, 52)
	line(x_c, y_c, x_c + v_light.x * large_side, y_c + v_light.y * large_side);
	
	// refraction line
	stroke(235, 192, 52, T_e * 255);
	line(x_c, y_c, x_c + v_refracted.x * large_side, y_c + v_refracted.y * large_side);

	// reflection line
	stroke(235, 192, 52, R_e * 255);
	line(x_c, y_c, x_c + v_reflected.x * large_side, y_c + v_reflected.y * large_side);

	// texts
	// text for n1
	textSize(20);
	fill(0);
	noStroke();
	text("N1:", 5, 25);

	// text for n2
	text("N2:", 5, height - 10);

	if (angle > 0){
		text("θ: " + degrees(th1).toFixed(2), 5, height * 0.5 + 40);
		text("θ2: " + degrees(th2).toFixed(2), 5, height * 0.5 - 25);
	}
	else{
		text("θ: " + degrees(th1).toFixed(2), 5, height * 0.5 - 25);
		text("θ2: " + degrees(th2).toFixed(2), 5, height * 0.5 + 40);
	}

}

function setup() {
	frameRate(30);
	createCanvas(window.innerWidth, window.innerHeight);
	x_c = width * 0.5;
	y_c = height * 0.5;
	small_side = min(width, height);
	large_side = max(width, height);
	update();

	// add text input for n1
	input_n1 = createInput(1);
	input_n1.position(38, 8);
	input_n1.size(40);
	input_n1.input(function() {
		let text = input_n1.value();
		if (text.length > 0)
		{
			_n1 = parseFloat(text);
		}
	});

	// add text input for n2
	input_n2 = createInput(1.31);
	input_n2.position(38, height - 27);
	input_n2.size(40);
	input_n2.input(function() {
		let text = input_n2.value();
		if (text.length > 0)
		{
			_n2 = parseFloat(text);
		}
	});
}

function mouseMoved() {
	update();
}

function draw() {
	
}

function windowResized() {
	resizeCanvas(window.innerWidth, window.innerHeight);
	x_c = width * 0.5;
	y_c = height * 0.5;
	small_side = min(width, height);
	large_side = max(width, height);
	input_n2.position(38, height - 27);
}