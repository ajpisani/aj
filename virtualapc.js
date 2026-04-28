//initialize sliders and button
let freqSlider;
let pwSlider;
let audioButton;
let volSlider;

//set up global volume variable incase it needs to be used later by other things
let vol = 0

//audio variables set up
let audioCtx = null;
let oscNode = null;
let shaperNode = null;
let gainNode = null;
let playing = false;

//make a pulsewave with the waveshaper curve
function setPulseDuty(duty) {
  //clamp away from 0/1 to avoid silence and aliasing extremes
  duty = Math.min(0.99, Math.max(0.01, duty));

  //map duty cycle (0 - 1) to audio sample threshold (-1 - 1)
  const threshold = 2 * duty - 1;

  //number of points in the WaveShaper curve
  const n = 1024;
  //variable to hold mapped curve values
  const curve = new Float32Array(n);

  //loop 1024 times
  for (let i = 0; i < n; i++) {
    //make input domain values for x from -1 - 1
    const x = (i / (n - 1)) * 2 - 1;
    //if the x is below the threshold output 1, else, output -1
    curve[i] = x < threshold ? -1 : 1;
  }
  //set shape node to the curve with the wave shaper node
  shaperNode.curve = curve;
  //do 4x to reduce aliasing
  shaperNode.oversample = "4x";
}

//start audio function
async function startAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    //oscNode generates sine or square or triangle type forms
    oscNode = audioCtx.createOscillator();
    //base wave for pulse width modulation shaping
    oscNode.type = "sawtooth";
    //convert the sawtooth into a pulse wave with the custom curve
    shaperNode = audioCtx.createWaveShaper();
    gainNode = audioCtx.createGain();

    //start silent
    gainNode.gain.value = 0;

    //connect nodes
    oscNode.connect(shaperNode);
    shaperNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    //start the first (source) node
    oscNode.start();
  }

  //check if suspended and wait for a resume (autoplay fix)
  if (audioCtx.state !== "running") {
    await audioCtx.resume();
  }

  //micro fades to avoid clicks
  const t = audioCtx.currentTime;
  gainNode.gain.cancelScheduledValues(t);
  gainNode.gain.setValueAtTime(gainNode.gain.value, t);
  gainNode.gain.linearRampToValueAtTime(0.15, t + 0.02);

  //after all that, then mark playing as true
  playing = true;
}

//stop audio function
function stopAudio() {
  if (!audioCtx) return;

  //fade out without destroying nodes
  const t = audioCtx.currentTime;
  gainNode.gain.cancelScheduledValues(t);
  gainNode.gain.setValueAtTime(gainNode.gain.value, t);
  gainNode.gain.linearRampToValueAtTime(0.0, t + 0.03 * vol / 1000);

  playing = false;
}

//p5 function that runs once when the website opens
function setup() {
  createCanvas(window.innerWidth, 600);

  //set up sliders in setup() so it doesnt break website
  freqSlider = document.getElementById("frequencySlide");
  pwSlider = document.getElementById("pulseWidthSlide");
  //set up button
  audioButton = document.getElementById("toggleAudioButton")
  //add a listener to the button to make it display start or stop audio
  audioButton.addEventListener("click", async () => {
    if (!playing) {
      await startAudio();
      audioButton.textContent = "Stop Sound";
    } else {
      stopAudio();
      audioButton.textContent = "Play Sound";
    }
  });
  //set up volue slider
  volSlider = document.getElementById("volumeSlide");
  //add a listener to adjust the global volume variable
  volSlider.addEventListener("input", function(){
    //set global variable
    vol = Number(volSlider.value);
    //if the gain node is not 0, adjust the gain node based on the slider value
    if (gainNode) {
      gainNode.gain.setValueAtTime(vol / 1000, audioCtx ? audioCtx.currentTime : 0);
    }
  })
}

//p5 function that runs once per frame
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


  //if sound is playing  
  //map the slider frequency values to reasoanble audio fq values
  let mappedFreq = map(Number(freqSlider.value), 1, 100, 20, 1000);
  if (audioCtx && playing) {
    //set pitch based on the frequency and time
    const t = audioCtx.currentTime;
    oscNode.frequency.setTargetAtTime(mappedFreq, t, 0.01);

    //set pulse width (with the duty cycle):
    setPulseDuty(pulseWidth);
  }

}
