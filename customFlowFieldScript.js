//create an array to hold particles
let particles = []

//set up function runs once when the website is opened
function setup() {
    //create the canvas
    let canvas = createCanvas(window.innerWidth, window.innerHeight);
    //set the canvas parent to the container (so text can be placed underneath it in a website)
    canvas.parent("canvas-container")
    //set the frame rate to 60 for most machines
    frameRate(60)
    //set the color mode to Hue Saturation Brightness, as opposed to RGB values for easier editing
    colorMode(RGB)
}

//function to resize canvas if the window is resized
function windowResized(){
    //resize the canvas to the size of the window
    resizeCanvas(window.innerWidth, window.innerHeight);
}

//class for making the lines
class Particles {
    //use the constructor to make variables for each instance
    constructor() {
        //set the x value to halfay across the screen (longways)
        this.x = window.innerWidth/2
        //set the height to just under the top of the screen (or canvas)
        this.y = 1
        //set the x velocity to 0 to initialize the variable
        this.xVel = 0
        //set the y velocity to 3
        this.yVel = 3
        //set red green and blue values to make a orangish color
        this.red = random(200, 240)
        this.green = random (10,20)
        this.blue = random(5,10)
        //set fade value to 1
        this.fade = 1
        //set the noise scale (for each individual trail) to a number between 1 and 2
        this.noiseScale = random(1, 2)
        //set the noise seed for the trails to a very small range of noise seeds
        this.noiseSeed = random(0.005, 0.0051)
        //create an array for the history for the shapes so they dont get too long and lag the computers
        this.history = []
        //set the line thickness to 8
        this.thickness = 8
        //set the main path time offset value to 0 to initalize (time offset for noise makes it so each line doesnt follow the same path)
        this.mainPathNoiseOffset = 0;
        //set the path modifing variable value to 0 to initialize
        this.mainPathX = 0;
        //initialize a center pull variable
        this.centerPull = 0
    }
    
    //the update particles function makes all the changes to the lines
    updateParticles() {
        //add the x velocity to the main path and the center pull value after scaling it down and then add all that to the x value to change it
        this.x += + this.xVel + this.mainPathX + (this.centerPull * 0.025)
        //add the y velocity to the y value so the line moves down the screen (0 is the top of the screen, window.innerHeight is the bottom)
        this.y += this.yVel
        //decrease the fade variable by 0.0035% every frame (60 frames a second)
        this.fade -= 0.0035
        //make a life variable based on the fade
        this.life = 1 - this.fade
        //edit the noise scale based on the fade value so the particle stop moving around when theyre supposed to be going back together
        this.noiseScale *= this.fade * 1.125
        //edit the x velocity based on noise, you need to use the frame count as nosie values are based on the last value
        this.xVel = this.noiseScale * (noise(this.noiseSeed * frameCount))
        //decrease the line thickness by 0.005 every frame (60 fps)
        this.thickness -= 0.005
        //instead of using framecount, add the noise path offset value at a different speed (0.005 a frame) 
        this.mainPathNoiseOffset += 0.005
        //use that in the noise function to get the main path x value using noise. noise by default returns values between 0 and 1. in this case, it is scaled after the function and half of what it is scaled by is then subtracted to get values between -x and x instead of 0 and 1
        this.mainPathX = noise(this.mainPathNoiseOffset) * 14 - 7; 
        //update the center pull value based on the width and x position of the line and use the fade variable, as a lifetime, to make the center pull stronger as the lines age increases, so they all start together, do their own thing in the middle, and return to the middle at the end
        this.centerPull = (width/2 - this.x) * (1 - this.fade); 
        //add the x and y values to the history for making the shape
        this.history.push({ x: this.x, y: this.y });
        //if the history array gets larger than 50 x and y values,
        if (this.history.length > 50) {
            //delete the oldest, and add the newest
            this.history.shift();
        }
        //set the color based on the life of the line
        //if the life is less than 1/3 of its life, do the first of third colors
        if (this.life < 0.33) {
            //make a variable for the lifespan of this stage between 0 and 1
            let t = this.life / 0.33;
            //use lerp which moves a number from one to another smoothly between a time (t in this case)
            //it is used to transition the reds, greens, and blues smoothly so coustom colors can be faded between
            this.red = lerp(242, 130, t);
            this.green = lerp(142, 36, t);
            this.blue = lerp(43, 112, t);
        //do the same for the magenta to blue    
        } else if (this.life < 0.66) {
            let t = (this.life - 0.33) / 0.33;
            this.red = lerp(130, 49, t);
            this.green = lerp(36, 115, t);
            this.blue = lerp(115, 191, t);
        //and a similar thing for blue to blue, while it fades out, so the only difference is it is moving between the same numbers and therefor, not changing.
        } else {
            let t = (this.life - 0.66) / 0.34;
            this.red = lerp(0, 0, t);
            this.green = lerp(120, 120, t);
            this.blue = lerp(255, 255, t);
        }
    }

    
    //this function draws each line
    drawParticles() {
        //give the line no fill (no inside color because they are lines)
        noFill();   
        //start a shape (use begin and end shape to get our squiggly lines using the noise)
        beginShape();
        //set the line stroke (outline) thickness to the changing variable for it
        strokeWeight(this.thickness);
        //set the stroke color to the hue variable and set the saturation and brightness at 255 and set the opacity to the fade variable
        stroke(this.red, this.green, this.blue, (this.fade)*255);
        //loop each instance of x and y values in the histiory array
        for (let p of this.history) {
            //make a vertex based on the x and y value for the line to connect to 
            curveVertex(p.x, p.y);
        }
        //end the shape
        endShape();
    }
    
    //function to get rid of particles that faded out
    killParticle(){
        //if the fade variable is less than or equal to 0
        if (this.fade <= 0) {
            //get rid of a particle in it's position, 1 time
            particles.splice(i, 1)
        }
    }
}

//function that adds new lines to the particles array
function runParticles() {
    //make a variable to represent the creating of new lines from the Particles class
    let newParticle = new Particles()
    //add those new lines into the particles array
    particles.push(newParticle);
}

//the dray function runs once a frame and is used to move almost everything
function draw() {
    //draw a colorless background with a brightness of 70
    background(70)
    //call the function to add new lines
    runParticles()
    //loop for every line in the particles array
    for (i = 0; i < particles.length; i++){
        //call the function to update this isntance of this line
        particles[i].updateParticles()
        //call the function to draw the instance of this line
        particles[i].drawParticles()
        //call the function to kill or remove the instance of this line
        particles[i].killParticle()
    }
}