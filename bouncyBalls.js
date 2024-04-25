let poo = [];
let mp = false;
let kp = false;

class Sand {
  constructor() {
    this.x = mouseX;
    this.y = mouseY;
    this.r = random(4, 7);
    this.xSpeed = random(-2, 2);
    this.ySpeed = 0.5 * this.r;
    this.vel = 0.7;
    this.hueNum = floor(random(4));
  }

  pickColor = function () {
    if (this.hueNum == 0) {
      //orange
      this.hue = 15;
    }
    if (this.hueNum == 1) {
      //pink
      this.hue = 290;
    }
    if (this.hueNum == 2) {
      //blue
      this.hue = 150;
    }
  };

  makeSand = function () {
    fill(this.hue, 255, 255, 130);
    circle(this.x, this.y, this.r);
  };

  updateSand = function () {
    this.y += this.ySpeed + this.vel;
    this.x += this.xSpeed;
    this.vel += 0.25;
    //console.log(this.vel);
  };

  bounceSand = function () {
    if (this.y > window.innerHeight - 40) {
      this.y = window.innerHeight - 41;
      this.ySpeed = -this.ySpeed - this.vel;
      this.vel = 0.2 * this.vel;
      //console.log(`starting bounce ${poo.length}`);
    }
    if (this.x > window.innerWidth || this.x < 0) {
      this.xSpeed = -0.8 * this.xSpeed;
    }
  };
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  frameRate(40);
  colorMode(HSB, 255);
  stroke(100, 255, 0);
  strokeWeight(0.5);
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
  background(100, 0, 255);

  if (mp == true) {
    pee = new Sand();
    poo.push(pee);
  }

  if (kp == true) {
    poo.splice(0, 1);
  }

  for (i = 0; i < poo.length; i++) {
    poo[i].pickColor();
    poo[i].updateSand();
    poo[i].bounceSand();
    poo[i].makeSand();
  }

  if (poo.length >= 500) {
    poo.splice(0, 1);
    console.log("removed 1 sand");
  }
}

function mousePressed() {
  mp = true;
}

function mouseReleased() {
  mp = false;
}

function keyPressed() {
  kp = true;
}

function keyReleased() {
  kp = false;
}
