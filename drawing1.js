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
});
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

let loopx = true;
let pix = [];
let mp = false;
let kp = false;
let mappedHue;
let mHD;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  frameRate(30);
  colorMode(HSB);
  background(0, 0, 0);
  noStroke();
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

class Pixels {
  constructor() {
    this.x = mouseX;
    this.y = mouseY;

    if (hueCheck.checked == false) {
      this.hue = hueSlide.value;
    } else {
      let hue1 = 300 * noise(0.0109 * frameCount);
      mappedHue = map(hue1, 0, 300, -100, 450);
      this.hue = mappedHue;
    }
    this.sat = satSlide.value;
    this.bri = briSlide.value;
    this.opac = opacSlide.value;

    this.r = rSlide.value;
  }
  showPixel() {
    fill(this.hue, this.sat, this.bri, 1 * this.opac);
    circle(this.x, this.y, this.r);
  }
}
function runPixels() {
  imAnnoyed = new Pixels();
  pix.push(imAnnoyed);
}

function removePix() {
  pix.splice(pix.length - 1, 1);
}

function draw() {
  background(BhueSlide.value, BsatSlide.value, BbriSlide.value);
  if (mp == true) {
    runPixels();
  }
  if (kp == true) {
    removePix();
  }

  for (i = 0; i < pix.length; i++) {
    pix[i].showPixel();
  }

  if (hueCheck.checked == true) {
    hueSlide.value = mappedHue;
    hueSlideText.innerText = Math.round(mappedHue);
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
