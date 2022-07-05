function Vsum(v1, v2) {
	return { x: v1.x + v2.x, y: v1.y + v2.y };
}
function Vmin(v1, v2) {
	return { x: v1.x - v2.x, y: v1.y - v2.y };
}
function Vmult(v1, s) {
	return { x: v1.x * s, y: v1.y * s };
}
function Vdiv(v1, s) {
	return { x: v1.x / s, y: v1.y / s };
}

function Vnorm(v) {
	let magn = Math.sqrt(out.y * out.y + out.x * out.x);
	return Vdiv(out, magn);
}

function perpendicular(v) {
	let out = { x: 0, y: 0 };
	const angle = Math.PI / 2;
	const c = Math.cos(angle);
	const s = Math.sin(angle);

	out.x = c * v.x - s * v.y;
	out.y = c * v.y + s * v.x;

	return Vdiv(out, Math.sqrt(out.y * out.y + out.x * out.x));
}

function Vrotate(v, angle = Math.PI / 2) {
	let out = { x: 0, y: 0 };
	const c = Math.cos(angle);
	const s = Math.sin(angle);

	out.x = c * v.x - s * v.y;
	out.y = c * v.y + s * v.x;

	return out;
}