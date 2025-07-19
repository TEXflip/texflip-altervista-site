let is_mobile = false;
(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) is_mobile = true })(navigator.userAgent || navigator.vendor || window.opera);

// Matter.js Variables
Matter.use('matter-springs');
var Vector = Matter.Vector,
    render,
    world,
    engine;

// my global variables
var title = "The Weird World of Tex",
    char_to_font_idx = {},
    stiffSlider,
    words = [],
    Thecanvas,
    boatImg,
    p5Font;

function preload() {
    const fontFileName = "menu/Fipps-Regular.otf";
    p5Font = loadFont(fontFileName);
    opentype.load(fontFileName, function (err, font) {
        if (err) {
            console.log("font not loaded");
            showErrorMessage(err.toString());
            return;
        }
        window.font = font
        for (var i = 0; i < font.glyphs.length; i++) {
            const glyph = font.glyphs.get(i);
            if (glyph.unicode !== undefined) {
                char_to_font_idx[String.fromCharCode(glyph.unicode)] = i;
            }
        };
    });
    boatImg = loadImage('menu/sprites/boat.png');
}

function create_link_list() {
    let listCont = document.getElementById("link-list")
    let li = document.createElement("ol");
    for (const l of PageLinks) {
        li = document.createElement("ol");
        let a = document.createElement("a");
        a.setAttribute('href', "https://" + window.location.hostname + "/" + l.link);
        a.setAttribute('class', "clickable");
        a.textContent = l.title;
        li.appendChild(a);
        listCont.appendChild(li)
    }
    
    if (is_mobile) {
        title_div = document.getElementById("title");
        main_container = document.getElementById("main-container");
        listCont.appendChild(li)
        return;
    }
    
    let text_input = document.createElement("input");
    text_input.setAttribute('class', "clickable");
    text_input.setAttribute('type', "text");
    text_input.setAttribute('id', "title_changer");
    text_input.oninput = function () {
        if (this.value == "" || this.value == null || this.value == undefined)
            title = "The Weird World of Tex";
        else
            title = this.value;
        document.title = title;
        createTitle(title);
    }
    text_input.setAttribute('placeholder', "???!?!?!??");
    li = document.createElement("ol");
    li.appendChild(text_input);
    listCont.appendChild(li)
}

function loadCSS(filename, onLoadCallback) {
  // Check if the CSS file is already loaded (optional)
  console.log(`Loading CSS file: ${filename}`);
  if (document.querySelector(`link[href="${filename}"]`)) {
    if (onLoadCallback) onLoadCallback();
    return;
  }

  // Create link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = filename;

  // Event listeners for success or failure
  link.onload = () => {
    if (onLoadCallback) onLoadCallback();
    console.log(`${filename} loaded successfully`);
  };
  link.onerror = () => {
    console.error(`Error loading CSS file: ${filename}`);
  };

  // Append the link element to head
  document.head.appendChild(link);
}

function setup() {
    create_link_list();
    
    if (is_mobile) {
        noCanvas();
        noLoop();
        loadCSS('menu/style_mobile.css', undefined)
        return;
    }
    
    frameRate(60);
    textFont(p5Font);
    imageMode(CENTER);
    strokeJoin(ROUND);
    strokeCap(ROUND);
    // Stiffness slider creation ══════════════════════════════════════════════════════════════════════════════════════════════════
    stiffSlider = createSlider(0, 100, 66);
    stiffSlider.style('transform: rotate(-90deg); position: absolute; width: 200px; left: -95px; top: 100px;');
    stiffSlider.parent("canvas-container")
    stiffSlider.input(function () {
        for (const spring of world.plugin.springs) {
            spring.stiffness = Math.pow(2, stiffSlider.value() / 15.019) - 1;
        }
    })
    var elmnt = document.getElementById("menu-container");
    var width = window.innerWidth, height = Math.max(430 + elmnt.offsetHeight, window.innerHeight);
    let canv = createCanvas(width, height, P2D);
    canv.parent("canvas-container");

    engine = Matter.Engine.create();
    world = engine.world;

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
    // Matter.Render.run(render);

    var mouse = Matter.Mouse.create(Thecanvas),
        mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
            }
        });

    Matter.Composite.add(world, mouseConstraint);
    createTitle(title);
}

function glyphToMatterPath(glyphIndex, fontDimension) {
    var glyph = font.glyphs.get(glyphIndex);
    var charPath = "";
    if (glyph.numberOfContours > 0) {

    } else if (glyph.isComposite) {

    } else if (glyph.path) {
        var isM = false;
        for (i in glyph.path.commands) {
            if (glyph.path.commands[i].type == "M") {
                isM = true;
                charPath = "";
            }
            else if (glyph.path.commands[i].type == "Z")
                isM = false;
            if (isM)
                charPath += glyph.path.commands[i].x * (fontDimension * 0.001) + " " + -glyph.path.commands[i].y * (fontDimension * 0.001) + " ";
        }
        //charPath += glyph.path.commands.map(pathCommandToString).join('');
    }
    return charPath;
}