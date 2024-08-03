let MAX_Z = 300, MIN_Z = 110;
let orb_con_sensitivity = 2

function index_to_uv(idx) {
    return [idx % 17, Math.floor(idx / 17)];
}


function preload() {
    world = loadModel('objs/world.obj');
}


function setup() {
    createCanvas(window.innerWidth, window.innerHeight, WEBGL);
    background(255);
    noStroke();
    img = createImage(17, 16);
    img.loadPixels();
    s_base = 69;
    l_base = 38;
    for (let i = 0; i < img.width; i++) {
        for (let j = 0; j < img.height; j++) {
            rand_s = random(0, 16);
            rand_l = random(0, 16);
            s = s_base + (rand_s - 8);
            l = l_base + (rand_l - 8);
            img.set(i, j, color("hsl(118, "+s+"%, "+l+"%)"));
        }
    }
    uv = index_to_uv(110);
    img.set(uv[1], uv[0], color(255, 255, 255));
    img.updatePixels();
    sea_tex = createGraphics(17, 16);
    sea_tex.background(color(51, 150, 255));
    cam = createCamera();
    cam.setPosition(0, 0, 150);
    cam.lookAt(0, 0, 0);
    cam.perspective(HALF_PI * 0.5, width / height, 0, 1000);
    setCamera(cam);
    // strokeWeight(0.1);
    // debugMode();
}


function draw() {

    background(255);
    ambientLight(255, 246, 224);
    directionalLight(255, 246, 224, 0, 1);
    orbitControl(orb_con_sensitivity, orb_con_sensitivity, 1);
    texture(sea_tex);
    sphere(98.3)
    texture(img);
    rotateX(HALF_PI);
    scale(-100, 100, 100);
    model(world);

    cam_dist = dist(cam.eyeX, cam.eyeY, cam.eyeZ, 0, 0, 0);
    if (cam_dist > MAX_Z) {
        cam_vec = createVector(cam.eyeX, cam.eyeY, cam.eyeZ).normalize().mult(MAX_Z-1);
        cam.setPosition(cam_vec.x, cam_vec.y, cam_vec.z);
        cam.lookAt(0, 0, 0);
    }
    if (cam_dist < MIN_Z) {
        cam_vec = createVector(cam.eyeX, cam.eyeY, cam.eyeZ).normalize().mult(MIN_Z+1);
        cam.setPosition(cam_vec.x, cam_vec.y, cam_vec.z);
        cam.lookAt(0, 0, 0);
    }
    orb_con_sensitivity = map(cam_dist, MIN_Z, MAX_Z, 0.5, 5);
}