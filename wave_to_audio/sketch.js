
let audioCtx
let myArrayBuffer
let source
var Xwin = window.innerWidth, Ywin = window.innerHeight;
var fr = 60;

var expr = math.compile("sin(x)")


function setup() {    
    canvasWidth = min(window.innerWidth, 1080)
    let canvas = createCanvas(canvasWidth, 400, P2D);
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
    background(255)
    stroke(0);
    strokeWeight(1);
    out = eval_draw(0)
    p_y = height * 0.5 - out * height * 0.25
    for (let i = 1; i < width; i++) {
        out = eval_draw(i)
        y = height * 0.5 - out * height * 0.25
        line(i - 1, p_y, i, y);
        p_y = y
    }
}

function mousePressed() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // (new window.AudioContext).
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
        for (let i = 0; i < myArrayBuffer.length; i++) {
            out = eval_audio(i)
            nowBuffering[i] = out;
        }
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