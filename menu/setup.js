// Matter js Variables
Matter.use('matter-springs');
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Constraint = Matter.Constraint,
    Composite = Matter.Composite,
    Vertices = Matter.Vertices,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Vector = Matter.Vector,
    render,
    world,
    engine;

// my global variables
var fontFileName = "menu/Fipps-Regular.otf", Thecanvas, words = [], loaded = false, Myfont;
var boatImg;
var stiffSlider;

function preload() {
    Myfont = loadFont(fontFileName);
    boatImg = loadImage('menu/sprites/boat.png');
}

function setup() {
    // Stiffness slider creation ══════════════════════════════════════════════════════════════════════════════════════════════════
    stiffSlider = createSlider(0, 100, 66);
    stiffSlider.style('transform: rotate(-90deg); position: absolute; width: 200px; left: -95px; top: 100px;');
    stiffSlider.parent("canvas-container")
    stiffSlider.input(function () {
        for (const spring of world.plugin.springs) {
            spring.stiffness = Math.pow(2, stiffSlider.value() / 15.019) - 1;
        }
    })
    // Link list creation ════════════════════════════════════════════════════════════════════════════════════════════════════════
    let listCont = document.getElementById("link-list")
    for (const l of PageLinks) {
        let li = document.createElement("ol");
        let a = document.createElement("a");
        a.setAttribute('href', "https://" + window.location.hostname + "/" + l.link);
        a.textContent = l.title;
        li.appendChild(a);
        listCont.appendChild(li)
    }
    //════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
    var elmnt = document.getElementById("menu-container");
    var width = window.innerWidth, height = Math.max(430 + elmnt.offsetHeight, window.innerHeight);
    let canv = createCanvas(width, height);
    canv.parent("canvas-container");

    engine = Engine.create();
    world = engine.world;

    imageMode(CENTER);
    strokeJoin(ROUND);
    strokeCap(ROUND);

    opentype.load(fontFileName, function (err, font) {
        var amount, glyph, x, y, fontSize;
        if (err) {
            console.log("font not loaded");
            showErrorMessage(err.toString());
            return;
        }
        window.font = font;
        createTitle("The Weird World of Tex");
        loaded = true;
    });
    textFont(Myfont);

    World.add(world, Bodies.rectangle(width / 2, height + 50, width + 1000, 100, { isStatic: true }));
    var lastScrollY = document.body.scrollTop;
    Thecanvas = document.getElementById('defaultCanvas0');
    document.body.addEventListener('mousedown', function (e) {
        if (e.target.id == "defaultCanvas0")
            for (const a of document.getElementsByTagName('a'))
                a.style.pointerEvents = "none";
    });
    document.body.addEventListener('mouseup', function (e) {
        for (const a of document.getElementsByTagName('a'))
            a.style.pointerEvents = "all";
    });
    document.body.addEventListener('scroll', function (e) {
        let deltaY = lastScrollY - document.body.scrollTop;
        lastScrollY = document.body.scrollTop;
        for (const comp of world.composites) {
            Matter.Body.applyForce(comp.bodies[0], comp.bodies[0].position, Vector.create(0, -deltaY * 0.0001))
        }
    })
    render = Render.create({
        element: document.getElementById('canvas-container'),
        canvas: Thecanvas,
        engine: engine,
        options: {
            width: width,
            height: height,
            showCollisions: true,
            showVelocity: true,
            wireframes: true,
            background: "#ffbf00"
        }
    });

    // engine.world.gravity.y = 0;
    Engine.run(engine);
    // Render.run(render);

    var mouse = Mouse.create(Thecanvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
            }
        });

    Composite.add(world, mouseConstraint);
}