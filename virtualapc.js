//initialize sliders
let freqSlider;
let pwSlider;

function setup() {
  createCanvas(window.innerWidth, 600);

  //set up sliders in setup() so it doesnt break website
  freqSlider = document.getElementById("frequencySlide");
  pwSlider = document.getElementById("pulseWidthSlide");
}

function draw() {
  //make a dark background
  background(20);

  //scale frequency and pulse width
  let freq = Number(freqSlider.value) / 5;
  let pulseWidth = Number(pwSlider.value) / 100;

  //color the shape green and give it no fill so it looks like a line
  stroke(0, 255, 0);
  noFill();

  //begin shape
  beginShape();


  //loop as many times as the width in pixels of the canvas
  for (let x = 0; x < width; x++) {
    //normalize x so its easier to do math with
    let t = x / width;
    //scale based on the frequency
    let phase = (t * freq) % 1;

    //swap y value based on frequency and pulsewidth
    let yVal = phase < pulseWidth ? 1 : -1;
    //map height values to the size of the canvas
    let y = map(yVal, -1, 1, height * 0.8, 0 + height * 0.2);

    //create a vertex at each x and y point
    vertex(x, y);
  }

  //end (close) the line (shape)
  endShape();
}
