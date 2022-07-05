
var Xwin, Ywin;
var fr = 30;
var scl = 20, inc = 0.1;
var cols, rows;

var particles = [];
var flowfield;

function setup() {
    cols = floor(window.innerWidth / scl);
    rows = floor(window.innerHeight / scl);
    Xwin = cols * scl;
    Ywin = rows * scl;
    createCanvas(cols * scl, rows * scl, P2D);
	frameRate(fr);
    flowfield = new Array(rows * cols);
    for(var i = 0; i < 10000; i++){
        particles[i] = new Particle();
    }
}

var zoff = 0;

function draw() {
    var yoff = 0;
    for(var y = 0; y < rows; y++){
        var xoff = 0;
        for(var x = 0; x < cols; x++){
            var index = x + y * cols;
            var angle = noise(xoff, yoff, zoff) * TWO_PI;
            var v = p5.Vector.fromAngle(angle);
            flowfield[index] = v;
            xoff += inc;
        }
        yoff += inc;
        zoff += 0.0003
    }

    for(i in particles){
        particles[i].follow(flowfield);
        particles[i].update();
        particles[i].show();
        particles[i].edges();
    }
}