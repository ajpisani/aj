// wait for webMIDI

await WebMidi.enable();

// making the inputs be the inputs

let myInput = WebMidi.inputs[0];

// get elements from html

let dropIns = document.getElementById("dropdown-ins");
const velDisplayJS = document.getElementById("velDisplay");
const mNumDisplayJS = document.getElementById("mNumsPressed");

const FRchange = document.getElementById("frameSlider");
frameSlider.value = 60;
const FRchangeDisplayed = document.getElementById("frameSliderS");
FRchange.addEventListener("input", function () {
  FRchangeDisplayed.innerHTML = FRchange.value;
});

//declare more variables and an empty array

let vel;
let mArray = [];

// gives the options for the selecting of a midi input

WebMidi.inputs.forEach(function (input, num) {
  dropIns.innerHTML += `<option value=${num}>${input.name}</option>`;
});

// a required function for making sure selecting the inputs work

dropIns.addEventListener("change", function () {
  if (myInput.hasListener("noteon")) {
    myInput.removeListener("noteon");
  }
  if (myInput.hasListener("noteoff")) {
    myInput.removeListener("noteoff");
  }

  // functions that will run when the key is pressed

  myInput = WebMidi.inputs[dropIns.value];
  myInput.addListener("noteon", function (someMIDI) {
    vel = someMIDI.note.rawAttack;
    mArray.push(someMIDI.note.number);
    console.log(`Velocity = ${vel}, Note  numbers are: ${mArray}`);
    mp = true;
    velDisplayJS.innerHTML = `${vel}`;
    mNumDisplayJS.innerHTML = `${mArray}`;
    let k = new numOfKeys();
    if (keys.length <= 7) {
      keys.push(k);
    }
  });

  // functions that will run when the key is released

  myInput.addListener("noteoff", function (someMIDI) {
    if (keys.length <= 1) {
      mp = false;
    }
    keys.splice(0, 1);
    let spicedNote = mArray.indexOf(someMIDI.note.number);
    mArray.splice(spicedNote, 1);
    mNumDisplayJS.innerHTML = `${mArray}`;
  });
});
