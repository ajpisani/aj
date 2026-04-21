let freqSlider;
let pwSlider;

function setup() {
  createCanvas(window.innerWidth, 600);

  //get sliders in set up so it doesnt break website
  freqSlider = document.getElementById("frequencySlide");
  pwSlider = document.getElementById("pulseWidthSlide");
}

function draw() {
  background(20);

  //scale frequency and pulse width
  let freq = Number(freqSlider.value) / 5;
  let pulseWidth = Number(pwSlider.value) / 100;

  //color the line green and give the "shape" no fill so it looks like a line
  stroke(0, 255, 0);
  noFill();

  //begin shape
  beginShape();

  //loop as its a square wave so it repeats (visaually)
  for (let x = 0; x < width; x++) {
    //set up other variables,
    //get the x locations for all the "instances"
    let t = x / width;
    let phase = (t * freq) % 1;

    //swap y value based on frequency
    let yVal = phase < pulseWidth ? 1 : -1;
    let y = map(yVal, -1, 1, height * 0.8, 0 + height * 0.2);

    //create a vertex at each x and y point
    vertex(x, y);
  }

  //end (close) the line (shape)
  endShape();
}
