let numsx = 1;
let numrx = 1;
let numtx = 1;
let numux = 1;
let numvx = 1;
let numwx = 1;
let numxx = 1;
let numyx = 1;
let numzx = 1;
let nums = 1;
let numr = 1;
let numt = 1;
let numu = 1;
let numv = 1;
let numw = 1;
let numx = 1;
let numy = 1;
let numz = 1;
let numa = 40;
let numb = 40;
let numc = 20;
let numd = 21;
let numEL = 1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
  stroke(numxx, numyx, numzx);
  fill(numsx, numyx, numxx);
  ellipse(nums, numy, numa, numb);

  stroke(numyx, numzx, numxx);
  fill(numtx, numvx, numxx);
  ellipse(nums, numz, numb, numa);

  stroke(numyx, numzx, numwx);
  fill(numux, numux, numyx);
  ellipse(numv, numx, numc, numd);

  stroke(numwx, numzx, numxx);
  fill(numzx, numwx, numyx);
  ellipse(numt, numw, numd, numc);

  stroke(numwx, numyx, numxx);
  fill(numyx, numzx, numwx);
  arc(numx, numy, numa, numb, numEL, HALF_PI + QUARTER_PI);

  stroke(numwx, numyx, numxx);
  fill(numvx, numzx, numwx);
  arc(numy, numw, numb, numc, numEL, PI + PI);

  stroke(nums, numz, numw);
  noFill();
  rect(numv, numx, nums, numt);
}

function keyPressed() {
  nums = Math.floor(Math.random() * windowHeight) + 1;
  numt = Math.floor(Math.random() * windowHeight) + 1;
  numu = Math.floor(Math.random() * windowHeight) + 1;
  numv = Math.floor(Math.random() * windowHeight) + 1;
  numw = Math.floor(Math.random() * windowWidth) + 1;
  numx = Math.floor(Math.random() * windowWidth) + 1;
  numy = Math.floor(Math.random() * windowWidth) + 1;
  numz = Math.floor(Math.random() * windowWidth) + 1;

  numsx = Math.floor(Math.random() * 255) + 1;
  numtx = Math.floor(Math.random() * 255) + 1;
  numux = Math.floor(Math.random() * 255) + 1;
  numvx = Math.floor(Math.random() * 255) + 1;
  numwx = Math.floor(Math.random() * 255) + 1;
  numxx = Math.floor(Math.random() * 255) + 1;
  numyx = Math.floor(Math.random() * 255) + 1;
  numzx = Math.floor(Math.random() * 255) + 1;

  numa = Math.floor(Math.random() * 80) + 40;
  numb = Math.floor(Math.random() * 90) + 30;
  numc = Math.floor(Math.random() * 160) + 10;
  numd = Math.floor(Math.random() * 180) + 5;
  numEL = Math.floor(Math.random() * 10) + 1;

  console.log(numx, numy, numz, numa, numb);
}

function touchStarted() {
  nums = Math.floor(Math.random() * windowHeight) + 1;
  numt = Math.floor(Math.random() * windowHeight) + 1;
  numu = Math.floor(Math.random() * windowHeight) + 1;
  numv = Math.floor(Math.random() * windowHeight) + 1;
  numw = Math.floor(Math.random() * windowWidth) + 1;
  numx = Math.floor(Math.random() * windowWidth) + 1;
  numy = Math.floor(Math.random() * windowWidth) + 1;
  numz = Math.floor(Math.random() * windowWidth) + 1;

  numsx = Math.floor(Math.random() * 255) + 1;
  numtx = Math.floor(Math.random() * 255) + 1;
  numux = Math.floor(Math.random() * 255) + 1;
  numvx = Math.floor(Math.random() * 255) + 1;
  numwx = Math.floor(Math.random() * 255) + 1;
  numxx = Math.floor(Math.random() * 255) + 1;
  numyx = Math.floor(Math.random() * 255) + 1;
  numzx = Math.floor(Math.random() * 255) + 1;

  numa = Math.floor(Math.random() * 80) + 40;
  numb = Math.floor(Math.random() * 90) + 30;
  numc = Math.floor(Math.random() * 160) + 10;
  numd = Math.floor(Math.random() * 180) + 5;
  numEL = Math.floor(Math.random() * 10) + 1;

  console.log(numx, numy, numz, numa, numb);
  return false;
}
