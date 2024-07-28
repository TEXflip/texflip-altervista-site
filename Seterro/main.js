function preload() {
    world = loadModel('objs/world.obj', true);
}


function setup() {
    createCanvas(window.innerWidth, window.innerHeight, WEBGL);
    background(255);
    noStroke();
}



function draw() {
    background(255);
    ambientLight(255, 246, 224);
    directionalLight(255, 246, 224, 0, 1);
    // directionalLight(200, 200, 0, 0, 1);
    // rotateX(frameCount * 0.01);
    orbitControl(10,10,2);
    // sphere(99)
    ambientMaterial(35, 166, 30);
    rotateX(PI);
    scale(-1,1,1);
    model(world);
}