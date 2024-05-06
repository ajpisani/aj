let poo = [];
let img;

class Water {
  constructor() {
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight / 3;
    this.r = random(6, 8);
    this.xSpeed = random(-2, 2);
    this.ySpeed = -0.5 * this.r;
    this.vel = 0.7;
    this.velCtrl = 0.02;
    this.hueNum = floor(random(140, 150));
  }

  makeWater = function () {
    fill(this.hueNum, 255, 255, 140);
    circle(this.x, this.y, this.r);
  };

  updateWater = function () {
    this.x += this.xSpeed;
    this.y += this.ySpeed + this.vel;
    this.vel += this.velCtrl;
    this.velCtrl = this.velCtrl * 1.05;
    if (
      this.x >= 0.7 * window.innerWidth ||
      this.x <= 0 + window.innerWidth * 0.3
    ) {
      this.xSpeed = -0.7 * this.xSpeed;
    }
    poo[i].shootWater();
  };

  holdWater = function () {
    if (this.y >= window.innerHeight - 37) {
      this.y = window.innerHeight - 40;
      this.ySpeed = 0;
      this.vel = 0;
      this.velCtrl = 0;
      this.xSpeed = -3.5 * this.xSpeed;
    }
  };
  shootWater = function () {
    if (
      this.x >= window.innerWidth / 2 - 4 &&
      this.x <= window.innerWidth / 2 + 4 &&
      this.y == window.innerHeight - 40
    ) {
      this.x = window.innerWidth / 2;
      this.xSpeed = 0;
      this.ySpeed = -5;
      poo[i].killWater();
    }
  };
  killWater = function () {
    if (
      this.x >= window.innerWidth / 2 - 2 &&
      this.x <= window.innerWidth + 2 &&
      this.y <= window.innerHeight / 3 &&
      this.ySpeed <= -4
    ) {
      poo.splice(i, 1);
      console.log("killed a water 2");
    }
  };
}

function preload() {
  img = loadImage("particles-single.png");
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
  background(1, 0, 225);

  if (poo.length <= 100) {
    pee = new Water();
    poo.push(pee);
  }

  if (poo.length == 800) {
    poo.splice(0, 1);
    console.log("killed a water");
  }

  for (i = 0; i < poo.length; i++) {
    poo[i].updateWater();
    poo[i].holdWater();
    poo[i].makeWater();
    poo[i].killWater();
  }

  fill(100, 0, 190, 140);
  rect(
    window.innerWidth / 3.5,
    window.innerHeight / 1.065,
    window.innerWidth / 2.3,
    window.innerHeight / 40
  );
  rect(
    window.innerWidth / 2.025,
    window.innerHeight / 2.99,
    window.innerWidth / 70,
    window.innerHeight / 1.655
  );
}
