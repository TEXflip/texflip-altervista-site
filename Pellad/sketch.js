let scroll = 400, svg, Paths = [], InPaths = [];

function setup() {
	noCanvas();
	svg = document.getElementById("pellad");
	Paths[0] = document.getElementById("P");
	Paths[1] = document.getElementById("E");
	Paths[2] = document.getElementById("L1");
	Paths[3] = document.getElementById("L2");
	Paths[4] = document.getElementById("A");
	Paths[5] = document.getElementById("D");
	for (const p of Paths) {
		InPaths.push(p.getAttribute("d").slice(0));
	}
	let riem = document.getElementById("riempitore");

	let finalHeight = Math.max(window.innerHeight - svg.clientHeight / 2, window.innerHeight / 2)
	riem.style["height"] = finalHeight.toString() + "px";

	document.body.addEventListener("mouseover", onHover);
}

function onHover(e) {
	if (e.target.tagName == "path")
		for (const p of Paths) {
			p.style.fill = "#ffffff";
			document.body.style["background-color"] = "#0b0b0b";
			document.body.style["color"] = "#ffffff";
		}
	else
		for (const p of Paths) {
			p.style.fill = "#0b0b0b"
			document.body.style["background-color"] = "#ffffff"
			document.body.style["color"] = "#0b0b0b"
		}
}

function draw() {
	win_height = document.documentElement.scrollHeight;
	window_position_wrt_viewport = window.scrollY + window.innerHeight;
	if (window_position_wrt_viewport > win_height - 700) {
		let h = getHeightViewBox();
		setHeightViewBox(h * 1.1);
		setLength(h * 1.1);
	}
}



function setHeightViewBox(h) {
	svg.setAttribute("viewBox", "0 0 1275.6 " + h);
}

function getHeightViewBox() {
	return svg.getAttribute("viewBox").split(" ")[3];
}

function setLength(length) {
	for (let k = 0; k < Paths.length; k++) {
		let arr = InPaths[k].split(" ");
		let currCommand = null, nCommand = 0;
		for (let i = 0; i < arr.length; i++) {
			if (isNaN(arr[i])) { currCommand = arr[i]; nCommand = 0 }
			else nCommand++;
			if (parseInt(arr[i]) >= 1000 && currCommand != "H" && (currCommand == "V" || ((currCommand == "S" || currCommand == "C" || currCommand == "M" || currCommand == "L") && nCommand % 2 == 0)))
				arr[i] = length;
		}
		Paths[k].setAttribute("d", arr.join(" "));
	}
}