const CANVAS_WIDTH = 720
const CANVAS_HEIGHT = 576
const SCALE_FACTOR = 0.25
const FPS = 60
const SPEED_VALUE = 0.25
const speed = { x: SPEED_VALUE, y: SPEED_VALUE }

let img
let position
let img_width
let img_ratio
let img_height
let last_sample = 0

const update_tint = () => {
    let curr_sample = Math.floor(Math.random() * 16)
    if (curr_sample === last_sample)
        curr_sample += 2;
    tint(curr_sample, 16, 16)
    last_sample = curr_sample
}

function preload() {
    img = loadImage('pellad_trasparente.png')
    img_ratio = img.width / img.height
}

function update_dvd() {
    position = { x: width / 2, y: height / 2 }
    shorter_side = Math.min(width, height)
    img_width = img_ratio * shorter_side * SCALE_FACTOR
    img_height = img_width / img_ratio
}

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    colorMode(HSB, 16)
    frameRate(FPS)
    update_dvd()
}

function draw() {
    background('#0c0c0c')
    smooth();
    image(img, position.x, position.y, img_width, img_height)
    if (position.x <= 0) {
        speed.x = SPEED_VALUE
        update_tint()
    }
    if (position.y <= 0) {
        speed.y = SPEED_VALUE
        update_tint()
    }
    if (position.x + img_width >= width) {
        speed.x = -SPEED_VALUE
        update_tint()
    }
    if (position.y + img_height >= height) {
        speed.y = -SPEED_VALUE
        update_tint()
    }

    dt = min(deltaTime, 2000 / FPS);

    position.x += speed.x * dt;
    position.y += speed.y * dt;
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    update_dvd()
}