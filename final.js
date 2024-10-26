// import a variable from another file in a way that is NOT for module scripts

document.getElementById("velDisplay");
document.getElementById("mNumsPressed");
document.getElementById("frameSlider");
document.getElementById("velSlider");
document.getElementById("velSliderD");
document.getElementById("FSbutton");
FSbutton.style.background = "red";
let velFR = velDisplay;
velDisplay.innerHTML = velDisplay.innerHTML;
let numFR = mNumsPressed;
numFR.innerText = numFR.innerText;
let fr = parseInt(frameSlider.value);
frameSlider.addEventListener("change", function () {
  fr = parseInt(frameSlider.value);
  frameRate(fr);
});
velSlider.addEventListener("input", function () {
  velDisplay.innerHTML = velSlider.value;
  velSliderS.innerText = velSlider.value;
});
document.getElementById("Pbutton");
Pbutton.style.background = "green";

// initialize and set value of mp which we will use to tell us when
//the mouse is pressed which will be useful later

let mp = false;
let fsb = false;
let pb = false;
let img;
let numPos;
let avg;
let total;
let count;
let mappedX;
let spawnCtrl = 0;
let fsCtrl = 1;
let mNumMin;
let mNumMax;
let range = 0;

// declare some arrays, poo is for particles, keys is to keep
//track of how many keys (later midi notes) the user has pressed

let poo = [];
let keys = [];
let mNums = [];
let newNumPos = [];

//preload the image

function preload() {
  img = loadImage("particles-single.png");
}

// setup function, runs once, used to set up a canvas

function setup() {
  createCanvas(window.innerWidth / 4, window.innerHeight / 4);
  fr=60
  frameRate(fr);
  colorMode(HSB);
  background(0, 0, 0);
  imageMode(CENTER);
  velDisplay.innerHTML = "90";
}

// function to resize canvas

function windowResized() {
  if (fsb == true) {
    resizeCanvas(window.innerWidth, window.innerHeight);
  }
  if (fsb == false) {
    resizeCanvas(window.innerWidth / 4, window.innerHeight / 4);
  }
}

// code for the full screen button
// it does not resize the visuals though, nor improve performance...
// it is pretty useless now but i plan on doing more with it

FSbutton.addEventListener("click", function () {
  if (fsb == false) {
    resizeCanvas(window.innerWidth, window.innerHeight);
    fsb = true;
    FSbutton.style.background = "green";
  } else {
    resizeCanvas(window.innerWidth / 4, window.innerHeight / 4);
    fsb = false;
    FSbutton.style.background = "red";
  }
});
Pbutton.addEventListener("click", function () {
  if (pb == false) {
    noLoop();
    pb = true;
    Pbutton.style.background = "red";
  } else {
    loop();
    pb = false;
    Pbutton.style.background = "green";
  }
});


class numOfKeys {
  constructor() {
    // placeholder, idk if i actually need it but it is here
    // i just needed another array so
    // i do not need it, it does what i want it to but more complicated, i will leave it for now
    this.something = "nothing";
  }
}

// particle class... very complicated

class Particles {
  constructor() {
    // note Velocity, i map it between 1 and 2 because when multiplying x and y speed with it, it keeps things more consistant
    //changing the range from 1-127 to 1-2 leaves for less drastic changes between playing differernt note length

    this.velNote = map(parseInt(velFR.innerText), 1, 127, 1, 2.5) / fsCtrl;

    //x position (i want it to start in the center)
    //i also want the space they spread out to me linked to
    // the amount of keys pressed

    this.x = mappedX / fsCtrl + 10*round(random(-1,1))*range/1.15* noise(0.0125*range * frameCount)/1.15

    //y position (i want this to start in the center too)
    // and same deal  with the number of keys so same equation

    this.y = window.innerHeight / 1.5 / fsCtrl;
    //  -64 * keys.length * noise(0.0125 * keys.length * frameCount);

    //x and y speed
    // genorates a random number that is used as the particles speed

    this.xSpeed = (random(-3, 3) * 0.03 * velFR.innerText) / fsCtrl;
    this.ySpeed = (random(4, 6) * 0.035 * velFR.innerText) / fsCtrl;

    //alpha is like opacity. its values are between 0 and 1...
    // pretty sure its supposed to be between 0 and 255 but i guess not

    this.alpha = 0.415 * this.velNote * fsCtrl;

    // life span is for a couple of different things, its most important function is acting like a timer for each particle

    this.lifespan = 100;

    // this is the velocity. the particle will add the velocity to its postionSpeed (x or y)
    //and this value will be updated and

    this.velocity = random(0.1, 0.2) * 0.5 * this.velNote;

    // this.hue is for the color. HSB Color values take hue numbers between 1-300

    this.hue = random(1, 300);

    // this.sat is saturation. i use it to make the particles fade to white

    this.sat = 255;

    // this.b sets the brightness value

    this.b = 255;

    //this.r is the default radius

    this.r = random(1, 4) * this.velNote * 8 * keys.length;
  }

  //this function returns true when the lifespan reaches zero so the particle can be deleted

  death() {
    return this.lifespan < 0;
  }

  //this function changed mappedX to make where the particles genorate

  mapTheX() {
    mappedX = map(
      avg,
      0,
      127,
      0 + window.innerWidth * 0.15,
      window.innerWidth - window.innerWidth * 0.15
    );
  }

  // this function is actually draws a circle

  showParticles() {
    tint(this.hue, 255, 255, this.alpha);
    image(img, this.x, this.y, this.r, this.r);

    // old code from when they used to be circles

    // noStroke();
    // fill(this.hue, this.sat, this.b, this.alpha);
    // circle(this.x, this.y, this.r * (0.05 * parseInt(velFR.innerText)));
  }

  // this function moves the circles and makes them fade and get bigger and all that

  updateParticles() {
    this.velocity += 0.01 * this.velNote;
    this.ySpeed -= this.velocity;
    this.x -= this.xSpeed;
    this.y -= this.ySpeed;
    this.alpha -= 0.01;
    this.lifespan -= 1;
    this.sat -= 5;
    this.b -= 0.5;
    this.r += this.velNote;
  }

  fullscreen() {
    if (fsb == false) {
      fsCtrl = 4;
    }
    if (fsb == true) {
      fsCtrl = 1;
    }
  }
}

// this function adds particles to the particle array (which i called poo)

runParticles = function () {
  pee = new Particles();
  poo.push(pee);

  // this function makes a number that counts up to 2, then resets. this is to limit the amount of circles generated per second which hopefully improves performance

  spawnCtrl += 1;
  if (spawnCtrl == 30) {
    spawnCtrl = 0;
  }
};

// this is the draw function, it is always looping

function draw() {
  // clears the background (mostly for add color blend mode)

  clear();

  // backhground always looping means the shapes wont leave a trail as they move

  background(0, 0, 0);

  // blend mode for color

  blendMode(ADD);

  // this function will take the string value of the text of the nums pressed on the html
  //and it will turn it back into an array for me

  numPos = numFR.innerText.split(",");
  newNumPos = numPos.map(Number);

  // this next function will be the average of the note nums in the arrays

  total = 0;
  count = 0;
  mNumMin = 0
  mNumMax = 0
  for (i = 0; i < newNumPos.length; i++) {
    total += newNumPos[i];
    count = newNumPos.length;
    mNumMin = numPos[0]
    mNumMax = numPos[numPos.length-1]
  }
  avg = total / count;
  range = mNumMax - mNumMin

  // this is saying when mp is true, run the function  that adds particles to the poo array
  // it is set to 1 ms delay as there is a small amount of time taken for the "avg" to be defines
  //this created a bug where whenever you first pushed a key, no matter where the key was pressed
  // a particle showed up at the maps default position of the lowest possible MAPPED value
  // in my case this was "0.15 * window.innerWidth"
  // by delaying the visuals, it MOSTLY fixes the issue and does not effectr user experience negatively

  if (mp == true) {
    if (spawnCtrl <= 29) {
      setTimeout(function(){      
        runParticles();
        },
      0)
    }
  }

  // this "aj variable is for getting the amount of keys pressed into a number"
  let aj = parseInt(numFR.innerText);
  mNums.push(aj);

  // uuuuuuuh okay so its a for loop that loops as long as the particle array is....
  // and it... has the SomeArray.runSomeFunctionsInThatArray so that is about as much as i know about that

  for (i = 0; i < poo.length; i++) {
    poo[i].fullscreen();
    poo[i].showParticles();
    poo[i].mapTheX();
    poo[i].updateParticles();

    // this if function thing is to remove particles once they have returned the true value from the death function :0
    if (poo[i].death()) {
      poo.splice(i, 1);
    }
  }

  //console.log(
  //`Velocity = ${velFR.innerText},keys pressed = ${keys.length}, particles alive = ${poo.length}`
  //);
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
