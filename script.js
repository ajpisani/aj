function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(40);
  colorMode(HSB, 255);
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

let r1num = 8;
let anum = 15;
let xnum = 1;
let ynum = 1;
let bnum = 255;
let xXnum = 0;
let xYnum = 0;
let rColor1 = 0;
let rColor2 = 0;
let rColor3 = 0;
let rColor4 = 0;
let rColor5 = 0;
let rColor6 = 0;
let rColor7 = 0;
let rColor8 = 0;

function draw() {
  background(0, 0, 0);

  xnum = xnum += ynum;
  if (xnum == 255) {
    ynum = -1;
  }
  if (xnum == 0) {
    ynum = 1;
  }

  bnum = bnum -= 5;
  xXnum = xXnum += r1num;
  xYnum = xYnum -= r1num;

  fill(rColor1, 255, bnum);
  circle(xXnum, xYnum, random(5, 10));

  fill(rColor2, 255, bnum);
  circle(-xXnum, xYnum, random(5, 10));

  fill(rColor3, 255, bnum);
  circle(-xXnum, -xYnum, random(5, 10));

  fill(rColor4, 255, bnum);
  circle(xXnum, -xYnum, random(5, 10));

  fill(rColor5, 255, bnum);
  circle(xXnum + 60, xYnum + 60, random(5, 10));

  fill(rColor6, 255, bnum);
  circle(-xXnum + 60, xYnum + 60, random(5, 10));

  fill(rColor7, 255, bnum);
  circle(-xXnum + 60, -xYnum + 60, random(5, 10));

  fill(rColor8, 255, bnum);
  circle(xXnum + 60, -xYnum + 60, random(5, 10));

  rotateY(millis() / 3500);
  fill(xnum, 255, 255);
  sphere(200, anum);
}

function mousePressed() {
  anum = anum += 1;
  if (anum == 25) {
    anum = 3;
  }

  xXnum = 0;
  xYnum = 0;
  bnum = 255;
  r1num = random(6, 12);
  rColor1 = random(1, 255);
  rColor2 = random(1, 255);
  rColor3 = random(1, 255);
  rColor4 = random(1, 255);
  rColor5 = random(1, 255);
  rColor6 = random(1, 255);
  rColor7 = random(1, 255);
  rColor8 = random(1, 255);
}

function touchStarted() {
  anum = anum += 1;
  if (anum == 25) {
    anum = 3;
  }

  xXnum = 0;
  xYnum = 0;
  bnum = 255;
  r1num = random(6, 12);
  rColor1 = random(1, 255);
  rColor2 = random(1, 255);
  rColor3 = random(1, 255);
  rColor4 = random(1, 255);
  rColor5 = random(1, 255);
  rColor6 = random(1, 255);
  rColor7 = random(1, 255);
  rColor8 = random(1, 255);
}
