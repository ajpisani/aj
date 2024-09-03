let poo = [];
let mappedX;
let mappedY;

function preload() {
  img = loadImage("particles-single2.png");
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight, WEBGL);
  frameRate(60);
  colorMode(HSB);
}

class Particles {
  constructor() {
    //x position (i want it to start in the center)
    //i also want the space they spread out to me linked to
    // the amount of keys pressed
    this.x = mappedX + 40 * noise(0.025 * frameCount) - 35;

    //y position (i want this to start in the center too)
    // and same deal  with the number of keys so same equation

    this.y = mappedY + random(-1, 1) - 20;

    //x and y speed
    // genorates a random number that is used as the particles speed

    this.xSpeed = 4 * noise(0.0015 * frameCount);
    this.xSpeedMap = map(this.xSpeed, 0, 4, -4, 4);
    this.ySpeed = random(3, 5);

    //alpha is like opacity. its values are between 0 and 1...
    // pretty sure its supposed to be between 0 and 255 but i guess not

    this.alpha = random(0, 0.55);

    // life span is for a couple of different things, its most important function is acting like a timer for each particle

    this.lifespan = 145;

    // this is the velocity. the particle will add the velocity to its postionSpeed (x or y)
    //and this value will be updated and

    this.velocity = random(-0.1, 0.1) * 0.014;

    // this.hue is for the color. HSB Color values take hue numbers between 1-300

    //gravity

    this.grav = 0.004;

    //color

    this.hue = random(1, 40);

    // this.sat is saturation. i use it to make the particles fade to white

    this.sat = 100;

    // this.b sets the brightness value

    this.b = 120;

    //this.r is the default radius

    this.r = random(40, 60);

    // saturation level

    this.sat = 100;

    // brightness level

    this.bright = 100;
  }

  //this function returns true when the lifespan reaches zero so the particle can be deleted

  death() {
    return this.lifespan < 0;
  }

  // this function is actually draws a circle

  showParticles() {
    // noStroke();
    // fill(this.hue, this.sat, this.b, this.alpha);
    // circle(this.x, this.y, this.r * (0.05 * parseInt(velFR.innerText)));

    tint(this.hue, this.sat, this.bright, this.alpha);
    imageMode(CENTER);
    image(img, this.x, this.y, this.r * 1.4, this.r);
  }

  // this function moves the circles

  updateParticles() {
    this.x += this.xSpeedMap;
    this.y -= this.ySpeed + this.velocity;

    this.lifespan -= 1;
    this.b -= 1;
    this.r += 0.45;
    this.hue -= 8;
    if (this.bright >= 4) {
      this.bright -= 2;
    }

    // console.log(poo.length);
  }

  // this function updates the velocity making it act as an acceleration function

  updateVelocity() {
    this.velocity -= this.grav;
  }
}

class Fire {
  constructor() {
    this.xF = mappedX + random(-15, 15);
  }
}

// this function adds particles to the particle array (which i called poo)

runParticles = function () {
  pee = new Particles();
  poo.push(pee);
};

// this is the draw function, it is always looping

function draw() {
  // clears the background (mostly for add color blend mode)

  clear();

  // backhground always looping means the shapes wont leave a trail as they move

  background(0, 0, 78);

  // blend mode for color

  // blendMode(REPLACE);

  // x & y mapping

  mappedX = map(
    mouseX,
    0,
    window.innerWidth,
    -window.innerWidth / 2,
    window.innerWidth / 2
  );
  mappedY = map(
    mouseY,
    0,
    window.innerHeight,
    -window.innerHeight / 2,
    window.innerHeight / 2
  );

  runParticles();

  // uuuuuuuh okay so its a for loop that loops as long as the particle array is....
  // and it... has the SomeArray.runSomeFunctionsInThatArray so that is about as much as i know about that

  for (i = 0; i < poo.length; i++) {
    poo[i].updateVelocity();
    poo[i].updateParticles();
    poo[i].showParticles();

    // this if function thing is to remove particles once they have returned the true value from the death function :0

    if (poo[i].death()) {
      poo.splice(i, 1);
    }
  }

  //console.log(
  //`Velocity = ${velFR.innerText},keys pressed = ${keys.length}, particles alive = ${poo.length}`
  //);
}
