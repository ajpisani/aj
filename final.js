// import a variable from another file in a way that is NOT for module scripts

document.getElementById("velDisplay");
let velFR = velDisplay;
velDisplay.innerHTML = velDisplay.innerHTML;

//nvm

// initialize and set value of mp which we will use to tell us when
//the mouse is pressed which will be useful later

let mp = false;

// declare some arrays, poo is for particles, keys is to keep
//track of how many keys (later midi notes) the user has pressed

let poo = [];
let keys = [];

// other stuff

let balls = [];
let mpBall = false;
let kpBall = false;

class Sand {
  constructor() {
    this.xBall = mouseX;
    this.yBall = mouseY;
    this.rBall = random(4, 7);
    this.xSpeedBall = random(-2, 2);
    this.ySpeedBall = 0.5 * this.r;
    this.velBall = 0.7;
    this.hueNumBall = floor(random(4));
  }

  pickColor = function () {
    if (this.hueNumBall == 0) {
      //orange
      this.hueBall = 15;
    }
    if (this.hueNum == 1) {
      //pink
      this.hueBall = 290;
    }
    if (this.hueNum == 2) {
      //blue
      this.hueBall = 150;
    }
  };

  makeSand = function () {
    fill(this.hueBall, 255, 255, 130);
    circle(this.xBall, this.yBall, this.rBall);
  };

  updateSand = function () {
    this.yBall += this.ySpeedBall + this.velBall;
    this.xBall += this.xSpeedBall;
    this.velBall += 0.25;
    //console.log(this.velBall);
  };

  bounceSand = function () {
    if (this.yBall > window.innerHeight - 40) {
      this.yBall = window.innerHeight - 41;
      this.ySpeedBall = -this.ySpeedBall - this.velBall;
      this.velBall = 0.2 * this.velBall;
      //console.log(`starting bounce ${balls.length}`);
    }
    if (this.x > window.innerWidth || this.x < 0) {
      this.xSpeedBall = -0.8 * this.xSpeedBall;
    }
  };
}

// setup function, runs once, used to set up a canvas

function setup() {
  createCanvas(window.innerWidth, window.innerHeight, WEBGL);
  frameRate(60);
  colorMode(HSB);
  background(0, 0, 0);
  velDisplay.innerHTML = "90";
}

// function to resize canvas

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight, WEBGL);
}

class numOfKeys {
  constructor() {
    // placeholder, idk if i actually need it but it is here
    // i just needed another array so
    this.something = "nothing";
  }
}

// particle class... very complicated

class Particles {
  constructor() {
    //x position (i want it to start in the center)
    //i also want the space they spread out to me linked to
    // the amount of keys pressed
    this.x = random(
      -(window.innerWidth / 12) * keys.length,
      (window.innerWidth / 12) * keys.length
    );

    //y position (i want this to start in the center too)
    // and same deal  with the number of keys so same equation

    this.y = random(
      -(window.innerHeight / 12) * keys.length,
      (window.innerHeight / 12) * keys.length
    );

    //x and y speed
    // genorates a random number that is used as the particles speed

    this.xSpeed = random(-2, 2);
    this.ySpeed = random(-3, -5);

    //alpha is like opacity. its values are between 0 and 1...
    // pretty sure its supposed to be between 0 and 255 but i guess not

    this.alpha = 0.01 * parseInt(velFR.innerHTML);

    // life span is for a couple of different things, its most important function is acting like a timer for each particle

    this.lifespan = 70;

    // this is the velocity. the particle will add the velocity to its postionSpeed (x or y)
    //and this value will be updated and

    this.velocity = random(1) * (0.001 * parseInt(velFR.innerText));

    // this.hue is for the color. HSB Color values take hue numbers between 1-300

    this.hue = random(1, 300);

    // this.sat is saturation. i use it to make the particles fade to white

    this.sat = 255;

    // this.b sets the brightness value

    this.b = 255;

    //this.r is the default radius

    this.r = random(4, 8);
  }

  //this function returns true when the lifespan reaches zero so the particle can be deleted

  death() {
    return this.lifespan < 0;
  }

  // this function is actually draws a circle

  showParticles() {
    noStroke();
    fill(this.hue, this.sat, this.b, this.alpha);
    circle(this.x, this.y, this.r * (0.05 * parseInt(velFR.innerText)));
  }

  // this function moves the circles

  updateParticles() {
    this.x -= this.xSpeed;
    this.y -= this.ySpeed + this.velocity;
    this.alpha -= 0.025;
    this.lifespan -= 1;
    this.sat -= 10;
    this.b -= 1;
    this.r += 0.5;
  }

  // this function updates the velocity making it act as an acceleration function

  updateVelocity() {
    this.velocity -= 0.2;
  }
}

// this function adds particles to the particle array (which i called poo)

runParticles = function () {
  pee = new Particles();
  poo.push(pee);
};

// this is the draw function, it is always looping

function draw() {
  // backhground always looping means the shapes wont leave a trail as they move

  background(0, 0, 0);

  // this is saying when mp is true, run the function  that adds particles to the poo array

  if (mp == true) {
    runParticles();
  }

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

  console.log(
    `Velocity = ${velFR.innerText},keys pressed = ${keys.length}, particles alive = ${poo.length}`
  );
}

// this function is for when a key is pressed. it makes mp = true and adds a "key" to the number of keys array
// it also wont let you hit more than 4 keys (for now) so the website doesnt explode

function keyPressed() {
  mp = true;
  let k = new numOfKeys();
  if (keys.length <= 7) {
    keys.push(k);
  }
}

// this function removes the keys from the array from the beginning which... should be fine
// it also makes mp = false
// mp is labled mp because this key pressed function was origninally for a mouse pressed function where the
// particles followed the mouse when you clicked... i changed it to random spots when keys are pressed as that is closer
// to playing keys  on a midi controller which is what i want to do and want to do soon

function keyReleased() {
  if (keys.length <= 1) {
    mp = false;
  }
  keys.splice(0, 1);
}
