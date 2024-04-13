colorNum = 1

let poo = [];

function setup(){
    createCanvas(window.innerWidth, window.innerHeight)
    frameRate(40)
    colorMode(HSB)
    background(0,0,0)
    noStroke()
}

function windowResized(){
   resizeCanvas(window.innerWidth, window.innerHeight)
}

class Particles{
constructor(){

    this.x = window.innerWidth/2
    this.y = window.innerHeight - (window.innerHeight-20)
    this.xSpeed = random(-2,2)
    this.ySpeed = random(-4,-6)
    this.alpha = 1
    this.lifespan = 255
    this.velocity = random(1)
}

death(){
    return this.lifespan < 0;
}

showParticles() {
    fill(colorNum, 255, 255, this.alpha)
    ellipse(this.x, this.y, random(15,18), random(15,18))
}

updateParticles(){
    this.x -= this.xSpeed
    this.y -= (this.ySpeed + this.velocity)
    this.alpha -= (.00002*window.innerHeight)
    this.lifespan -= 1
}

updateVelocity(){
    this.velocity -= .2
}

}

function draw() {
    background(0,0,0)
    colorNum = colorNum += 1

    if (colorNum==315){
        colorNum=0
    }

pee = new Particles()
poo.push(pee)

for (i=0;i<poo.length; i++)
{
poo[i].updateVelocity()
poo[i].showParticles()
poo[i].updateParticles()
if (poo[i].death()) { poo.splice(i, 1)}
}


}
