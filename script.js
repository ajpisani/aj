//initialize color values

colorCtrlNum = -1;
colorNum = 1;

//set up a canvas

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(40);
  colorMode(HSB);
  background(0, 0, 0);
  noLoop();
}

//resize canvas  when window is resized

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// draw function

function draw() {
  colorNum += 1;

  if (colorNum == 300) {
    colorNum = 1;
  }

  makeParticles();
}

makeParticles = function () {
  fill(colorNum, random(250, 255), 255, random(0.4, 0.8));
  circle(mouseX + random(-3, 3), mouseY + random(-3, 3), random(10, 20));
};

function mousePressed() {
  loop();
}
function mouseReleased() {
  noLoop();
}

function keyPressed() {
  background(0, 0, 0);
  colorNum = 0;
}

function touchStarted() {
  loop();
}

function touchMoved() {
  loop();
}

function touchEnded() {
  noLoop();
}
