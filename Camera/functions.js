function initWebGL(canvas) {
  gl = null;
  
  // Try to grab the standard context. If it fails, fallback to experimental.
  gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  
  // If we don't have a GL context, give up now
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
  
  return gl;
}

function prepare(){
    var buffer;
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1.0, -1.0, 
       1.0, -1.0, 
      -1.0,  1.0, 
      -1.0,  1.0, 
       1.0, -1.0, 
       1.0,  1.0]),
       gl.STATIC_DRAW
    );

    var shaderScript;
    var shaderSource;
    var vertexShader;
    var fragmentShader;

    shaderScript = document.getElementById("vertex");
    shaderSource = shaderScript.text;
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, shaderSource);
    gl.compileShader(vertexShader);

    var compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    console.log('Vertex compiled successfully: ' + compiled);
    var compilationLog = gl.getShaderInfoLog(vertexShader);
    if(!compiled)
        alert("Vertex:\n"+compilationLog);

    shaderScript   = document.getElementById("fragment");
    shaderSource   = shaderScript.text;
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, shaderSource);
    gl.compileShader(fragmentShader);

    var compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    console.log('Fragment compiled successfully: ' + compiled);
    var compilationLog = gl.getShaderInfoLog(fragmentShader);
    if(!compiled)
        alert("Fragment:\n"+compilationLog);

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
}

function OnZoom(e){

    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    if(delta > 0)
        wheel++;
    else if(wheel > 0)
        wheel--;
}

function OnMouseDown(){
    DownPosX = mouseX;
    DownPosY = mouseY;
    clicked = true;
}

function OnMouseUp(){
    clicked = false; 
    UpPosX = shiftX;
    UpPosY = shiftY;
}

function OnMouseMove(e){
    mouseX = 2.8*(e.pageX)/Math.pow(1.2,wheel);
    mouseY = 2.8*(canvas.height - e.pageY)/Math.pow(1.2,wheel);
    if(clicked){
        shiftX = (UpPosX + mouseX - DownPosX);
        shiftY = (UpPosY + mouseY - DownPosY);
    }
}
var played = false;
var interval;
function OnClickPlay(){
    if(!played){
        eff = 0.0;
        interval = window.setInterval(effect,50);
        played = true;
    }
    else{
        clearInterval(interval);
        played = false;
    }
}

function effect(){
    eff += 1.0;
    sliderZ.value = eff;
    if(eff >= sliderZ.max)
        eff = 0.0;
}