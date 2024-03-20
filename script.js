await WebMidi.enable();

let myInput = WebMidi.inputs[0];
let myOutput = WebMidi.outputs[0].channels[1];

let dropIns = document.getElementById("dropdown-ins");
let dropOuts = document.getElementById("dropdown-outs");
let slider = document.getElementById("tempSlider");
let chordSel = document.getElementById("chordSelect");

WebMidi.inputs.forEach(function (input, num) {
  dropIns.innerHTML += `<option value=${num}>${input.name}</option>`;
});

WebMidi.outputs.forEach(function (output, num) {
  dropOuts.innerHTML += `<option value=${num}>${output.name}</option>`;
});

//MIDI PRocessing Function
const midiProcess = function (midiIN, transpose) {
  let pitch = midiIN.note.number;

  pitch += transpose;

  let myNewNote = new Note(pitch, { rawAttack: midiIN.note.rawAttack });

  return myNewNote;
};

slider.addEventListener("change", function () {
  document.getElementById(
    "tempDisplay"
  ).innerHTML = `<span class="tmpF">Speed Setting: ${slider.value}</span>`;
  console.log(slider.value);
});

let loopIntervalId;

dropIns.addEventListener("change", function () {
  if (myInput.hasListener("noteon")) {
    myInput.removeListener("noteon");
  }
  if (myInput.hasListener("noteoff")) {
    myInput.removeListener("noteoff");
  }
  myInput = WebMidi.inputs[dropIns.value];
  myInput.addListener("noteon", function (someMIDI) {
    console.log(`My note is ${someMIDI.note.identifier}, it is pitch ${someMIDI.note.number}, with a 
      velocity of ${someMIDI.note.rawAttack}`);

    myOutput.sendNoteOn(midiProcess(someMIDI, 0));
    if (someMIDI.note.number < 60) {
       clearInterval(loopIntervalId);
      
      setTimeout(function () {
        myOutput.sendNoteOn(
          midiProcess(someMIDI, 4 - parseInt(chordSel.value))
        );
      }, 600 / parseInt(slider.value));
      setTimeout(function () {
        myOutput.sendNoteOn(midiProcess(someMIDI, 7));
      }, 600 / parseInt(slider.value));
      setTimeout(function () {
        myOutput.sendNoteOn(midiProcess(someMIDI, -5));
      }, 1200 / parseInt(slider.value));
      setTimeout(function () {
        myOutput.sendNoteOn(
          midiProcess(someMIDI, 4 - parseInt(chordSel.value))
        );
      }, 1800 / parseInt(slider.value));
      setTimeout(function () {
        myOutput.sendNoteOn(midiProcess(someMIDI, 7));
      }, 1800 / parseInt(slider.value));

      loopIntervalId = setInterval(function () {
        myOutput.sendNoteOn(midiProcess(someMIDI, 0));
        setTimeout(function () {
          myOutput.sendNoteOn(
            midiProcess(someMIDI, 4 - parseInt(chordSel.value))
          );
        }, 600 / parseInt(slider.value));
        setTimeout(function () {
          myOutput.sendNoteOn(midiProcess(someMIDI, 7));
        }, 600 / parseInt(slider.value));
        setTimeout(function () {
          myOutput.sendNoteOn(midiProcess(someMIDI, -5));
        }, 1200 / parseInt(slider.value));
        setTimeout(function () {
          myOutput.sendNoteOn(
            midiProcess(someMIDI, 4 - parseInt(chordSel.value))
          );
        }, 1800 / parseInt(slider.value));
        setTimeout(function () {
          myOutput.sendNoteOn(midiProcess(someMIDI, 7));
        }, 1800 / parseInt(slider.value));
      }, 2400 / parseInt(slider.value));
    }
  });

  myInput.addListener("noteoff", function (someMIDI) {
    myOutput.sendNoteOff(midiProcess(someMIDI, 0));
    if (someMIDI.note.number < 60) {
      setTimeout(function () {
        myOutput.sendNoteOn(
          midiProcess(someMIDI, 4 - parseInt(chordSel.value))
        );
      }, 600 / parseInt(slider.value));
      setTimeout(function () {
        myOutput.sendNoteOn(midiProcess(someMIDI, 7));
      }, 600 / parseInt(slider.value));
      setTimeout(function () {
        myOutput.sendNoteOn(midiProcess(someMIDI, -5));
      }, 1200 / parseInt(slider.value));
      setTimeout(function () {
        myOutput.sendNoteOn(
          midiProcess(someMIDI, 4 - parseInt(chordSel.value))
        );
      }, 1800 / parseInt(slider.value));
      setTimeout(function () {
        myOutput.sendNoteOn(midiProcess(someMIDI, 7));
      }, 1800 / parseInt(slider.value));

      clearInterval(loopIntervalId);
    }
  });
});

dropOuts.addEventListener("change", function () {
  myOutput = WebMidi.outputs[dropOuts.value].channels[1];
});
