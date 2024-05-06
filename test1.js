await WebMidi.enable();

let myInput = WebMidi.inputs[0];

let dropIns = document.getElementById("dropdown-ins");

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
    mArray.push(someMIDI.note.number);
    console.log(`Note  numbers are: ${mArray}`);
  });

  myInput.addListener("noteoff", function (someMIDI) {
    let spicedNote = mArray.indexOf(someMIDI.note.number);
    mArray.splice(spicedNote, 1);
    console.log(`Note  numbers are: ${mArray}`);
  });
});
