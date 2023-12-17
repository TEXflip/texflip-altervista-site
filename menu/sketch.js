var phrases = [], AllNotStatic = true;
var sx_old = window.screenX;
var sy_old = window.screenY;
document.title = title;

function draw() {
    renderMyBackground()

    sx_d = window.screenX - sx_old;
    sy_d = window.screenY - sy_old;
    sx_old = window.screenX;
    sy_old = window.screenY;
    screen_vec = Vector.create(sx_d * deltaTime, sy_d * deltaTime);
    if (Matter.Vector.magnitude(screen_vec) > 1000)
        screen_vec = Vector.mult(Vector.normalise(screen_vec), 1000);

    if (Matter.Vector.magnitude(screen_vec) > 1)
        for (const comp of world.composites) {
            Matter.Body.applyForce(comp.bodies[0], comp.bodies[0].position, Vector.mult(screen_vec, -0.000013))
        }
    for (var i = 0; i < words.length; i++) {
        words[i].show();
    }
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    createTitle(title);
}


function createTitle(string) {
    let maxWidth = 1080, baseX, fontSize;
    if (maxWidth > width) {
        fontSize = width / (string.length + 1);
        baseX = fontSize;
    }
    else {
        fontSize = maxWidth / (string.length + 2);
        baseX = (width - fontSize * (string.length - 1)) / 2;
    }
    let c = 0;
    for (let i = 0; i < string.length; i++) {
        if (string[i] == ' ')
            continue;
        if (words.length > c)
            words[c].change(baseX + fontSize * i, 100, string[i], fontSize);
        else
            words.push(new PhysicChar(baseX + fontSize * i, 100, string[i], fontSize, false));
        c++;
    }
    while (words.length > c) {
        words.pop().del();
    }
}

function computeWave(i, f) {
    return Math.sin(i / 10 + f / 100) * 12 +
        Math.sin(i / 30 + f / 50) * 10 +
        Math.sin(i / 20 - f / 45) * 10 +
        noise(f / 60 - i * 0.1) * 10 +
        noise(f / 60 + i * 0.1) * 10;
}

function renderMyBackground() {
    background(255, 191, 0);
    let boatPos = 180, xBoat, yBoat, imgRes = 166, res = 200,
        p1 = boatPos - parseInt(30 * res / width),
        p2 = boatPos + parseInt(30 * res / width),
        x1 = p1 * width / res,
        x2 = p2 * width / res,
        y1 = computeWave(p1, frameCount),
        y2 = computeWave(p2, frameCount);

    push();
    yBoat = (y2 + y1) / 2 + 400;
    xBoat = (x2 + x1) / 2;
    tint(30)
    translate(xBoat, yBoat - imgRes / 4);
    rotate(Math.atan((y2 - y1) / (x2 - x1)));
    image(boatImg, 0, 0, imgRes / 2, imgRes / 2);
    pop();

    beginShape();
    fill(100, 100, 255)
    for (let i = 0; i <= res; i++) {
        let y = computeWave(i, frameCount);
        vertex(i * width / res, y + 400);
    }
    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);
    fill(30);
}

class PhysicChar {

    constructor(x, y, char, fontDimension, IsStatic = false) {
        this.x = x;
        this.y = y;
        this.char = char;
        this.fontDimension = fontDimension;

        this.updateProps();

        this.option = { collisionFilter: { group: 0, category: 1, mask: -1 }, frictionAir: 0.001, density: 0.0005 };
        this.body = Matter.Bodies.fromVertices(this.x, this.ropePos.y + this.length, this.V, this.option, true);
        Matter.Body.setMass(this.body, 0.8);
        Matter.Body.setInertia(this.body, 300);

        this.lastConstraint = MatterSprings.Spring.create({
            pointA: this.ropePos,
            bodyB: this.body,
            pointB: { x: 0, y: this.YanchorOffs },
            length: this.length,
            stiffness: 20,
            damping: 0.2
        })
        world.plugin.springs.push(this.lastConstraint)
        this.composite = Matter.Composite.add(Matter.Composite.create(), [this.body, this.lastConstraint])
        Matter.World.add(world, this.composite)

        this.body.isStatic = IsStatic;
        this.precAngle = 0;
        this.angleVel = 0;
        this.precAngleVel = 0;
    }

    del() {
        Matter.Composite.remove(world, this.composite);
        Matter.World.remove(world, this.composite);
    }

    change(x, y, char, fontDimension) {
        this.x = x;
        this.y = y;
        this.char = char;
        this.fontDimension = fontDimension;
        this.updateProps();
        let bcopy = this.body;
        this.body = Matter.Bodies.fromVertices(bcopy.position.x, bcopy.position.y, this.V, this.option, true);
        Matter.Body.setMass(this.body, bcopy.mass);
        Matter.Body.setInertia(this.body, bcopy.inertia);
        Matter.Body.setAngle(this.body, bcopy.angle);
        Matter.Body.setAngularVelocity(this.body, bcopy.angularVelocity);
        Matter.Body.setVelocity(this.body, bcopy.velocity);
        this.lastConstraint.length = this.length;
        this.lastConstraint.pointA = this.ropePos;
        this.lastConstraint.pointB = { x: 0, y: this.YanchorOffs };
        this.lastConstraint.bodyB = this.body;
        Matter.Composite.remove(world, this.composite);
        Matter.World.remove(world, this.composite);
        this.composite = Matter.Composite.add(Matter.Composite.create(), [this.body, this.lastConstraint])
        Matter.World.add(world, this.composite);
    }

    updateProps() {
        let char_index = char_to_font_idx[this.char];
        if (char_index == undefined)
            char_index = char_to_font_idx["?"];

        const path = glyphToMatterPath(char_index, this.fontDimension)
        this.V = Matter.Vertices.fromPath(path);
        this.mass_center = Matter.Vertices.centre(this.V);
        for (let i = 0; i < this.V.length; i++) {
            let are_intersecting = intersects(this.V[i].x, this.V[i].y, this.V[(i + 1) % this.V.length].x, this.V[(i + 1) % this.V.length].y, this.mass_center.x, this.mass_center.y, this.mass_center.x, this.mass_center.y - 1000);
            if (are_intersecting) {
                this.YanchorOffs = this.V[i].y - this.mass_center.y;
                break;
            }
        }
        this.ropePos = { x: this.x, y: this.y + this.mass_center.y + this.YanchorOffs + (this.fontDimension * 1.667 - 83.333) };

        // this.length = this.fontDimension * 2.667 - 33.3;
        this.length = this.fontDimension + 45;
    }

    show() {
        // Rendering The Char
        var pos = this.body.position;
        if (pos.y > 400)
            this.body.frictionAir = 0.1;
        else
            this.body.frictionAir = 0.001;
        var angle = this.body.angle;
        this.angleVel = this.precAngle - angle;
        this.precAngle = angle;
        // if (Math.abs(this.angleVel) > 1.8 && this.precAngleVel * this.angleVel > 0)
        //     console.log("☄️Playing Shooting Stars Meme...🌌");
        this.precAngleVel = this.angleVel;
        fill(30)
        push();
        translate(pos.x, pos.y);
        rotate(angle);
        textSize(this.fontDimension);
        text(this.char, -this.mass_center.x, -this.mass_center.y);
        // fill(255);
        // textSize(8);
        // for (let i = 0; i < this.V.length; i++) {
        //     text(i, this.V[i].x - this.mass_center.x, this.V[i].y - this.mass_center.y);
        // }
        pop();

        // Rendering the spring
        fill(120)
        circle(this.ropePos.x, this.ropePos.y, this.fontDimension / 6 - 0.333);
        noFill();
        stroke(100);
        strokeWeight(this.fontDimension / 15);
        beginShape();
        curveVertex(this.ropePos.x, this.ropePos.y)
        curveVertex(this.ropePos.x, this.ropePos.y)
        let prec = { x: this.ropePos.x, y: this.ropePos.y };

        let nDiv = 33
        let ps = Vsum(pos, Vrotate(this.lastConstraint.pointB, angle));
        let final = { x: ps.x, y: ps.y };
        let off = Vmin(final, prec)
        let perp = perpendicular(off);

        let s = Vdiv(off, nDiv)
        for (let j = 1; j <= nDiv; j++) {
            let sign = j % 2 == 0 ? 1 : -1;
            let out = Vsum(Vmult(s, j), Vmult(perp, sign * (this.fontDimension * 0.15 - 0.667)));
            out = Vsum(out, prec);
            curveVertex(out.x, out.y);
        }
        curveVertex(final.x, final.y);
        curveVertex(final.x, final.y);
        endShape();
        fill(120);
        noStroke();
        strokeWeight(0);
        circle(final.x, final.y, this.fontDimension / 6 - 1.333);
        fill(0);
    }

    isOffScreen() {
        var pos = this.body.position;
        return (pos.x < -50 || pos.x > window.innerWidth + 50 || pos.y > window.innerHeight + 50);
    }
}

function intersects(a,b,c,d,p,q,r,s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
  };