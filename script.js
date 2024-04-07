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
dnum = 8;
cnum = 255;
bnum = 255;

function draw() {
  background(0, 0, 0);
  cnum = cnum -= 6;
  bnum = bnum -= 5;
  dnum = dnum += 0.2 * dnum;
  y = y += 3;

  let xM = 1;

  for (i = 0; i < 14; i++) {
    stroke(100, 0, bnum);
    fill(cnum, 255, bnum);

    //56 ^ AJ;2u7wqa5u6Q733475bv2            we67   <-- a kitten did that

    ellipse(
      x + dnum * (i / 18) + xM * i,
      y + dnum * (i / 25) + xM * i,
      random(12, 18),
      random(12, 18)
    );
    ellipse(
      x - dnum * (i / 18) + xM * i,
      y + dnum * (i / 25) + xM * i,
      random(12, 18),
      random(12, 18)
    );
    ellipse(
      x - dnum * (i / 18) + xM * i,
      y - dnum * (i / 25) + xM * i,
      random(12, 18),
      random(12, 18)
    );
    ellipse(
      x + dnum * (i / 18) + xM * i,
      y - dnum * (i / 25) + xM * i,
      random(12, 18),
      random(12, 18)
    );

    xM = xM += i / 20;
  }
}

function mousePressed() {
  dnum = 4;
  bnum = 255;
  cnum = 255;
  x = mouseX;
  y = mouseY;
}
function touchStarted() {
  dnum = 4;
  bnum = 255;
  cnum = 255;
  x = mouseX;
  y = mouseY;
}
