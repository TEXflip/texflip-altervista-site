
var words = [], loaded = false;
function sketchSetup() {
    var width = window.innerWidth, height = window.innerHeight;
    World.add(world, Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true }));
    ctx = document.getElementById('defaultCanvas0').getContext('2d');
    loaded = true;
}

function draw() {
    background(255);
    Engine.update(engine, 16.666);
    if (loaded)
        for (i in words)
            words[i].show();
}

function mousePressed() {
    words[words.length] = new Word(mouseX, mouseY, parseInt(random(0,26*2+10)));
}

class Word {
    constructor(x, y, index) {
        this.Xoffs = offsets[index][0];
        this.Yoffs = offsets[index][1];
        this.index = index;
        this.V = Vertices.fromPath(displayGlyphData(Indexes[this.index]));
        this.option = {};
        this.body = Bodies.fromVertices(x, y, this.V, this.option, true);
        //myBody.label = unicode;
        World.addBody(world, this.body);
    }

    show() {
        var pos = this.body.position;
        var angle = this.body.angle;

        push();
        translate(pos.x, pos.y);
        rotate(angle);
        image(images[this.index], this.Xoffs, this.Yoffs);
        pop();
        /*for (i in this.body.vertices) {
            ctx.beginPath();
            ctx.ellipse(this.body.vertices[i].x, this.body.vertices[i].y, 3, 3, 45 * PI / 180, 0, 2 * PI);
            ctx.stroke();
            //ellipse(this.body.vertices[i].x-pos.x,this.body.vertices[i].y-pos.y,5,5);
        }*/
    }
}