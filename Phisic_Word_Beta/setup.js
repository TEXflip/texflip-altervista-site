var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Coposite = Matter.Composite,
    Vertices = Matter.Vertices,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse;
var render, world, engine;
var fontFileName = "Fipps-Regular.otf";//"node_modules/opentype.js-master/fonts/Roboto-Black.ttf";
var wordScale = 0.05,
    CharsToDraw = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    Indexes = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
var offsets = [[0,13],[0,14],[0,14],[0,14],[0,14],[2,17],[-1,14],[0,14],[0,14],[-4,10],[0,14],[4,10],[0,15],[0,14],[0,14],[4,19],[-1,12],[0.5,14],[-1,14],[-1,20],[0,15],[0,17],[-1,14],[-0.5,15],[0,19],[-0.5,15],[-3,7.5],[3,12],[-1,7.5],[-3,11],[-1,7.5],[-1,16],[-0.5,-1],[1.5,11],[0,14],[1,5],[1,12.5],[0,14],[0,8],[0,8],[0,8],[3.5,3],[-4,2],[3,9],[0,8.3],[-2,14],[-1,8],[0,11],[0,9],[0,8],[-1,0],[0,8],[0,15],[-3,15],[0,14],[0,15],[-3,18],[1,16],[1,14],[3,19],[0,15],[-1,15]];
var ctx = null, Thecanvas, images = [];

function preload() {
    for (var i = 0; i < CharsToDraw.length; i++) {
        images[i] = loadImage("assets/" + CharsToDraw[i] + "-" + i + ".png");
    }
}

function setup() {
    var width = window.innerWidth, height = window.innerHeight;
    createCanvas(width, height);
    Thecanvas = document.getElementById('defaultCanvas0');
    engine = Engine.create();
    world = engine.world;
    Engine.run(engine);
    imageMode(CENTER);

    opentype.load(fontFileName, function (err, font) {
        var amount, glyph, x, y, fontSize;
        if (err) {
            console.log("font not loaded");
            showErrorMessage(err.toString());
            return;
        }
        textFont(font);
        onFontLoaded(font);
        sketchSetup();
    });
}
function createRender() {
    render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight
        }
    });
    Render.run(render);
}