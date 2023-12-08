var phrases = [], AllNotStatic = true;

function draw() {
    renderMyBackground()
    Matter.Engine.update(engine, 16.666);
    if (loaded) {
        for (var i = 0; i < words.length; i++) {
            words[i].show();
        }
    }
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    createTitle("The Weird World of Tex");
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
    if (words.length == 0)
        for (let i = 0; i < string.length; i++) {
            if (string[i] == ' ')
                continue;
            words.push(new Word2(baseX + fontSize * i, 100, string[i], fontSize, false));
        }
    else
        for (let i = 0, c = 0; i < string.length; i++) {
            if (string[i] == ' ')
                continue;
            words[c].changePos(baseX + fontSize * i, 100, fontSize);
            c++
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

class Word2 {
    LP = LetterProperties;

    constructor(x, y, char, fontDimension, IsStatic = false) {
        this.x = x;
        this.y = y;
        this.char = char;
        this.ropeLength = 10;
        this.IsStatic = IsStatic;
        this.fontDimension = fontDimension;

        this.updateProps();

        this.option = { collisionFilter: { group: 0, category: 1, mask: -1 }, frictionAir: 0.001, density: 0.0005 };
        this.body = Matter.Bodies.fromVertices(this.x, this.y, this.V, this.option, true);
        Matter.Body.setMass(this.body, 0.8);
        Matter.Body.setInertia(this.body, 300);
        // this.body.mass = 1

        this.lastConstraint = MatterSprings.Spring.create({
            pointA: this.ropePos,
            bodyB: this.body,
            pointB: { x: this.XanchorOffs, y: this.YanchorOffs },
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

    changePos(x, y, fontDimension) {
        this.x = x;
        this.y = y;
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
        this.lastConstraint.pointB = { x: this.XanchorOffs, y: this.YanchorOffs };
        this.lastConstraint.bodyB = this.body;
        Matter.Composite.remove(world, this.composite);
        Matter.World.remove(world, this.composite);
        this.composite = Matter.Composite.add(Matter.Composite.create(), [this.body, this.lastConstraint])
        Matter.World.add(world, this.composite);
    }

    updateProps() {
        this.Xoffs = this.LP[this.char].offset[0] * (this.fontDimension / 100);
        this.Yoffs = this.LP[this.char].offset[1] * (this.fontDimension / 100);
        this.XanchorOffs = this.LP[this.char].anchorOffset[0] * (this.fontDimension / 100);
        this.YanchorOffs = this.LP[this.char].anchorOffset[1] * (this.fontDimension / 100);
        this.heighCorrection = this.LP[this.char].heighCorrection * (this.fontDimension / 100);

        this.ropePos = { x: this.x, y: this.y - this.Yoffs + this.YanchorOffs + this.heighCorrection + (this.fontDimension * 1.667 - 83.333) };
        this.V = Matter.Vertices.fromPath(displayGlyphData(this.LP[this.char].index, this.fontDimension));

        this.length = this.fontDimension * 2.667 - 33.3;
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
        text(this.char, this.Xoffs, this.Yoffs);
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

class Word {
    constructor(x, y, char, fontDimension, IsStatic = false) {
        let LP = LetterProperties;

        this.ropeLength = 10;
        this.fontDimension = fontDimension;
        this.IsStatic = IsStatic;

        this.Xoffs = LP[char].offset[0] * (fontDimension / 100);
        this.Yoffs = LP[char].offset[1] * (fontDimension / 100);
        this.XanchorOffs = LP[char].anchorOffset[0] * (fontDimension / 100);
        this.YanchorOffs = LP[char].anchorOffset[1] * (fontDimension / 100);
        this.heighCorrection = LP[char].heighCorrection * (fontDimension / 100);

        this.ropePos = { x: x, y: y - this.Yoffs + this.YanchorOffs + this.heighCorrection };
        this.char = char;
        this.V = Matter.Vertices.fromPath(displayGlyphData(LP[char].index, this.fontDimension));
        let option = { collisionFilter: { group: 0, category: 1, mask: -1 }, frictionAir: 0.0005, density: 0.0001 };
        this.body = Matter.Bodies.fromVertices(x, y, this.V, option, true);

        var radius = this.radius = 3;
        var damp = 0., stiff = 0.1;
        this.rope = Matter.Composites.stack(this.ropePos.x, this.ropePos.y, 1, 1, 10, 10, function (x, y) {
            return Matter.Bodies.circle(x, y, radius, { collisionFilter: { group: -1, category: 2, mask: 0 } });
        });
        Matter.Composites.chain(this.rope, 0.5, 0, -0.5, 0, { stiffness: stiff, damping: damp, length: 2, render: { type: 'line' }, density: 0.0, frictionAir: 0.0 });

        this.composite = Matter.Composite.addConstraint(this.rope, Constraint.create({
            pointA: this.ropePos,
            bodyB: this.rope.bodies[0],
            pointB: { x: -this.radius, y: 0 },
            length: this.ropeLength,
            stiffness: stiff,
            damping: damp
        }))

        this.lastConstraint = Constraint.create({
            pointA: { x: this.radius, y: 0 },
            bodyA: this.rope.bodies[this.rope.bodies.length - 1],
            bodyB: this.body,
            pointB: { x: this.XanchorOffs, y: this.YanchorOffs },
            length: this.ropeLength,
            stiffness: stiff,
            damping: damp
        });
        this.composite = Matter.Composite.add(this.composite, [this.body, this.lastConstraint])
        Matter.World.add(world, this.composite)
        this.body.isStatic = IsStatic;
    }

    show() {
        // Rendering The Char
        var pos = this.body.position;
        var angle = this.body.angle;
        push();
        translate(pos.x, pos.y);
        rotate(angle);
        textSize(this.fontDimension);
        text(this.char, this.Xoffs, this.Yoffs);
        pop();

        // Rendering the spring
        fill(120)
        circle(this.ropePos.x, this.ropePos.y, 8);
        noFill();
        stroke(100);
        strokeWeight(3);
        beginShape();
        curveVertex(this.ropePos.x, this.ropePos.y)
        curveVertex(this.ropePos.x, this.ropePos.y)
        let prec = { x: this.ropePos.x, y: this.ropePos.y };
        let l = this.rope.bodies.length;
        let nDiv = 6
        for (let i = 0; i < l - 1; i++) {
            const Bpos = this.rope.bodies[i].position;
            let off = Vmin(Bpos, prec)
            let perp = perpendicular(off);

            let s = Vdiv(off, nDiv)
            for (let j = i == 0 ? 1 : 0; j < nDiv; j++) {
                let sign = j % 2 == 0 ? 1 : -1;
                let out = Vsum(Vmult(s, j), Vmult(perp, sign * 4));
                out = Vsum(out, prec);
                curveVertex(out.x, out.y);
            }

            prec = { x: Bpos.x, y: Bpos.y };
        }
        let final = { x: pos.x + this.lastConstraint.pointB.x, y: pos.y + this.lastConstraint.pointB.y };
        let off = Vmin(prec, final)
        let perp = perpendicular(off);

        let s = Vdiv(off, nDiv)
        for (let j = 0; j <= nDiv; j++) {
            let sign = j % 2 == 1 ? 1 : -1;
            let out = Vsum(Vmult(s, -j), Vmult(perp, sign * 4));
            out = Vsum(out, prec);
            curveVertex(out.x, out.y);
        }
        curveVertex(final.x, final.y);
        endShape();
        fill(120);
        noStroke();
        strokeWeight(0);
        circle(final.x, final.y, 7);
        fill(0);
    }

    isOffScreen() {
        var pos = this.body.position;
        return (pos.x < -50 || pos.x > window.innerWidth + 50 || pos.y > window.innerHeight + 50);
    }
}