// way of import a variable from another file in a way that is NOT for module scripts
//in this case i am doing it through HTML text on screen on the website

document.getElementById("velDisplay");
document.getElementById("mNumsPressed");
document.getElementById("frameSlider");
document.getElementById("velSlider");
document.getElementById("velSliderD");
document.getElementById("FSbutton");
FSbutton.style.background = "darkred";
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
document.getElementById("avgD");
document.getElementById("avgVelD");
document.getElementById("rangeDisplay");
document.getElementById("particleBufferSlider");
document.getElementById("particleBufferSliderD");
particleBufferSlider.addEventListener("input", function () {
  particleBufferNum = particleBufferSlider.value;
  particleBufferSliderD.innerHTML = particleBufferSlider.value;
});
particleBufferSlider.value = 3;

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
let totalVel;
let countVel;
let avgVel;
let newVel;
let newVelNum;
let particleCtrl = 0;
let particleBufferNum = 3;

// declare some arrays, poo is for particles, keys is to keep
//track of how many keys (later midi notes) the user has pressed

let poo = [];
let keys = [];
let mNums = [];
let newNumPos = [];
let numsKB = [];
let lazerPix = [];

//preload the image of a particle

function preload() {
  img = loadImage("particles-single.png");
}

// setup function, runs once,often used to set up the canvas

function setup() {
  createCanvas(window.innerWidth / 4, window.innerHeight / 4);
  fr = 60;
  frameRate(fr);
  colorMode(HSB);
  background(0, 0, 0);
  imageMode(CENTER);
}

// function to resize canvas if the window is resized

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
    FSbutton.style.background = "darkred";
  }
});

// code for the pause button

Pbutton.addEventListener("click", function () {
  if (pb == false) {
    noLoop();
    pb = true;
    Pbutton.style.background = "darkred";
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

// particle class... [EDIT: Not] very complicated

class Particles {
  constructor() {
    // note Velocity, i map it between 1 and 2 because when multiplying x and y speed with it, it keeps things more consistant
    //changing the range from 1-127 to 1-2 leaves for less drastic changes between playing differernt note length

    this.velNote = map(parseInt(avgVel), 1, 127, 1, 2.5) / fsCtrl;

    //x position (i want it to start in the center)
    //i also want the space they spread out to me linked to
    // the amount of keys pressed

    this.x =
      mappedX / fsCtrl +
      (((10 * round(random(-1, 1)) * range) / 1.15) *
        noise(0.0125 * range * frameCount)) /
        1.15;

    //y position (i want this to start in the center too)
    // and same deal  with the number of keys so same equation

    this.y = window.innerHeight / 1.5 / fsCtrl;
    //  -64 * keys.length * noise(0.0125 * keys.length * frameCount);

    //x and y speed
    // genorates a random number that is used as the particles speed

    this.xSpeed = (random(-3, 3) * 0.03 * avgVel) / fsCtrl;
    this.ySpeed = (random(4, 6) * 0.035 * avgVel) / fsCtrl;

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

    this.r = random(1, 4) * this.velNote * 3 * keys.length;
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
  //  tint(this.hue, 255, 255, this.alpha);
  //  image(img, this.x, this.y, this.r, this.r);

    // old code from when they used to be circles

     noStroke();
     fill(this.hue, this.sat, this.b, this.alpha);
     circle(this.x, this.y, this.r * 1) //(0.005 * parseInt(velFR.innerText)));
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
    this.r -= 1.5;
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

// FireWork Effects Class

// or lazers... theyre supposed to be lazers but

class Lazers {
  constructor(){

      this.velNote = map(parseInt(avgVel), 1, 127, 1, 2.5) / fsCtrl;

      this.x = 

      mappedX / fsCtrl +
      (((10 * round(random(-1, 1)) * range) / 1.15) *
        noise(0.0125 * range * frameCount)) /
        1.15; 

      this.y = window.innerHeight / 1.5 / fsCtrl;
      this.z = (random(5,15) + (2.5*this.velNote))
      this.lifespan = 80
      this.history = []
      this.zHistory = []
      this.alphaHistory = []
      this.satHistory = []
      this.alpha = 1
      this.hue = round(random(0 , 300))
      this.direction = createVector( 
          random(-2.9,2.9),
          random(-2.9,2.9)
       )
      this.sat = random(200,255)
  }

      //update function
  
      updateCircle(){            
          this.x += this.direction.x*(0.01*this.velNote) + ( round(this.direction.x) * 4.2) * noise(0.1*this.direction.x * frameCount)
          this.y += this.direction.y + ( round(this.direction.y) * 4.2) * noise(0.1*this.direction.y * frameCount)
          this.z += (-.5*this.z)+(this.z * noise(0.05+frameCount))
          this.lifespan -= this.z
          if(this.lifespan <= 0){
              this.alpha -= .05
          }
          var posV = createVector(this.x, this.y)
          var z = this.z
          var satL = this.sat
          this.history.push(posV)
          this.zHistory.push(z)
          this.satHistory.push(satL)
          this.alphaHistory.push(this.alpha)
          if (this.history.length > 100){
          this.history.splice(0,1)
          this.zHistory.splice(0,1)
          this.satHistory.splice(0,1)
          }
          // must loop for circle trail
          for(let i =0; i < this.history.length; i++){
          this.alphaHistory[i] -= .07
          this.satHistory[i] -= 25
          }
      }

  showCircle(){
      noStroke()
      fill(this.hue, 180, 200, this.alpha)
      circle(this.x, this.y, this.z)
      // loop for trail
      for(let i =0; i < this.history.length; i++){
          var pos = this.history[i];
          var zPos = this.zHistory[i]
          var aPos = this.alphaHistory[i]
          var sPos = this.satHistory[i]
          fill(this.hue,sPos,200, (aPos))
          circle(pos.x, pos.y, zPos);
      }  
  }

//kill circle

  killCircle(){
      if (this.lifespan < 0 && this.alpha < 0){
          lazerPix.splice(i, 1)
      }
  }
}

// function to make lazers

function runDots(){
dot = new Lazers
lazerPix.push(dot)
}







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
  newNumPos.sort((a, b) => a - b);

  // same for the velocity

  newVel = velFR.innerText.split(",");
  newVelNum = newVel.map(Number);

  // this next function will be the average of the note nums in the arrays

  total = 0;
  count = 0;
  mNumMin = 0;
  mNumMax = 0;
  for (i = 0; i < newNumPos.length; i++) {
    total += newNumPos[i];
    count = newNumPos.length;
    mNumMin = newNumPos[0];
    mNumMax = newNumPos[numPos.length - 1];
  }
  avg = round(total / count, 1);
  range = (mNumMax - mNumMin) / fsCtrl;

  //same for the velocity, range is not needed though.

  totalVel = 0;
  countVel = 0;
  for (i = 0; i < newVelNum.length; i++) {
    totalVel += newVelNum[i];
    countVel = newVelNum.length;
  }
  avgVel = round(totalVel / countVel, 1);

  //functions that always run which display the averges being used

  avgD.innerHTML = `&nbsp;&nbsp;|&nbsp;&nbsp;Average: ${avg}`;
  avgVelD.innerHTML = `&nbsp;&nbsp;|&nbsp;&nbsp;Average: ${avgVel}`;
  if (range > 0.01) {
    rangeDisplay.innerHTML = `${range * fsCtrl} Semitones`;
  } else {
    rangeDisplay.innerHTML = "";
  }

  // this is saying when mp is true, run the function  that adds particles to the poo array
  // it is set to 1 ms delay as there is a small amount of time taken for the "avg" to be defines
  //this created a bug where whenever you first pushed a key, no matter where the key was pressed
  // a particle showed up at the maps default position of the lowest possible MAPPED value
  // in my case this was "0.15 * window.innerWidth"
  // by delaying the visuals, it MOSTLY fixes the issue and does not effect user experience negatively

  particleCtrl += 1;
  if (particleCtrl >= particleBufferNum) {
    particleCtrl = 0;
  }

  if (mp == true && particleCtrl <= 1) {
    if (spawnCtrl <= 29) {
      setTimeout(function () {
        runParticles();
        runDots()
      }, 0);
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

  for (i=0; i < lazerPix.length; i++){
    lazerPix[i].showCircle();
    lazerPix[i].updateCircle();
    lazerPix[i].killCircle();
}

  //this is for making the values in the numsKeyBoard(numsKB) array and putting them in the array used for visuals

  // for (i = 0; i < numsKB.length; i++) {
  //   mNumsPressed.push(numsKB[i]);
  //   numsKB.splice(i, 1);
  // }

  //nvm it didnt work, therefor I will try this

  if (numsKB.length > 0) {
    mNumsPressed.innerHTML = numsKB;
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
  for(i=0;i<=(15 / particleBufferNum);i++){
    runDots()}

  if (keys.length <= 7) {
    keys.push(k);
  }
  if (key == "a") {
    numsKB.push(1);
  }
  if (key == "s") {
    numsKB.push(15);
  }
  if (key == "d") {
    numsKB.push(29);
  }
  if (key == "f") {
    numsKB.push(43);
  }
  if (key == "g") {
    numsKB.push(57);
  }
  if (key == "h") {
    numsKB.push(71);
  }
  if (key == "j") {
    numsKB.push(85);
  }
  if (key == "k") {
    numsKB.push(99);
  }
  if (key == "l") {
    numsKB.push(113);
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
  if (key == "a") {
    numsKB.splice(numsKB[i], 1);
  }
  if (key == "s") {
    numsKB.splice(numsKB[i], 1);
  }
  if (key == "d") {
    numsKB.splice(numsKB[i], 1);
  }
  if (key == "f") {
    numsKB.splice(numsKB[i], 1);
  }
  if (key == "g") {
    numsKB.splice(numsKB[i], 1);
  }
  if (key == "h") {
    numsKB.splice(numsKB[i], 1);
  }
  if (key == "j") {
    numsKB.splice(numsKB[i], 1);
  }
  if (key == "k") {
    numsKB.splice(numsKB[i], 1);
  }
  if (key == "l") {
    numsKB.splice(numsKB[i], 1);
  }
  keys.splice(0, 1);
}
