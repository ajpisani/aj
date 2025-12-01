//getting all the html values
//this one is for the hue slider
document.getElementById("hueSlide");
document.getElementById("hueSlideText");

// add a listener for when the slider is changed, update the label's text so the user can see
hueSlide.addEventListener("input", function () {
  hueSlideText.innerText = hueSlide.value;
});

//initializing value so the display does not show "NaN" when it is first opened
hueSlide.value = 1;

//there are many of these..
//the next one is for the saturation slider
document.getElementById("satSlide");
document.getElementById("satSlideText");
satSlide.addEventListener("input", function () {
  satSlideText.innerText = satSlide.value;
});
satSlide.value = 100;

//brightness
document.getElementById("briSlide");
document.getElementById("briSlideText");
briSlide.addEventListener("input", function () {
  briSlideText.innerText = briSlide.value;
});
briSlide.value = 100;

// opacity which is see throughness
document.getElementById("opacSlide");
document.getElementById("opacSlideText");
opacSlide.addEventListener("input", function () {
  opacSlideText.innerText = opacSlide.value;
});
opacSlide.value = 1;

// radius for the shapes
document.getElementById("rSlide");
document.getElementById("rSlideText");
rSlide.addEventListener("input", function () {
  rSlideText.innerText = rSlide.value;
});
rSlide.value = 5;

// this is all for getting the checkbox for if the user wants to use random values for the listed attributes
document.getElementById("hueCheck");
document.getElementById("briCheck");
document.getElementById("sizCheck");
document.getElementById("opaCheck");

// this is the same thing as everything before it, the only difference is the capitol B infront of the same
// this is to indiciate that this is for editing the background color
// this is background hue
document.getElementById("BhueSlide");
document.getElementById("BhueSlideText");
BhueSlide.addEventListener("input", function () {
  BhueSlideText.innerText = BhueSlide.value;
});
BhueSlide.value = 0;

// background saturation
document.getElementById("BsatSlide");
document.getElementById("BsatSlideText");
BsatSlide.addEventListener("input", function () {
  BsatSlideText.innerText = BsatSlide.value;
});
BsatSlide.value = 0;

//background brightness
document.getElementById("BbriSlide");
document.getElementById("BbriSlideText");
BbriSlide.addEventListener("input", function () {
  BbriSlideText.innerText = BbriSlide.value;
});
BbriSlide.value = 78;

// this button is for the erase all. it is caalled "resetC" as it "resets the Canvas"
document.getElementById("resetC");
resetC.addEventListener("click", function () {
  //removes the pixes from the canvas
  pix.splice(0, pix.length);

  //just placed is here and does nothing right now
  //the plan is to make a redo feature as the undo one got a nice upgrade recently
  justPlaced.splice(0, justPlaced.length);

  //clear() erases the background
  clear();
});

//background opacity
// for some reason this only wants to gor from 0 to 1 so i changed the step on the slider as opoossed to making it on / off
document.getElementById("BopacSlide");
document.getElementById("BopacSlideText");
BopacSlide.addEventListener("input", function () {
  BopacSlideText.innerText = BopacSlide.value;

  // i cannot tell you where bO comes up again in this entire folder but
  // i just tried to deleter that and it stopped working
  // pareInt() makes BopacSldie.value an integer though once i realized background
  // opacity has to be a whole number either 0 or 1
  // i think
  bO = parseInt(BopacSlide.value);

  // and clear is here again because whenever there is not a constant background being drawn,
  // things will stay on the screen. this is an issue because if you're using a background that has 100% opacity,
  // it will bleed through so it is cleared
  // not needed anymore becasue backgorund is either 0% or 100% opacity
  clear();
});
BopacSlide.value = 1;

//this function stops the draw function it was useful before I made it so that only clikcing the canvas updstes values
//the button changes color though so it is cool
document.getElementById("loopa");
loopa.addEventListener("click", function () {
  if (loopx == true) {
    loopx = false;
    loopa.style.background = "red";
    noLoop();
  } else {
    loopx = true;
    loopa.style.background = "green";
    loop();
  }
});

//this is to get the slider value for the framerate
//changing the framerate is useful because lower frame rates add less pixels per second
//this can make the load easier on your computer and can has other useful things you can do with it
document.getElementById("frSlide");
document.getElementById("frSlideText");
frSlide.addEventListener("input", function () {
  frSlideText.innerText = frSlide.value;
});
frSlide.addEventListener("input", function () {
  frSlideText.innerText = frSlide.value;
});
frSlide.addEventListener("change", function () {
  fr = frSlide.value;
  frameRate(1 * fr);
});
let fr = 60;

//this is for entering your screen size or entering the canvas size
document.getElementById("wInput");
document.getElementById("wInputText");
document.getElementById("hInput");
document.getElementById("hInputText");
wInput.addEventListener("input", function () {
  wInputText.innerText = wInput.value;
});
hInput.addEventListener("input", function () {
  hInputText.innerText = hInput.value;
});

//button to resize canvas when resolution is chosen
document.getElementById("resizeB");
resizeB.addEventListener("click", function () {
  resizeCanvas(wInput.value, hInput.value);
  pix.splice(0, pix.length);
});

//this button saves your drawing to a png
//i chose png because of the option to have clear backgrounds
document.getElementById("saveC");
saveC.addEventListener("click", function () {
  saveCanvas(tc, "myDrawing", "png");
});

//these are the check boxes for choosing the "pixel shape"
//it is set up like this so expansion is easier
document.getElementById("circlCheck");
circlCheck.addEventListener("change", function () {
  squarCheck.checked = false;
});
document.getElementById("squarCheck");
squarCheck.addEventListener("change", function () {
  circlCheck.checked = false;
});
circlCheck.checked = true;

//this button resizes the canvas to the inner width and inner height of the window
document.getElementById("resizeBD");
resizeBD.addEventListener("click", function () {
  resizeCanvas(window.innerWidth, window.innerHeight);
});

//this is the textbox for the radius for the brush and it updates as you type
document.getElementById("enterSiz");
let enteredSiz = enterSiz.value;
enterSiz.addEventListener("input", function () {
  enteredSiz = enterSiz.value;
  rSlide.value = enteredSiz;
  rSlideText.innerText = enteredSiz;
});

//initializing values, i willl explain them as they come up
let tc;
let bO;
let loopx = true;
let pix = [];
let justPlaced = [];
let mp = false;
let kp = false;
let mappedHue;
let hueDisplay;
let mappedBri;
let mappedSiz;
let mappedOpa;
let mHD;
let imInTheLines = false;
let hueBrush = hueSlide.value;
let satBrush = satSlide.value;
let briBrush = briSlide.value;
let opacBrush = opacSlide.value;
let rBrush = rSlide.value;

//this is a p5 specific funtion for setting up the canvas
//setup() is a function that runs once as opposed to draw() which we will get into later
function setup() {
  //create a canvas the size of the users window
  tc = createCanvas(window.innerWidth, window.innerHeight);

  //set the framerate to 60
  frameRate(60);

  //set the color mode to HueSaturationBrightness so changing the color is easier.. for.. the user..
  colorMode(HSB);

  //make the pixels have no outline
  noStroke();

  //this updates a value to tell the computer if the user is clicking oover the canvas or just changing values
  //this is so noise values do not update while you are changing the brush size or color
  tc.mouseOver(() => (imInTheLines = true));
  tc.mouseOut(() => (imInTheLines = false));
}

//function at sets the imInTheLines as true when it is called
function areYouInTheLines() {
  imInTheLines = true;
}

//this function resizes the window to the user's window's width and height when called
function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

//this is the class for making pixels
class Pixels {
  constructor() {
    //all variables are abbriviated versions of what their values are being used for
    this.shape = "string";
    this.x = mouseX;
    this.y = mouseY;
    this.z = 0;
    this.sat = satSlide.value;
    this.bri = briSlide.value;
    this.opac = opacSlide.value;
    this.r = rSlide.value;

    //this function checks if the random hue feature is toggled
    if (hueCheck.checked == false) {
      //if not use the slider value
      this.hue = hueSlide.value;
    } else {
      //if so, use a random value based on noise
      let hue1 = 360 * noise(0.09 * frameCount);

      //remap the values to tweak them to my liking, i kept getting numbers in the middle
      //so i moved the min and max values up and down so i could get more coloes more often
      mappedHue = map(hue1, 0, 360, -100, 450);

      //map it back before.. displaying.. the hue value number..
      //uuuuuuuh okay i must fix this eventually
      hueDisplay = map(mappedHue, -100, 450, 0, 360);
      this.hue = mappedHue;
    }

    //similar thing foot the brightness value
    if (briCheck.checked == false) {
      this.bri = briSlide.value;
    } else {
      let bri1 = 10 * noise(0.35 * frameCount);
      mappedBri = map(bri1, 0, 10, 0, 175);
      this.bri = mappedBri;
    }

    //this is similar but it is based off the size of the entered size of the brush unlike the others
    //which have nothing to do with the previous entered values
    if (sizCheck.checked == false) {
      this.r = rSlide.value;
    } else {
      let siz1 = rSlide.value * noise(0.5 * frameCount);
      mappedSiz = siz1;
      this.r = siz1;
    }

    //random opacity. must be between 0 and 1
    if (opaCheck.checked == false) {
      this.opac = opacSlide.value;
    } else {
      let opa1 = 100 * noise(0.3 * frameCount);
      mappedOpa = map(opa1, 0, 100, 0.1, 1);
      this.opac = mappedOpa;
    }

    //this funtion checks what shape is checked and makes the string the shape incase you want to use that for anything
    if (circlCheck.checked == true) {
      this.shape = "circle";
    } else if (squarCheck.checked) {
      this.shape = "square";
    }
  }

  //this function tells the computer what kind of pixel / shape to add. like size and color and shape.
  showPixel() {
    fill(this.hue, this.sat, this.bri, 1 * this.opac);
    if (this.shape == "circle") {
      circle(this.x, this.y, this.r);
    } else if (this.shape == "square") {
      square(this.x - 0.5 * this.r, this.y - 0.5 * this.r, this.r);
    }
  }
}

//this function adds the pixels to the array
//it was very frustrating as you can tell by what i named it
function runPixels() {
  //a variable to represent creating a new pixel
  imAnnoyed = new Pixels();

  //push the new pixel to the array called "pix" or pix = [];
  pix.push(imAnnoyed);

  //also add it to the justPlaced array
  justPlaced.push(imAnnoyed);

  //this pushes the length of the array to this.z
  //this is useful for keeping track of what pixel this is incase
  //i decide to do anything with that in the future
  //just placed and this.z do nothing as of right now but they are
  //useful for expansion though!
  this.z = justPlaced.length;
}

//this function removes all the pixels from the array
function removePix() {
  pix.splice(pix.length - 1, 1);
  justPlaced.splice(justPlaced.length - 1, 1);
}

//this function keeps justPlaced a certain size
//again it doesnt do anything but this is here for when i made a redo feature
function justPlacedSizeConst() {
  //check if justPlaced array is too big
  if (justPlaced.length >= 1000) {
    //if it is, remove stuff from the front / beginning of the array
    justPlaced.splice(0, 1);
  }
}

//the draw function is a p5 function that is always looping
function draw() {
  //clear clears the background incase the user is using a clear background or clearish brush colors
  clear();

  //set the background hue, saturation, brightness, and opacity values to those of the corrosponding sliders
  background(BhueSlide.value, BsatSlide.value, BbriSlide.value, bO);

  //this function says if the mouse is pressed, AND, the mouse is over the canvas,
  if (mp == true && imInTheLines == true) {
    //run the function that adds pixels to the pixels array
    runPixels();
  }

  //if a key is pressed
  if (kp == true) {
    //and if that key is the "r" key
    if (key == "r") {
      //check if the last placed thing in the justPlaced array is a pixel, and if it's a pixel,
      if (justPlaced[justPlaced.length - 1] instanceof Pixels) {
        //run the function to remove it... it will always be a pixel...
        //this used to do other things too but changed when things got reworked
        //that is why the removing pixels function is more complicated than it needs to be
        removePix();
      }
    }
  }

  //this function is needed to make things in arrays show.
  //it says for every pixel,
  for (i = 0; i < pix.length; i++) {
    //for that pixel, show a pixel
    pix[i].showPixel();
  }

  //if the hueChecked check box is checked
  if (hueCheck.checked == true) {
    //make the slider follow the noise value
    hueSlide.value = mappedHue;

    //then, round that value, then display it for the user
    hueSlideText.innerText = Math.round(hueDisplay);
  }

  //same for the random brightness
  if (briCheck.checked == true) {
    briSlide.value = mappedBri;
    briSlideText.innerText = Math.round(mappedBri);
  }

  //similar for the random size but you have to include the original size the random size is based
  //off of so the user knows what they entered
  if (sizCheck.checked == true) {
    rSlideText.innerText = `${rSlide.value}${" --> "}${Math.round(mappedSiz)}`;
  }

  //same as hue and brightness for opacity
  if (opaCheck.checked == true) {
    opacSlide.value = mappedOpa;
    opacSlide.innerText = Math.round(mappedOpa);
  }

  //call the function to limit justPlaced's size. it is in draw so it always checks
  justPlacedSizeConst();

  //this code is for the brush preview so you don't have to gamble every time you want to add a small dot
  hueBrush = hueSlide.value;
  satBrush = satSlide.value;
  briBrush = briSlide.value;
  opacBrush = opacSlide.value;

  //if the random size is checked, make the preview brush the same random size
  if (sizCheck.checked == true) {
    rBruhs = mappedSiz;
  } else {
    rBrush = rSlide.value;
  }

  //this makes the brush preview the shape that is actually going to be placed
  // it is set up as multiple if statements as opposed to if else for easy exansion
  if (squarCheck.checked == true) {
    fill(hueBrush, satBrush, briBrush, opacBrush);
    square(mouseX - 0.5 * rBrush, mouseY - 0.5 * rBrush, rBrush);
  }
  if (circlCheck.checked == true) {
    fill(hueBrush, satBrush, briBrush, opacBrush);
    circle(mouseX, mouseY, rBrush);
  }
}

//when the mouse is pressed, make the variable "mp" true
function mousePressed() {
  mp = true;
}

//when it is released, make the varibale "mp" false
function mouseReleased() {
  mp = false;
}

//when a key is pressed, make the variable "kp" true
function keyPressed() {
  kp = true;
}

//when a key is released, make the varibale "kp" false
function keyReleased() {
  kp = false;
}

//this is here to make it woork on your phone but it really just doesnt
// now instead of doing nothing, it is just near impossible to draw anything correctly
//anyway, when the screen is touched, make "mp" true. this is the same value inside the mousePressed() function
function touchStarted() {
  mp = true;
}

//when touch is released, make "mp" false
function touchEnded() {
  mp = false;
}
