
var Xwin =window.innerWidth, Ywin = window.innerHeight,Xcenter,Ycenter;
var fr = 60;
var PixelEveryFrame = 5000;
var points = [],p,pointClicked = -1, totPoints = 2;
var pointer,wheel=0;
var shiftX = 0,shiftY = 0,clicked=false,DownPosX=0,DownPosY=0,UpPosX=0,UpPosY=0;

var expr = () => 0

function setup() {
    canvas = createCanvas(200, 200, P2D);
	frameRate(fr);
    document.body.addEventListener("mousewheel", OnZoom);
    document.body.addEventListener("mousemove",OnMouseMoved);
    const function_textbox = document.getElementById("functiontext");
    function_textbox.addEventListener("input", function() {
        function_text = textInput.value
        expr = math.compile(input)
    });
}

function draw() {
    background(255)
    stroke(0);
    strokeWeight(2);
    line(50, 50, 350, 350);
}

function OnZoom(e){
    
}

function mousePressed(){
    
}

function mouseReleased(){
    
}

function OnMouseMoved(e){
    
}

function keyPressed() {
    
}