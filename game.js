let ground = [];
let track = [];
let ties = [];
let smoke = [];
let cars = [];
let carSpawn = 0;
let carSpawnCtrl = 45;
let tieCtrl = 1;
let smokeCtrl = 1;
let cx = 400;
let CX = 310;
let CY = window.innerHeight / 1.25;
let cx1 = 450;
let cx2 = 434;
let cx3 = 380;
let cx4 = 364;
let cy = window.innerHeight / 1.25;
let cy1 = window.innerHeight / 1.2;
let cy2 = window.innerHeight / 1.2;
let cy3 = window.innerHeight / 1.2;
let cy4 = window.innerHeight / 1.2;
let cxa = 275;
let cx1a = 315;
let cx2a = 299;
let cx3a = 180;
let cx4a = 164;
let cya = window.innerHeight / 1.25;
let cy1a = window.innerHeight / 1.2;
let cy2a = window.innerHeight / 1.2;
let cy3a = window.innerHeight / 1.2;
let cy4a = window.innerHeight / 1.2;
let trainRotateNum = 0;
let carRotateNum = 0;
let gravity = 0;
let Cgravity = 0;
let trainJump = 0;
let carJump = 0;
let wheel1 = 0;
let wheel2 = 0;
let wheel3 = 0;
let wheel4 = 0;
let wheel5 = 0;
let wheel6 = 0;
let wheel7 = 0;
let wheel8 = 0;
let score = 0;
let loop = true

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
    this.r = 5 + 10 * noise(0.11215 * frameCount);
  }

  showPoints() {
    noStroke();
    fill(170, 40, 50);
    circle(this.x, this.y, this.r);
  }
  updatePoints() {
    this.x -= 3.475;
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
    this.y = window.innerHeight / 2 + 40 * noise(0.0125 * frameCount);
  }

  showRail() {
    strokeWeight(5.5);
    stroke(17, 60, 20);
    ellipse(this.x, this.y + window.innerHeight / 3.5, 8, 0.75);
    ellipse(this.x, this.y + window.innerHeight / 3.3, 8, 0.95);
  }
  updateRail() {
    this.x -= 8.75;
  }
  killRail() {
    if (this.x <= 0) {
      track.splice(i, 1);
    }
  }

  getX() {
    if (this.x <= 400) {
      cy = this.y + window.innerHeight / 3.95;
    }
  }
  getXC() {
    if (this.x <= 315) {
      CY = this.y + window.innerHeight / 3.95;
    }
  }
  getX1() {
    if (this.x <= 450) {
      cy1 = this.y + window.innerHeight / 3.36;
    }
  }
  getX2() {
    if (this.x <= 434) {
      cy2 = this.y + window.innerHeight / 3.36;
    }
  }
  getX3() {
    if (this.x <= 380) {
      cy3 = this.y + window.innerHeight / 3.36;
    }
  }
  getX4() {
    if (this.x <= 364) {
      cy4 = this.y + window.innerHeight / 3.36;
    }
  }
  getXa() {
    if (this.x <= 275) {
      cya = this.y + window.innerHeight / 3.95;
    }
  }
  getX1a() {
    if (this.x <= 325) {
      cy1a = this.y + window.innerHeight / 3.36;
    }
  }
  getX2a() {
    if (this.x <= 309) {
      cy2a = this.y + window.innerHeight / 3.36;
    }
  }
  getX3a() {
    if (this.x <= 180) {
      cy3a = this.y + window.innerHeight / 3.36;
    }
  }
  getX4a() {
    if (this.x <= 164) {
      cy4a = this.y + window.innerHeight / 3.36;
    }
  }
}

class Ties {
  constructor() {
    this.x = width;
    this.y = window.innerHeight / 2 + 40 * noise(0.0125 * frameCount);
    this.tieShift = random(0, 8);
    this.tieShift2 = random(0, 8);
  }

  showTies() {
    strokeWeight(5);
    line(
      this.x + this.tieShift,
      this.y + window.innerHeight / 3.65,
      this.x + 18 + this.tieShift2,
      this.y + window.innerHeight / 3.15
    );
  }
  updateTies() {
    this.x -= 8.75;
  }
  killTies() {
    if (this.x + 18 <= 0) {
      ties.splice(i, 1);
    }
  }
}

class Smoke {
  constructor() {
    this.x = 441;
    this.y = cy2 - window.innerHeight / 18 + trainJump * 1.09;
    this.xSpeed = -1;
    this.ySpeed = -2;
    this.r = random(12, 20);
    this.vel = 0.005;
    this.alpha = 1;
    this.brightness = random(30, 65);
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
    this.r += 0.8;
    this.alpha -= 0.01;
    if (this.ySpeed <= 1) {
      this.ySpeed += 0.012;
    } else {
      this.ySpeed = 0;
    }
  }
  killSmoke() {
    if (this.alpha <= 0) {
      smoke.splice(i, 1);
    }
  }
}

class Cars {
  constructor() {
    this.x = width;
    this.y =
      window.innerHeight / 1.35 +
      40 * noise(0.0125 * frameCount) +
      random(-16, 6);
    this.r = random(10, 16);
    this.h = random(1, 300);
    this.xSpeed = random(-15.75, -14.75);
  }
  showCar() {
    fill(this.h, 200, 200);
    circle(this.x, this.y, this.r);
  }
  updateCar() {
    this.x += this.xSpeed;
  }
  killCar() {
    if (this.x <= 0) {
      cars.splice(i, 1);
      score += 1;
    }
  }
  collideCar() {
    if (this.x <= 465 && this.x >= 140 && this.y <= cy + trainJump + 34) {
      loop = false
      noLoop();
      push();
      textSize(30);
      fill(1, 230, 100);
      text(`Game Over!`, 0.5 * width, 0.5 * height);
      pop();
      push();
      textSize(20);
      fill(100, 180, 200);
      text(`Score: ${score}`, 0.5 * width, 0.5 * height + 35);
      pop();
      push();
      textSize(15);
      fill(60, 240, 190);
      text(`Click To Respawn`, 0.5 * width, 0.5 * height + 60);
      pop();
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

function runCars() {
  let vehicle = new Cars();
  cars.push(vehicle);
  carSpawnCtrl = random(80, 130);
}

function draw() {
  background(0, 0, 90);

  if (trainJump <= -140) {
    gravity = 12;
  }
  if (trainJump >= 0) {
    gravity = 0;
    trainJump = 0;
  }
  if (carJump <= -140) {
    Cgravity = 12;
  }
  if (carJump >= 0) {
    Cgravity = 0;
    carJump = 0;
  }

  gravity += 0.6;
  Cgravity += 0.6;
  trainJump += gravity;
  carJump += Cgravity;

  carSpawn += 1;

  trainRotateNum = cy4 - cy1;
  carRotateNum = cy4a - cy1a;

  tieCtrl += 1;
  if (tieCtrl == 7) {
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
  if (frameCount >= 200) {
    if (carSpawn >= carSpawnCtrl) {
      runCars();
      carSpawn = 0;
    }
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
    track[i].getXa();
    track[i].getX1a();
    track[i].getX2a();
    track[i].getX3a();
    track[i].getX4a();
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
  for (i = 0; i < cars.length; i++) {
    cars[i].updateCar();
    cars[i].showCar();
    cars[i].collideCar();
    cars[i].killCar();
  }

  fill(100, 255, 255);
  rect(CX + 8, cy + window.innerHeight / 45 + trainJump, 25, 2);

  push();

  rotate(-0.001 * trainRotateNum);
  tint(10, 100, 255);
  imageMode(CENTER);
  image(img2, cx, cy + trainJump, 125, 70);
  pop();

  push();
  noStroke();
  fill(195, 180, 255);
  rotate(-0.001 * carRotateNum);
  rect(cxa - 125, cya - 30 + carJump, 175, 65);
  pop();

  fill(10, 10, 20);
  circle(cx1, cy1 + wheel1 * trainJump, 10);
  circle(cx2, cy2 + wheel2 * trainJump, 10);
  circle(cx3, cy3 + wheel3 * trainJump, 10);
  circle(cx4, cy4 + wheel4 * trainJump, 10);
  circle(cx1a, cy1a + wheel5 * carJump, 10);
  circle(cx2a, cy2a + wheel6 * carJump, 10);
  circle(cx3a, cy3a + wheel7 * carJump, 10);
  circle(cx4a, cy4a + wheel8 * carJump, 10);
  push();
  fill(60, 50, 255);
  text(`Press Any Key to Jump!`, 25, 40);
  text(`Jump Over The Dots!`, 25, 55);
  pop();
  push();
  fill(130, 80, 255);
  textSize(20);
  text(`Score: ${score}`, 25, 25);
  pop();
}

function keyPressed() {
  if (trainJump >= 0.6 && gravity >= 0.6) {
    trainJump = -1;
    gravity = -12;
    setTimeout(function () {
      carJump = -1;
      Cgravity = -12;
    }, 100);
    wheel1 = random(0.115, 0.425);
    wheel2 = random(0.115, 0.425);
    wheel3 = random(0.115, 0.425);
    wheel4 = random(0.115, 0.425);
    wheel5 = random(0.115, 0.425);
    wheel6 = random(0.115, 0.425);
    wheel7 = random(0.115, 0.425);
    wheel8 = random(0.115, 0.425);
  }
}

function mousePressed() {
  loop()
  cars.splice(0, cars.length);
  loop = true
  score = 0;
}

function touchStarted(){
if (loop == true){
  if (trainJump >= 0.6 && gravity >= 0.6) {
    trainJump = -1;
    gravity = -12;
    setTimeout(function () {
      carJump = -1;
      Cgravity = -12;
    }, 100);
    wheel1 = random(0.115, 0.425);
    wheel2 = random(0.115, 0.425);
    wheel3 = random(0.115, 0.425);
    wheel4 = random(0.115, 0.425);
    wheel5 = random(0.115, 0.425);
    wheel6 = random(0.115, 0.425);
    wheel7 = random(0.115, 0.425);
    wheel8 = random(0.115, 0.425);
  }
} if (loop==false) {  
  loop();
  cars.splice(0, cars.length);
  loop = true
  score = 0; }
}
