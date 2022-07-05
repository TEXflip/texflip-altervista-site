let base = { x: 250, y: 250 };
let precPx = 100, precPy = 100;
let l1 = 150, l2 = 200, sign = 1;
let angle1 = 0, angle2 = 0, swiched = false, precAngle1d = 0;
let Kp = 0.05;

function setup() {
    createCanvas(innerWidth, innerHeight);
    base.x = width / 2;
    base.y = height / 2;
    let minDim = min(innerWidth, innerHeight)
    l2 = minDim/4;
    l1 = l2*0.8;
    strokeWeight(3);
    strokeJoin(ROUND);
    strokeCap(ROUND);
    noStroke();
    frameRate(60)
}

function windowResized(){
    resizeCanvas(innerWidth, innerHeight);
    base.x = width / 2;
    base.y = height / 2;
    let minDim = min(innerWidth, innerHeight)
    l2 = minDim/4;
    l1 = l2*0.8;
}

function angleMod(a) {
    if (a > PI)
        return a - (2 * PI) * (1 + Math.floor(a / (2 * PI)));
    if (a < -PI)
        return a + (2 * PI) * (1 + Math.floor(-a / (2 * PI)));
    else
        return a;
}

function draw() {
    let Px = mouseX - base.x
    let Py = mouseY - base.y
    let mouseDist = Px * Px + Py * Py;
    if (mouseDist >= (l1 + l2) * (l1 + l2) || mouseDist < (l1 - l2) * (l1 - l2)) {
        let a = atan2(Py, Px)
        if (mouseDist >= (l1 + l2) * (l1 + l2)) {
            Px = cos(a) * (l1 + l2 - 0.01)
            Py = sin(a) * (l1 + l2 - 0.01)
            if (!swiched) {
                sign *= -1;
                swiched = true;
            }
        }
        else{
            Px = cos(a) * (abs(l1 - l2) + 0.01)
            Py = sin(a) * (abs(l1 - l2) + 0.01)
        }
    }
    else
        swiched = false;
    let c2 = (Px * Px + Py * Py - (l1 * l1) - (l2 * l2)) / (2 * l1 * l2)
    let s2 = sign * sqrt(1 - c2 * c2)
    let angle1d = atan2(Py, Px) - atan2(l2 * s2, l1 + l2 * c2)
    let angle2d = atan2(s2, c2)
    angle1d = angleMod(angle1d)
    angle1 = angleMod(angle1)
    angle1 += Kp * angleMod(angle1d - angle1)
    angle2 += Kp * (angle2d - angle2)


    background(20)
    applyMatrix(1, 0, 0, 1, base.x, base.y)
    fill(30,25,25)
    ellipse(0, 0, (l1+l2)*2, (l1+l2)*2)
    fill(20)
    ellipse(0, 0, abs(l1-l2)*2, abs(l1-l2)*2)
    fill(0, 128, 190)
    ellipse(0, 0, 30, 30)
    applyMatrix(cos(angle1), sin(angle1), -sin(angle1), cos(angle1), 10 * sin(angle1), -10 * cos(angle1))
    beginShape()
    vertex(11, 20)
    vertex(l1, 20)
    vertex(l1, 0)
    vertex(11, 0)
    endShape()
    stroke(60)
    applyMatrix(1, 0, 0, 1, l1, 10)
    ellipse(0, 0, 30, 30)
    applyMatrix(cos(angle2), sin(angle2), -sin(angle2), cos(angle2), 10 * sin(angle2), -10 * cos(angle2))

    beginShape()
    vertex(11, 20)
    vertex(l2 - 15, 20)
    // bezierVertex(l2+2,20,l2+2,0,l2-13,0)
    vertex(l2 - 15, 0)
    vertex(11, 0)
    endShape()
    fill(150, 150, 255)
    beginShape()
    vertex(l2 - 13, 20)
    bezierVertex(l2 + 2, 20, l2 + 2, 0, l2 - 13, 0)
    endShape()
    // rect(0, 0, l2, 20)
    precPx = Px
    precPy = Py
    precAngle1d = angle1d
}

function mousePressed() {
    Kp = 0.3;
}
function mouseReleased() {
    Kp = 0.05;
}
function mouseWheel(event){
    let wheel = event.delta > 0 ? 1 : -1;
    l1 -= wheel*5;
    if (l1 < 1)
        l1 = 1;
}