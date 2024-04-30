await WebMidi.enable();

let myInput = WebMidi.inputs[0];

let dropIns = document.getElementById("dropdown-ins");
const velDisplayJS = document.getElementById("velDisplay");
const mNumDisplayJS = document.getElementById("mNumsPressed");

let vel;
let mArray = [];

WebMidi.inputs.forEach(function (input, num) {
  dropIns.innerHTML += `<option value=${num}>${input.name}</option>`;
});

dropIns.addEventListener("change", function () {
  if (myInput.hasListener("noteon")) {
    myInput.removeListener("noteon");
  }
  if (myInput.hasListener("noteoff")) {
    myInput.removeListener("noteoff");
  }

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

  myInput.addListener("noteoff", function () {
    if (keys.length <= 1) {
      mp = false;
    }
    keys.splice(0, 1);
    mArray.splice(0, 1);
    mNumDisplayJS.innerHTML = `${mArray}`;
  });
});
