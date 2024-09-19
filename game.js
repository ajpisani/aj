let ground = [];
let track = [];
let ties = [];
let smoke = [];
let tieCtrl = 1;
let smokeCtrl = 1;
let cx = window.innerWidth / 14;
let cx1 = window.innerWidth / 9.5;
let cx2 = window.innerWidth / 11;
let cx3 = window.innerWidth / 18;
let cx4 = window.innerWidth / 24.5;
let cy = window.innerHeight / 1.37;
let cy1 = window.innerHeight / 1.3;
let cy2 = window.innerHeight / 1.3;
let cy3 = window.innerHeight / 1.3;
let cy4 = window.innerHeight / 1.3;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  frameRate(30);
  colorMode(HSB);
  background(0, 0, 90);
}

function preload() {
  img2 = loadImage("myDrawing8.png");
  img = loadImage("particles-single2.png");
}

class Points {
  constructor() {
    this.x = width;
    this.y = window.innerHeight / 2 + 80 * noise(0.0125 * frameCount);
  }

  showPoints() {
    noStroke();
    fill(170, 40, 50);
    circle(this.x, this.y, 2);
  }
  updatePoints() {
    this.x -= 1;
  }
  killPoint() {
    if (this.x <= 0) {
      ground.splice(i, 1);
    }
  }
}
class Tracks {
  constructor() {
    this.x = width;
    this.y = window.innerHeight / 2 + 20 * noise(0.0125 * frameCount);
  }

  showRail() {
    strokeWeight(1);
    stroke(17, 60, 20);
    point(this.x, this.y + window.innerHeight / 4);
    point(this.x, this.y + window.innerHeight / 3.3);
  }
  updateRail() {
    this.x -= 1;
  }
  killRail() {
    if (this.x <= 0) {
      track.splice(i, 1);
    }
  }

  getX() {
    if (this.x <= window.innerWidth / 12) {
      cy = this.y + window.innerHeight / 3.95;
    }
  }
  getX1() {
    if (this.x <= window.innerWidth / 9.5) {
      cy1 = this.y + window.innerHeight / 3.36;
    }
  }
  getX2() {
    if (this.x <= window.innerWidth / 11) {
      cy2 = this.y + window.innerHeight / 3.36;
    }
  }
  getX3() {
    if (this.x <= window.innerWidth / 18) {
      cy3 = this.y + window.innerHeight / 3.36;
    }
  }
  getX4() {
    if (this.x <= window.innerWidth / 24.5) {
      cy4 = this.y + window.innerHeight / 3.36;
    }
  }
}

class Ties {
  constructor() {
    this.x = width;
    this.y = window.innerHeight / 2 + 20 * noise(0.0125 * frameCount);
  }

  showTies() {
    line(
      this.x,
      this.y + window.innerHeight / 4.1,
      this.x + 18,
      this.y + window.innerHeight / 3.2
    );
  }
  updateTies() {
    this.x -= 1;
  }
  killTies() {
    if (this.x + 18 <= 0) {
      ties.splice(i, 1);
    }
  }
}

class Smoke {
  constructor() {
    this.x = window.innerWidth / 11;
    this.y = cy2 - window.innerHeight / 16;
    this.xSpeed = -0.005;
    this.ySpeed = -2;
    this.r = 8;
    this.vel = 0.005;
    this.alpha = 1;
    this.brightness = random(30, 90);
  }

  showSmoke() {
    tint(1, 0, this.brightness, this.alpha);
    imageMode(CENTER);
    image(img, this.x, this.y, this.r, this.r);
  }
  updateSmoke() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    this.xSpeed -= 0.05;
    this.ySpeed += this.vel;
    this.r += 0.8;
    this.alpha -= 0.015;
    this.vel += 0.001;
  }
  killSmoke() {
    if (this.alpha <= 0) {
      smoke.splice(i, 1);
    }
  }
}

function runPoints() {
  let groundPoint = new Points();
  ground.push(groundPoint);
}
function runRail() {
  let railPoint = new Tracks();
  track.push(railPoint);
}
function runTies() {
  let tiePoint = new Ties();
  ties.push(tiePoint);
}

function runSmoke() {
  let smokePoint = new Smoke();
  smoke.push(smokePoint);
}

function draw() {
  background(0, 0, 90);

  tieCtrl += 1;
  if (tieCtrl == 19) {
    tieCtrl = 1;
  }
  if (tieCtrl == 1) {
    runTies();
  }
  smokeCtrl += 1;
  if (smokeCtrl == 4) {
    smokeCtrl = 1;
  }
  if (smokeCtrl == 1) {
    runSmoke();
  }
  runPoints();
  runRail();

  for (i = 0; i < ground.length; i++) {
    ground[i].updatePoints();
    ground[i].showPoints();
    ground[i].killPoint();
  }
  for (i = 0; i < track.length; i++) {
    track[i].updateRail();
    track[i].showRail();
    track[i].killRail();
    track[i].getX();
    track[i].getX1();
    track[i].getX2();
    track[i].getX3();
    track[i].getX4();
  }
  for (i = 0; i < ties.length; i++) {
    ties[i].updateTies();
    ties[i].showTies();
    ties[i].killTies();
  }

  for (i = 0; i < smoke.length; i++) {
    smoke[i].updateSmoke();
    smoke[i].showSmoke();
    smoke[i].killSmoke();
  }

  tint(100, 100, 255);
  imageMode(CENTER);
  image(img2, cx, cy, 115, 70);

  fill(10, 10, 20);
  circle(cx1, cy1, 10);
  circle(cx2, cy2, 10);
  circle(cx3, cy3, 10);
  circle(cx4, cy4, 10);
}
