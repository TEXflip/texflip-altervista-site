var Engine = Matter.Engine,
    //Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies;

var speed;
var engine;
var world;
var particles = [];
var plinkos = [];
var buckets = [];
var counts = [];
var width = window.innerWidth, height = window.innerHeight;
var cols, rows;
var ParticleDim = 8, PlinkoDim = 13;

function setup() {
    createCanvas(window.innerWidth,window.innerHeight);
    engine = Engine.create();
    world = engine.world;
    colorMode(HSB);
    cols = parseInt(width/60),//numero pari pls
    rows = cols-5;
    console.log(cols);
    for(var j = 0; j < rows; j++){
        for(var i = 0; i < cols; i++){
            var x = i * (width/rows) + (width/(rows*2));
            var y = j * (height/cols)  + (height/(cols*2));
            if(j % 2 ==1)
                x -= width/(rows*2);
            var pl = new Plinko(x,y,PlinkoDim);
            plinkos.push(pl);
        }
    }
    for(var i = 0; i < cols + 1; i++){
        var b = new Bucket(i * (width/rows),height-40,10,80);
        buckets.push(b);
    }
    for(var i = 0; i < cols; i++){
        var c = new Counter(i * (width/rows),height,(width/rows),0);
        counts.push(c);
    }
}

function newParticle(){
    var p = new Particle(width/2, -10, ParticleDim);
    particles.push(p);
}

function draw() {
    if(frameCount % 20 == 0){
        newParticle();
    }


    background(0,0,10);
    Engine.update(engine, 16.666);
    for(i in counts){
        counts[i].show();
    }
    for(var i = 0; i < particles.length; i++){
        particles[i].show();
        if(particles[i].isOffScreen()){
            CountPlus(particles[i].body.position.x);
            World.remove(world,particles[i].body);
            particles.splice(i,1);
            i--;
        }
    }
    for(i in plinkos){
        plinkos[i].show();
    }
    for(i in buckets){
        buckets[i].show();
    }
}

function CountPlus(x){
    for(i in counts){
        if(x > counts[i].x && x < counts[i].x+counts[i].w)
            counts[i].h--;
    }

}

function Counter(x,y,w,h){
    this.height = 0;
    this. x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.show = function(){
        fill(100,255,255);
        stroke(0);

        rect(this.x,this.y,this.w,this.h);
    }
}