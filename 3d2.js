let mp = false;
let sArray = [];

function setup() {
  createCanvas(window.innerWidth, window.innerHeight, WEBGL);
  frameRate(30);
  colorMode(HSB, 255);
  noStroke();
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

class Shapes {
  constructor() {
    this.alpha = 255;
    this.size = floor(random(20, 40));
    this.tX = mouseX - height / 1.25;
    this.tY = mouseY - width / 3;
    this.tZ = random(-1, 1);
    this.dX = floor(random(4, 24));
    this.dY = floor(random(4, 24));
    this.col = random(1, 300);
    this.rX = floor(random(2, 4));
    this.rY = floor(random(2, 4));
    this.rZ = floor(random(1, 4));
  }

  makeShapes = function () {
    push();
    fill(this.col, 255, 255, this.alpha);
    translate(this.tX, this.tY, this.tZ);
    rotateX(frameCount * 0.01 * this.rX);
    rotateY(frameCount * 0.01 * this.rY);
    rotateZ(frameCount * 0.01 * this.rZ);
    sphere(this.size, this.dX, this.dY);
    pop();
  };

  updateShapes = function () {
    this.alpha -= 1;
  };
  death = function () {
    return this.alpha < 0;
  };
}

runShapes = function () {
  s = new Shapes();
  sArray.push(s);
};

function draw() {
  background(0, 0, 0);

  for (i = 0; i < sArray.length; i++) {
    sArray[i].makeShapes();
    sArray[i].updateShapes();

    if (sArray[i].death()) {
      sArray.splice(i, 1);
    }
  }
}

function mousePressed() {
  runShapes();
  mp = true;
}
function mouseReleased() {
  mp = false;
}
function touchStarted() {
  runShapes();
  mp = true;
}
function touchEnded() {
  mp = false;
}
