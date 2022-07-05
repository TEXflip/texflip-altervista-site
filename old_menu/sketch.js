var phrases = [], AllNotStatic = true;
function setAllWords() {
    XwordPos = window.innerWidth / 3;
    phrases.push(new Phrase(XwordPos, 50, "Pagine:", FONT_DIM, true));
    phrases.push(new Phrase(XwordPos, 100, "Snek The Snak", FONT_DIM, true,"Snek_The_Snak"));
    phrases.push(new Phrase(XwordPos, 150, "The Reverser", FONT_DIM, true,"ReverceVoice"));
    phrases.push(new Phrase(XwordPos, 200, "Julia Set", FONT_DIM, true,"JuliaSet"));
    phrases.push(new Phrase(XwordPos, 250, "Labyrinth", FONT_DIM, true,"labirinto"));
    phrases.push(new Phrase(XwordPos, 300, "Plinko", FONT_DIM, true,"Plinko"));
    phrases.push(new Phrase(XwordPos, 350, "Random Distance Random Unit", FONT_DIM, true,"RDRU"));
    phrases.push(new Phrase(XwordPos, 400, "Music Effect", FONT_DIM, true,"MusicEffect"));
    phrases.push(new Phrase(XwordPos, 450, "Pokemon Catch Probability Calculator", FONT_DIM, true,"Prob_Catt_Pokemon/index.html"));
    loaded = true;
}

function draw() {
    background(255, 191, 0);
    Engine.update(engine, 16.666);
    if (loaded) {
        for (var i = 0; i < words.length; i++) {
            words[i].show();
            if (words[i].isOffScreen()) {
                World.remove(world, words[i].body);
                words.splice(i, 1);
                i--;
            }
        }
        //ellipse(phrases[3].phrase[phrases[3].phrase.length - 1].x + phrases[3].fontDimension / 2, phrases[3].y-phrases[3].fontDimension, 5, 5);
    }
}

function mousePressed() {
    //words.push(new Word(mouseX, mouseY, parseInt(random(0, 26 * 2 + 11)), FONT_DIM));
    for (var i = 1; i < world.bodies.length; i++) {
        var b = world.bodies[i];
        Matter.Body.setStatic(b, false);
        var v = Vector.create((b.position.x - mouseX), (b.position.y - mouseY));
        var leng = Math.pow(3, -Vector.magnitude(v) / (FONT_DIM * 1.2));
        var n = Vector.normalise(v);
        Matter.Body.applyForce(b, b.position, Vector.mult(n, leng));
    }
    for (i in phrases) {
        if (phrases[i].isClicked() && AllNotStatic)
            phrases[i].goToLink();
    }
    AllNotStatic = false;
}

function newPhisicWord(x, y, Char, fontDimension, IsStatic = false) {
    words.push(new Word(x, y, fromStringToInt[Char], fontDimension, IsStatic));
    return words[words.length - 1];
}

class Phrase {
    constructor(x, y, Stringa, fontDimension, IsStatic = false, Link = null) {
        this.x = x; this.y = y; this.fontDimension = fontDimension; this.IsStatic = IsStatic; this.Link = Link;
        this.phrase = []; this.chars = Stringa.split('');
        for (var i = 0; i < this.chars.length; i++) {
            if (this.chars[i] == " ")
                i++;
            else if (this.chars[i] == "l" || this.chars[i].toLowerCase() == "i" || this.chars[i] == "r" || this.chars[i] == ":")
                x -= fontDimension / 2;
            else if (this.chars[i] == "h" || this.chars[i] == "t" || this.chars[i] == "o" || this.chars[i] == "u" || this.chars[i] == "k")
                x -= fontDimension / 7;
            this.phrase[i] = newPhisicWord(x + fontDimension * i + offsets[fromStringToInt[this.chars[i]]][0] * (fontDimension / 100), y - offsets[fromStringToInt[this.chars[i]]][1] * (fontDimension / 100), this.chars[i], fontDimension, IsStatic);
        }
    }
    isClicked() {
        return (mouseX > this.x - this.fontDimension && mouseX < this.phrase[this.phrase.length - 1].x + this.fontDimension / 2 && mouseY < this.y && mouseY > this.y - this.fontDimension);
    }
    goToLink() {
        if (this.Link != null) {
            var link = this.Link;
            setTimeout(function () { window.location.href = "https://"+window.location.hostname+"/"+link; }, waitTime);
        }
    }
}

class Word {
    constructor(x, y, index, fontDimension, IsStatic = false) {
        this.x = x;
        this.fontDimension = fontDimension;
        this.IsStatic = IsStatic;
        this.Xoffs = offsets[index][0] * (fontDimension / 100);
        this.Yoffs = offsets[index][1] * (fontDimension / 100);
        this.index = index;
        this.V = Vertices.fromPath(displayGlyphData(Indexes[this.index], this.fontDimension));
        this.option = {};
        this.body = Bodies.fromVertices(x, y, this.V, this.option, true);
        World.addBody(world, this.body);
        this.body.isStatic = IsStatic;
        /*this.body.mass = 4;
        this.body.inverseMass = 1 / this.body.mass;*/
    }

    show() {
        var pos = this.body.position;
        var angle = this.body.angle;
        //for (i in this.body.vertices) ellipse(this.body.vertices[i].x, this.body.vertices[i].y, 3, 3);
        push();
        translate(pos.x, pos.y);
        rotate(angle);
        textSize(this.fontDimension);
        text(CharsToDraw[this.index], this.Xoffs, this.Yoffs);
        pop();

    }

    isOffScreen() {
        var pos = this.body.position;
        return (pos.x < -50 || pos.x > window.innerWidth + 50 || pos.y > window.innerHeight + 50);
    }
}