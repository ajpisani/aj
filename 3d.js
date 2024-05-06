let colorNum = 0;
let colorNum1 = 105;
let colorNum2 = 210;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight, WEBGL);
  frameRate(40);
  colorMode(HSB, 255);
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
  colorNum = colorNum += 1;

  if (colorNum == 315) {
    colorNum = 0;
  }

  colorNum1 = colorNum1 += 1;

  if (colorNum1 == 315) {
    colorNum1 = 0;
  }

  colorNum2 = colorNum2 += 1;

  if (colorNum2 == 315) {
    colorNum2 = 0;
  }

  background(0, 0, 0);

  push();

  fill(colorNum, 255, 255, 190);
  translate(-window.innerWidth / 4, window.innerHeight / 25);
  rotateX(frameCount * 0.02);
  sphere(130, 4, 4);

  pop();

  push();

  fill(colorNum1, 255, 255, 190);
  translate(window.innerWidth / 8, window.innerHeight / -5);
  rotateY(frameCount * 0.006);
  sphere(100, 20, 4);

  pop();

  push();

  fill(colorNum2, 255, 255, 190);
  translate(
    window.innerWidth / 3,
    window.innerHeight - window.innerHeight * 0.8,
    -20
  );
  rotateZ(frameCount * 0.02);
  rotateY(frameCount * 0.04);
  sphere(80, 24, 24);

  pop();
}
