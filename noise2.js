let dotsArray = [];
let strokeOpac = 1;
let sat = 300;
let strokeW = 2.3;
let kp = 0;

// function preload() {
//   img = loadImage("particles-single2.png");
// }

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  frameRate(30);
  colorMode(HSB);
}

class Dots {
  constructor() {
    this.x = window.innerWidth * noise(0.008 * frameCount);
    this.y = window.innerHeight * noise(0.0032 * frameCount);
    this.r = (window.innerHeight / 8) * noise(0.0015 * frameCount);
    this.h = 360 * noise(0.015 * frameCount);
    this.life = 1;
  }
  showDots() {
    fill(this.h, sat, 100);
    stroke(0, 0, 20, strokeOpac);
    strokeWeight(strokeW);
    circle(this.x, this.y, this.r);
  }

  updateDots() {
    this.life -= 1;
  }

  dotDeath() {
    return this.life < 0;
  }
}

runDots = function () {
  dotSystem = new Dots();
  dotsArray.push(dotSystem);
};

function draw() {
  if (kp == 0) {
    runDots();
    for (i = 0; i < dotsArray.length; i++) {
      dotsArray[i].updateDots();
      dotsArray[i].showDots();

      if (dotsArray[i].dotDeath()) {
        dotsArray.splice(i, 1);
      }
    }
  }
}

function mousePressed() {
  background(0, 0, random(10, 100));

  strokeOpac = random(0, 1);
  sat = random(20, 100);
  strokeW = random(1, 2.5);
}

function keyPressed() {
  if (kp == 0) {
    kp = 1;
    noLoop();
  } else {
    kp = 0;
    loop();
  }
  console.log(`key pressed = ${kp}`);
}
