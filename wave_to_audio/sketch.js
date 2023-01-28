
let audioCtx
let myArrayBuffer
let source
var Xwin = window.innerWidth, Ywin = window.innerHeight;
var fr = 60;

var expr = math.compile("sin(x)")


function setup() {    
    canvasWidth = min(window.innerWidth, 1080)
    let canvas = createCanvas(canvasWidth, 300, P2D);
    canvas.parent('canvasContainer')
	frameRate(fr);
    draw_function()
    const function_textbox = document.getElementById("functiontext");
    function_textbox.addEventListener("input", function(e) {
        try {
            formula_string = e.target.value.toLowerCase()
            expr = math.compile(formula_string)
            draw_function()
        } catch (error) {
            
        }
    });
    const start_button = document.getElementById("start");
    start_button.addEventListener("click", function (e) {
        runtime_play()
        source.start()
    })
}

function eval_draw(x, def){
    scope = {x: x * Math.PI * 0.01}
    try {
        return expr.evaluate(scope)
    } catch (error) {
        return def
    }
}

function draw_function(){
    let values = new Array(width)
    let _max = 0;
    let h = height * 0.35
    let center_h = height * 0.5

    // compute values of the expression, keeping the max
    for (let i = 1; i < width; i++) {
        values[i] = eval_draw(i)
        if (_max < values[i])
            _max = Math.abs(values[i])
    }

    background(255)
    stroke(0);
    strokeWeight(1);

    out = eval_draw(0)
    p_y = center_h - out * h

    // draw the function, normalizing to 'h'
    for (let i = 1; i < width; i++) {
        y = center_h - values[i] * h / _max
        line(i - 1, p_y, i, y);
        p_y = y
    }
}

function mousePressed() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    myArrayBuffer = audioCtx.createBuffer(
        2,
        audioCtx.sampleRate * 3,
        audioCtx.sampleRate
    );
    source = audioCtx.createBufferSource();
    source.buffer = myArrayBuffer;
    source.connect(audioCtx.destination);
    // source.loop = true
}
hz = 440

function runtime_play() {
    for (let channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
        const nowBuffering = myArrayBuffer.getChannelData(channel);
        let _max = 0;

        // evaluate the expression and save to the buffer keeping the max
        for (let i = 0; i < myArrayBuffer.length; i++) {
            out = eval_audio(i)

            v = Math.abs(out)
            if (_max < v)
                _max = v;

            nowBuffering[i] = out;
        }

        // normalize to [1, -1] the buffer
        for (let i = 0; i < myArrayBuffer.length; i++)
            nowBuffering[i] = out / (_max + 0.001);
    }
}

function eval_audio(x){
    scope = {x: (x * Math.PI * 2 * hz) / audioCtx.sampleRate}
    try {
        return expr.evaluate(scope)
    } catch (error) {
        return 0
    }
}

function windowResized() {
    canvasWidth = min(window.innerWidth, 1080)
    resizeCanvas(canvasWidth, 400);
    draw_function()
}