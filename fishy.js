let yOffSet = 0;
let xOffSet = 0;
let offSetCtrl = 0.01;
let bubblesA = [];

let x;
let y;

class Bubbles {
  constructor() {
    this.x = x + 9;
    this.y = y + 8;
    this.lifetime = 100;
    this.bubbleXCtrl = 2 * random();
  }
  updateBubbles = function () {
    this.x += random() + this.bubbleXCtrl;
    this.y -= 4;
  };

  bubblesXoffSetFunc = function () {
    if (this.bubbleXCtrl <= 2) {
      this.bubbleXCtrl += 0.2;
    }
    if (this.bubbleXCtrl >= 2) {
      this.bubbleXCtrl = -this.bubbleXCtrl;
    }
  };

  showBubbles = function () {
    fill(149, 255, 255, 30);
    circle(this.x, this.y, 10);
  };

  killBubbles() {
    this.lifetime -= 1;
  }

  bubblesDeath() {
    return this.lifetime < 0;
  }
}

runBubbles = function () {
  bub = new Bubbles();
  bubblesA.push(bub);
};

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  frameRate(60);
  colorMode(HSB, 255);
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
  background(150, 190, 199);
  y = map(noise(yOffSet), 0, 1, 0, window.innerHeight);

  x = map(noise(xOffSet), 0, 1, 0, window.innerWidth);

  yOffSet += 0.0045;
  xOffSet += 0.01 + 0.01 * offSetCtrl;

  if (offSetCtrl <= 0.05) {
    offSetCtrl += 0.001;
  }
  if (offSetCtrl >= 0.05) {
    offSetCtrl = -offSetCtrl;
  }

  for (i = 0; i < bubblesA.length; i++) {
    bubblesA[i];
  }
  fill(220, 255, 180);
  circle(x, y, 30);
  triangle(x - 10, y, x - 30, y + 10, x - 30, y - 10);
  circle(x + 3, y - 4, 3);

  if (offSetCtrl > 0.0415) {
    runBubbles();
    fill(0, 0, 0);
    circle(x + 8, y + 5, 10);
  } else {
    fill(0, 0, 0);
    line(x + 4, y + 2, x + 15, y + 1);
  }

  for (i = 0; i < bubblesA.length; i++) {
    bubblesA[i].updateBubbles();
    bubblesA[i].showBubbles();
    bubblesA[i].bubblesXoffSetFunc();
    bubblesA[i].killBubbles();
    if (bubblesA[i].bubblesDeath()) {
      bubblesA.splice(i, 1);
    }
  }
}
