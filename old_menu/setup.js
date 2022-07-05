var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Coposite = Matter.Composite,
    Vertices = Matter.Vertices,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse;
Vector = Matter.Vector;
var render, world, engine;
var fontFileName = "Fipps-Regular.otf";//"node_modules/opentype.js-master/fonts/Roboto-Black.ttf";
var FONT_DIM = 30;
var waitTime = 5000;
var wordScale = FONT_DIM * 0.001,
    CharsToDraw = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":"],
    Indexes = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    offsets = [[-51, 60], [-49, 61], [-50, 62], [-49, 61], [-43.5, 62], [-40, 68], [-52.5, 62.5], [-51, 61], [-25.5, 61], [-58.5, 53], [-50.5, 61], [-35, 52], [-63, 62], [-51, 61], [-51, 61], [-42.5, 69], [-52, 58], [-49, 61], [-52, 61], [-51, 72.5], [-51, 62], [-56, 66.5], [-64, 59], [-57, 62], [-63, 71], [-51, 61], [-56, 48.5],
    [-45, 57], [-45, 49], [-56, 56], [-52, 48], [-46, 66], [-51.5, 32], [-46.5, 56], [-25.5, 61], [-23, 42.5], [-48, 58.5], [-25.5, 61], [-62, 49.5], [-49.5, 49.5], [-50, 50], [-43, 39], [-57.5, 38.5], [-32.5, 52], [-50, 50], [-41, 61.5], [-51.5, 49.5], [-50, 55], [-62.5, 51], [-50, 50], [-52, 34], [-50, 49], [-51.3, 61],
    [-36.5, 62], [-50, 60], [-51, 62], [-55.5, 68.5], [-47.5, 64.5], [-47, 61], [-37, 71.5], [-49.5, 62], [-52.5, 63.5], [-26, 48.5]],
    fromStringToInt = [];
var ctx = null, Thecanvas;
var words = [], loaded = false, Myfont;

function preload() {
    Myfont = loadFont(fontFileName);
    for (var i = 0; i < CharsToDraw.length; i++) {
        fromStringToInt[CharsToDraw[i]] = i;
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
        onFontLoaded(font);
        setAllWords();
    });
    textFont(Myfont);
    var width = window.innerWidth, height = window.innerHeight;
    World.add(world, Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true }));
    ctx = document.getElementById('defaultCanvas0').getContext('2d');
}