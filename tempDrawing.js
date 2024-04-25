// initialize colorNum for the particle color and mp for the MousePressed funtion
// the mp variable is a boolean value  made for when the mouse is pressed. this is useful for the draw()
//function as that is always looping

colorNum = 1;
let mp = false;

//initializing poo as our particle array

let pooSketch = [];
let poo = [];

// setup, a function that runs once, here we use it to set up a canvas and color mode
// i also put in the noStroke function which will make it so none of the particles have outlines
// it is faster to put that in here as opposed to doing it in the loop function

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  frameRate(60);
  colorMode(HSB);
  background(0, 0, 0);
  noStroke();
}

// a simple function to change the canvas size when the window is resized

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

// the particle class containing things like position (x and y) and the
// lifesspan, alpha (or opacity) , velocity,(x and y) and acceleration (which is this.vel when itis updated)

class Particles {
  constructor() {
    this.x = mouseX;
    this.y = mouseY;
    this.xSpeed = random(-2, 2);
    this.ySpeed = random(-4, -6);
    this.alpha = 1;
    this.lifespan = 255;
    this.velocity = random(1);
  }

  //this function returns true when the lifespan reaches zero so the particle can be deleted

  death() {
    return this.lifespan < 0;
  }

  // this function is actually draws a circle

  showParticles() {
    fill(colorNum, 255, 255, this.alpha);
    circle(this.x, this.y, 10);
  }

  // this function moves the circles

  updateParticles() {
    this.x -= this.xSpeed;
    this.y -= this.ySpeed + this.velocity;
    this.alpha -= 0.025;
    this.lifespan -= 1;
  }

  // this function updates the velocity making it act as an acceleration function

  updateVelocity() {
    this.velocity -= 0.2;
  }
}

// this class is for adding the circles used to draw

class Sketched {
  constructor() {
    this.pX = mouseX;
    this.pY = mouseY;
    this.lifetime = 255;
  }

  showSketched() {
    fill(colorNum, 255, this.lifetime);
    circle(this.pX, this.pY, 7);
  }

  killSketched() {
    this.lifetime -= 1;
  }

  sketchDeath() {
    return this.lifetime < 0;
  }
}

//this function is outside the particle class and it adds a particle (pee)
// to the particles index [poo] when it is called

runParticles = function () {
  pee = new Particles();
  poo.push(pee);
};

// this is ^that but for the circles

runSketch = function () {
  skee = new Sketched();
  pooSketch.push(skee);
};

// this is the draw function. it s always looping. it is a common function in everything involving p5 as is setup()

function draw() {
  // constantly looping a background function is the way you make particles move without leaving a trail

  background(0, 0, 0);

  // this says if mp = true, add some new particles

  if (mp == true) {
    runParticles();
    runSketch();

    // this function is how i make the color of the circle change
    // in HSB color mode, you fill colors like (hue, sat, bright, (alpha))
    // as opposeed to RGB colors which is (red, green, blue, (alpha))

    colorNum = colorNum += 1;

    if (colorNum == 315) {
      colorNum = 0;
    }
  }

  // a loop the size of the particles aray. it runs all the make and update and show functions.
  // the order is important as you want the particles updated before they generate more
  // the splice function removes the particle frtom the array once its lifespan runs out

  for (i = 0; i < poo.length; i++) {
    poo[i].updateVelocity();
    poo[i].showParticles();
    poo[i].updateParticles();
    pooSketch[i].killSketched();
    pooSketch[i].showSketched();

    if (poo[i].death()) {
      poo.splice(i, 1);
    }
    if (pooSketch[i].sketchDeath()) {
      pooSketch.splice(i, 1);
    }
  }
}

// these are functions that change the mp value when touch is actived or mouse is pressed
// this part is pretty simple

function mousePressed() {
  mp = true;
}

function mouseReleased() {
  mp = false;
}

function touchStarted() {
  mp = true;
}

function touchEnded() {
  mp = false;
}
