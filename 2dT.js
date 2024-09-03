let ground = [];

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  frameRate(30);
  colorMode(HSB);
  background(0, 0, 90);
  for (a = 0; a <= innerWidth / 1.5; a++) {
    runPoints();
  }
}

class Points {
  constructor() {
    this.x = a * 1.5;
    this.y = window.innerHeight / 2 + 80 * noise(0.0125 * a);
  }

  showPoints() {
    circle(this.x, this.y, 4);
  }
}
function runPoints() {
  let groundPoint = new Points();
  ground.push(groundPoint);
}

function draw() {
  for (i = 0; i <= width; i++) {
    ground[i].showPoints();
  }
}
