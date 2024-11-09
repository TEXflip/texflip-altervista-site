window.onload = init;
var gl;
var canvas;
var buffer;
var slider;
var program;
var wheel = 0, mouseX,mouseY,clicked = false,DownPosX,DownPosY,UpPosX=0,UpPosY=0,shiftX=0,shiftY=0, eff = 0.0;

function init(){
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl = initWebGL(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);


    sliderX = document.getElementById("RangeX");
    sliderY = document.getElementById("RangeY");
    sliderX.style.width = canvas.width-2;
    sliderY.style.width = canvas.width-2;
    sliderZ = document.getElementById("RangeZ");
    document.body.addEventListener("mousewheel", OnZoom);
    document.body.addEventListener("mousemove", OnMouseMove);
    canvas.addEventListener("mousedown", OnMouseDown);
    canvas.addEventListener("mouseup", OnMouseUp);
    document.getElementById("play").addEventListener("click" , OnClickPlay,false);
    

    prepare();
    render();
}

function render() {
 
    window.requestAnimationFrame(render, canvas);
    positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    ParameterSetting();
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function ParameterSetting(){
    var mtx = gl.getUniformLocation(program, "_mtx");
    gl.uniform4f(mtx, 2666, 2666, canvas.width/2, canvas.height/2);

    var res = gl.getUniformLocation(program, "res");
    gl.uniform2f(res, canvas.width,canvas.height);

    var pos = gl.getUniformLocation(program, "Pos");
    gl.uniform2f(pos, sliderX.value,sliderY.value)

    var zoom = gl.getUniformLocation(program, "zoom");
    gl.uniform1f(zoom, wheel);

    var mouse = gl.getUniformLocation(program, "mouse");
    gl.uniform2f(mouse, shiftX, shiftY);

    var Iter = gl.getUniformLocation(program, "Iter");
    gl.uniform1f(Iter, sliderZ.value);
}
