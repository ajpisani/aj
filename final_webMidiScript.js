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

let vel = [];
let mArray = [];

// get the button to fix midi, u shall see this buttons description upon
//further reading through the code shmode

let fixMidiButton = document.getElementById("fixMidi");
// makes fixMidiButton Blue
fixMidiButton.style.background = "lightblue"

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

//this function does the same thing as that but instead of when you change your midi
// controller, it deos it when you push a button. this makes this function possible
// for those with only one midi controller availible

fixMidiButton.addEventListener("click", function () {
  //function to change button color temporarily


  fixMidiButton.style.background = "green"
  setTimeout(function(){fixMidiButton.style.background = "lightblue"},250)


  if (myInput.hasListener("noteon")) {
    myInput.removeListener("noteon");
  }
  if (myInput.hasListener("noteoff")) {
    myInput.removeListener("noteoff");
  }

  // functions that will run when the key is pressed

  myInput = WebMidi.inputs[dropIns.value];
  myInput.addListener("noteon", function (someMIDI) {
    vel.push(someMIDI.note.rawAttack);
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
    let splicedVel = vel.indexOf(someMIDI.note.rawAttack)
    vel.splice(splicedVel, 1)
    velDisplayJS.innerHTML = `${vel}`;
  });
});
