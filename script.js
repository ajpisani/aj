function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(40);
  colorMode(HSB, 255);

  x = width / 2;
  y = height / 2;
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

cnum = 255;

function draw() {
  background(0, 0, 255);
  cnum = cnum -= 10;
  y = y += random(8, 12);

  for (i = 0; i < 30; i++) {
    noStroke();
    fill(cnum, cnum, 255);
    ellipse(
      x + random(-2.5, 2.5) * i,
      y + random(-1.3, 1.3) * i,
      random(10, 20),
      random(10, 20)
    );
  }
}

function mousePressed() {
  cnum = 255;
  x = mouseX;
  y = mouseY;
}
function touchStarted() {
  cnum = 255;
  x = mouseX;
  y = mouseY;
}
