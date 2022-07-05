
var Xwin =window.innerWidth, Ywin = window.innerHeight,Xcenter,Ycenter;
var fr = 60;
var PixelEveryFrame = 5000;
var points = [],p,pointClicked = -1, totPoints = 2;
var pointer,wheel=0;
var shiftX = 0,shiftY = 0,clicked=false,DownPosX=0,DownPosY=0,UpPosX=0,UpPosY=0;

function setup() {
    canvas = createCanvas(Xwin, Ywin, P2D);
	frameRate(fr);
    document.body.addEventListener("mousewheel", OnZoom);
    document.body.addEventListener("mousemove",OnMouseMoved);
    Xcenter = Xwin/2;
    Ycenter = Ywin/2;
    pointer = new Pointer(0,0);
    points[0] = new Point(0,-400);
    points[1] = new Point(-500,400);
    points[2] = new Point(500,400);
    UpdatePoints();
}

function draw() {
    for(i in points)
        points[i].drawPoint();
    drawPoint();
}

function drawPoint(){
    for(var i = 0; i < PixelEveryFrame; i++){
        p = random(points);
        pointer.x = (pointer.x + (p.x - pointer.x)/2);
        pointer.y = (pointer.y + (p.y - pointer.y)/2);
        point(pointer.x,pointer.y);
    }
}

function OnZoom(e){
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    //console.log(wheel);
    if(delta > 0)
        wheel++;
    else if(wheel > 0)
        wheel--;
    UpdatePoints();
}

function Point(x,y){
    this.size = 15;
    this.baseX = x;
    this.baseY = y;
    this.x = x;
    this.y = y;
    fill(255,0,0);
    this.drawPoint = function(){
         ellipse(this.x,this.y,this.size,this.size);
    }
}

function Pointer(x,y){
    this.x = x;
    this.y = y;
}

function UpdatePoints(){
    background(255);
    for(i in points){
        points[i].x = points[i].baseX*pow(1.07,wheel)+Xcenter+shiftX;
        points[i].y = points[i].baseY*pow(1.07,wheel)+Ycenter+shiftY;
    }
}

function mousePressed(){
    for(i in points){
        if(pow((mouseX - points[i].x), 2) + pow((mouseY - points[i].y), 2) < 60)
            pointClicked = i;
        //console.log(pow((mouseX - points[i].x), 2) + pow((mouseY - points[i].y), 2))
    }

    DownPosX = mouseX;
    DownPosY = mouseY;
    clicked = true;
}

function mouseReleased(){
    pointClicked = -1;
    clicked = false; 
    UpPosX = shiftX;
    UpPosY = shiftY;
}

function OnMouseMoved(e){
    if(clicked){
        if(pointClicked >= 0){
            points[pointClicked].baseX = mouseX-Xcenter-shiftX;
            points[pointClicked].baseY = mouseY-Ycenter-shiftY;
        }
        else{
            shiftX = (UpPosX + mouseX - DownPosX);
            shiftY = (UpPosY + mouseY - DownPosY);
        }
        UpdatePoints();
    }
}

function keyPressed() {
    switch (keyCode) {
        case ENTER: points[++totPoints] = new Point(Xcenter,Ycenter); break;
    }
}