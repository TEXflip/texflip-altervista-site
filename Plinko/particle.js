function Particle(x,y,r){
    this.color = random(360);
    var options = {
        restitution: 0.2,
        friction: 0
    }
    x += random(-2,2);
    this.body = Bodies.circle(x,y,r,options);
    this.r = r;
    World.add(world, this.body);

}

Particle.prototype.isOffScreen = function(){
    var x = this.body.position.x;
    var y = this.body.position.y;
    return (x > window.innerWidth || x < 0 || y > window.innerHeight+50);
}

Particle.prototype.show = function(){
    fill(this.color,255,255);
    var pos = this.body.position;
    push()
    translate(pos.x, pos.y);
    ellipse(0,0,this.r * 2);
    pop();
}