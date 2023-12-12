// Matter js Variables
Matter.use('matter-springs');
var Vector = Matter.Vector,
    render,
    world,
    engine;

// my global variables
var fontFileName = "menu/Fipps-Regular.otf", Thecanvas, words = [], loaded = false, Myfont;
var boatImg, char_to_font_idx = {};
var stiffSlider;

function preload() {
    Myfont = loadFont(fontFileName);
    boatImg = loadImage('menu/sprites/boat.png');
}

function setup() {
    frameRate(60);
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
        a.setAttribute('class', "clickable");
        a.textContent = l.title;
        li.appendChild(a);
        listCont.appendChild(li)
    }
    let li = document.createElement("ol");
    let text_input = document.createElement("input");
    text_input.setAttribute('class', "clickable");
    text_input.setAttribute('type', "text");
    text_input.setAttribute('id', "title_changer");
    text_input.oninput = function () {
        title = this.value;
        createTitle(this.value);
    }
    text_input.setAttribute('placeholder', "???!?!?!??");
    li.appendChild(text_input);
    listCont.appendChild(li)
    //════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
    var elmnt = document.getElementById("menu-container");
    var width = window.innerWidth, height = Math.max(430 + elmnt.offsetHeight, window.innerHeight);
    let canv = createCanvas(width, height);
    canv.parent("canvas-container");

    engine = Matter.Engine.create();
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
        window.font = font
        char_to_font_idx = {};
        for (var i = 0; i < font.glyphs.length; i++) {
            var glyph = font.glyphs.get(i);
            if (glyph.unicode !== undefined) {
                char_to_font_idx[String.fromCharCode(glyph.unicode)] = i;
            }
        };
        createTitle("The Weird World of Tex");
        loaded = true;
    });
    textFont(Myfont);

    Matter.World.add(world, Matter.Bodies.rectangle(width / 2, height + 50, width + 1000, 100, { isStatic: true }));
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
    render = Matter.Render.create({
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
    Matter.Engine.run(engine);
    // Render.run(render);

    var mouse = Matter.Mouse.create(Thecanvas),
        mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
            }
        });

    Matter.Composite.add(world, mouseConstraint);
}