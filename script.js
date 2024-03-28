// heres a line that moves up and down the screen

// creating the canvas

function setup() {
  createCanvas(600, 600);
  frameRate(30);
}

// initialization of xnum and ynum (pooploop was juts for figuring shit out)

let xnum = 1;
let ynum = 1;
let zanum = 1;
let zbnum = 1;
let zcnum = 1;
let xxnum = 1;
let xynum = 1;

pooploop = true;

// function for the line

function draw() {
  background(110);

  // the function to make the line move back and forth!

  xnum = xnum += ynum;

  if (xnum == 600) {
    ynum = -1;
  }
  if (xnum == 0) {
    ynum = 1;
  }

  xxnum = Math.floor(Math.random() * 100) + 95;
  xynum = Math.floor(Math.random() * 4) + 1;

  // the function that changes the color

  // to tell you if the loop is running or not (again, obsolete now that it works)

  console.log(pooploop);

  //outer color / color

  stroke(zanum, zbnum, zcnum);
  fill(zcnum, zbnum, zanum);

  // the line positon (staring x, starting y, ending x, ending y)

  ellipse(xnum, xnum, 20 + xynum, 30 + xynum);
}

// mouse / pressing functions

function mousePressed() {
  pooploop = false;
  noLoop();
}

function mouseReleased() {
  pooploop = true;
  loop();
}

// random color on keychange function

function keyPressed() {
  zanum = Math.floor(Math.random() * 255) + 1;
  zbnum = Math.floor(Math.random() * 255) + 1;
  zcnum = Math.floor(Math.random() * 255) + 1;
  console.log(zanum, zbnum, zcnum);
}
