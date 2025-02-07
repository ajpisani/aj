let lazerPix = []
let hueC = document.getElementById("hueCheck")
let hueOne;

function setup(){
    createCanvas(window.innerWidth, window.innerHeight)
    fr = 60
    frameRate(fr)
    colorMode(HSB)
    blendMode(ADD)
    background(0,0,0)
}

class Lazers {
    constructor(){

        this.x = mouseX //window.innerWidth / 2
        this.y = mouseY //window.innerHeight / 2
        this.z = random(5,15)
        this.lifespan = 20
        this.history = []
        this.zHistory = []
        this.alphaHistory = []
        this.alpha = 1
        this.hue = hueOne // round(random(0 , 300))
        this.direction = createVector( 
            random(-2.9,2.9),
            random(-2.9,2.9)
         )
    }

    
        updateCircle(){            
            this.x += this.direction.x + ( round(this.direction.x) * 4.2) * noise(0.1*this.direction.x * frameCount)
            this.y += this.direction.y + ( round(this.direction.y) * 4.2) * noise(0.1*this.direction.y * frameCount)
            this.z += (-.5*this.z)+(this.z * noise(0.05+frameCount))
            this.lifespan -= 1
            if(this.lifespan <= 0){
                this.alpha -= .05
            }
            var posV = createVector(this.x, this.y)
            var z = this.z
            this.history.push(posV)
            this.zHistory.push(z)
            this.alphaHistory.push(this.alpha)
            if (this.history.length > 100){
            this.history.splice(0,1)
            this.zHistory.splice(0,1)
            }
            
            for(let i =0; i < this.history.length; i++){
            this.alphaHistory[i] -= .07
            }
        }

    showCircle(){
        noStroke()
        fill(this.hue, 180, 200, this.alpha)
        circle(this.x, this.y, this.z)
        for(let i =0; i < this.history.length; i++){
            var pos = this.history[i];
            var zPos = this.zHistory[i]
            var aPos = this.alphaHistory[i]
            fill(this.hue,180,200, (aPos))
            circle(pos.x, pos.y, zPos);
        }  
    }



    killCircle(){
        if (this.lifespan < 0 && this.alpha < 0){
            this.history.splice(0, this.history.length)
            this.zHistory.splice(0, this.zHistory.length)
            this.history.splice(0, this.alphaHistory.length)
            lazerPix.splice(i, 1)
        }
    }
}

function runDots(){
dot = new Lazers
lazerPix.push(dot)
if(hueC.checked){
    hueOne = random(0,300)
}
}




function draw(){
    clear()
    background(20,20,20)


for (i=0; i < lazerPix.length; i++){
    lazerPix[i].showCircle();
    lazerPix[i].updateCircle();
    lazerPix[i].killCircle();
}

}

function mousePressed() {
    hueOne = round(random(-10,330))
    for(i=0;i<=15;i++){
    runDots()
}}

function touchStarted(){
    hueOne = round(random(-10,330))
    for(i=0;i<=15;i++){
    runDots()
}
}

