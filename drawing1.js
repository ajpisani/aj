document.getElementById("hueSlide");
hueSlide.addEventListener("input", function () {
  hueSlideText.innerText = hueSlide.value;
});
hueSlide.value = 1;
document.getElementById("hueSlideText");
document.getElementById("satSlide");
document.getElementById("satSlideText");
satSlide.addEventListener("input", function () {
  satSlideText.innerText = satSlide.value;
});
satSlide.value = 100;
document.getElementById("briSlide");
document.getElementById("briSlideText");
briSlide.addEventListener("input", function () {
  briSlideText.innerText = briSlide.value;
});
briSlide.value = 100;
document.getElementById("opacSlide");
document.getElementById("opacSlideText");
opacSlide.addEventListener("input", function () {
  opacSlideText.innerText = opacSlide.value;
});
opacSlide.value = 1;
document.getElementById("rSlide");
document.getElementById("rSlideText");
rSlide.addEventListener("input", function () {
  rSlideText.innerText = rSlide.value;
});
rSlide.value = 5;

document.getElementById("hueCheck");
document.getElementById("briCheck");
document.getElementById("sizCheck");

document.getElementById("BhueSlide");
BhueSlide.addEventListener("input", function () {
  BhueSlideText.innerText = BhueSlide.value;
});
BhueSlide.value = 0;
document.getElementById("BhueSlideText");
document.getElementById("BsatSlide");
document.getElementById("BsatSlideText");
BsatSlide.addEventListener("input", function () {
  BsatSlideText.innerText = BsatSlide.value;
});
BsatSlide.value = 0;
document.getElementById("BbriSlide");
document.getElementById("BbriSlideText");
BbriSlide.addEventListener("input", function () {
  BbriSlideText.innerText = BbriSlide.value;
});

BbriSlide.value = 78;
document.getElementById("resetC");
resetC.addEventListener("click", function () {
  pix.splice(0, pix.length);
  //pixS.splice(0, pixS.length);
  justPlaced.splice(0, justPlaced.length);
  clear();
});
document.getElementById("BopacSlide");
document.getElementById("BopacSlideText");
BopacSlide.addEventListener("input", function () {
  BopacSlideText.innerText = BopacSlide.value;
  bO = parseInt(BopacSlide.value);
  clear();
});
BopacSlide.value = 1;
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
document.getElementById("resizeB");
resizeB.addEventListener("click", function () {
  resizeCanvas(wInput.value, hInput.value);
  pix.splice(0, pix.length);
  // pixS.splice(0, pixS.length);
});
document.getElementById("saveC");
saveC.addEventListener("click", function () {
  saveCanvas(tc, "myDrawing", "png");
});
document.getElementById("circlCheck");
circlCheck.addEventListener("change", function () {
  squarCheck.checked = false;
});
document.getElementById("squarCheck");
squarCheck.addEventListener("change", function () {
  circlCheck.checked = false;
});
circlCheck.checked = true;
document.getElementById("resizeBD");
resizeBD.addEventListener("click", function () {
  resizeCanvas(window.innerWidth, window.innerHeight);
});
document.getElementById("enterSiz");
let enteredSiz = enterSiz.value;
enterSiz.addEventListener("input", function () {
  enteredSiz = enterSiz.value;
  rSlide.value = enteredSiz;
  rSlideText.innerText = enteredSiz;
});

let tc;
let bO;
let loopx = true;
let pix = [];
let mp = false;
let kp = false;
let mappedHue;
let hueDisplay;
let mappedBri;
let mappedSiz;
let mHD;
let imInTheLines = false;
let hueBrush = hueSlide.value;
let satBrush = satSlide.value;
let briBrush = briSlide.value;
let opacBrush = opacSlide.value;
let rBrush = rSlide.value;

function setup() {
  tc = createCanvas(window.innerWidth, window.innerHeight);
  frameRate(60);
  colorMode(HSB);
  noStroke();
  tc.mouseOver(() => (imInTheLines = true));
  tc.mouseOut(() => (imInTheLines = false));
}

function areYouInTheLines() {
  imInTheLines = true;
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

class Pixels {
  constructor() {
    this.shape = "string";
    this.x = mouseX;
    this.y = mouseY;
    this.z = 0;
    this.sat = satSlide.value;
    this.bri = briSlide.value;
    this.opac = opacSlide.value;
    this.r = rSlide.value;

    if (hueCheck.checked == false) {
      this.hue = hueSlide.value;
    } else {
      let hue1 = 360 * noise(0.09 * frameCount);
      mappedHue = map(hue1, 0, 360, -100, 450);
      hueDisplay = map(mappedHue, -100, 450, 0, 360);
      this.hue = mappedHue;
    }

    if (briCheck.checked == false) {
      this.bri = briSlide.value;
    } else {
      let bri1 = 200 * noise(0.015 * frameCount);
      mappedBri = map(bri1, 0, 200, 0, 100);
      this.bri = mappedBri;
      console.log(bri1, mappedBri);
    }

    if (sizCheck.checked == false) {
      this.r = rSlide.value;
    } else {
      let siz1 = rSlide.value * noise(0.5 * frameCount);
      mappedSiz = siz1;
      this.r = siz1;
    }

    if (circlCheck.checked == true) {
      this.shape = "circle";
    } else if (squarCheck.checked) {
      this.shape = "square";
    }
  }

  showPixel() {
    fill(this.hue, this.sat, this.bri, 1 * this.opac);
    if (this.shape == "circle") {
      circle(this.x, this.y, this.r);
    } else if (this.shape == "square") {
      square(this.x - 0.5 * this.r, this.y - 0.5 * this.r, this.r);
    }
  }
}

function runPixels() {
  imAnnoyed = new Pixels();
  pix.push(imAnnoyed);
  justPlaced.push(imAnnoyed);
  this.z = justPlaced.length;
}

function removePix() {
  pix.splice(pix.length - 1, 1);
  justPlaced.splice(justPlaced.length - 1, 1);
}

// reworking undo feature

let justPlaced = [];

function justPlacedSizeConst() {
  if (justPlaced.length >= 1000) {
    justPlaced.splice(0, 1);
  }
}

function draw() {
  clear();
  background(BhueSlide.value, BsatSlide.value, BbriSlide.value, bO);

  if (mp == true && imInTheLines == true) {
    runPixels();
  }
  if (kp == true) {
    if (key == "r") {
      if (justPlaced[justPlaced.length - 1] instanceof Pixels) {
        removePix();
      }
    }
  }

  for (i = 0; i < pix.length; i++) {
    pix[i].showPixel();
  }

  if (hueCheck.checked == true) {
    hueSlide.value = mappedHue;
    hueSlideText.innerText = Math.round(hueDisplay);
  }

  if (briCheck.checked == true) {
    briSlide.value = mappedBri;
    briSlideText.innerText = Math.round(mappedBri);
  }

  if (sizCheck.checked == true) {
    rSlideText.innerText = `${rSlide.value}${" --> "}${Math.round(mappedSiz)}`;
  }

  justPlacedSizeConst();

  hueBrush = hueSlide.value;
  satBrush = satSlide.value;
  briBrush = briSlide.value;
  opacBrush = opacSlide.value;
  rBrush = rSlide.value;

  if (squarCheck.checked == true) {
    fill(hueBrush, satBrush, briBrush, opacBrush);
    square(mouseX - 0.5 * rBrush, mouseY - 0.5 * rBrush, rBrush);
  }
  if (circlCheck.checked == true) {
    fill(hueBrush, satBrush, briBrush, opacBrush);
    circle(mouseX, mouseY, rBrush);
  }
}

function mousePressed() {
  mp = true;
}
function mouseReleased() {
  mp = false;
}

function keyPressed() {
  kp = true;
}
function keyReleased() {
  kp = false;
}

function touchStarted() {
  mp = true;
}

function touchEnded() {
  mp = false;
}
