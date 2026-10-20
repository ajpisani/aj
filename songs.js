const stranded = document.getElementById("StrandedAudioID");
const jonyard = document.getElementById("jonyardAudioID");
const oc4 = document.getElementById("oc4AudioID");
const oc2 = document.getElementById("oc2AudioID")
const oc1 = document.getElementById("oc1AudioID")
const vin = document.getElementById("vingetteAudioID")
const tech = document.getElementById("technoAudioID")

const jonyardButt = document.getElementById("playButtonJonyard");
const strandedButt = document.getElementById("playButtonStranded");
const oc4Butt = document.getElementById("playButtonOC4")
const oc2Butt = document.getElementById("playButtonOC2")
const oc1Butt = document.getElementById("playButtonOC1")
const vinButt = document.getElementById("playButtonVingette")
const techButt = document.getElementById("playButtonTechno")

jonyardButt.addEventListener("click", () => {

  if (jonyard.paused) {
    jonyard.play();
    jonyardButt.textContent = "Pause";
  } else {
    jonyard.pause();
    jonyardButt.textContent = "Play";
  }
});

strandedButt.addEventListener("click", () => {
  if (stranded.paused) {
    stranded.play();
    strandedButt.textContent = "Pause";
  } else {
    stranded.pause();
    strandedButt.textContent = "Play";
  }
});

oc4Butt.addEventListener("click", () => {
  if (oc4.paused) {
    oc4.play();
    oc4Butt.textContent = "Pause";
  } else {
    oc4.pause();
    oc4Butt.textContent = "Play";
  }
});

oc2Butt.addEventListener("click", () => {
  if (oc2.paused) {
    oc2.play();
    oc2Butt.textContent = "Pause";
  } else {
    oc2.pause();
    oc2Butt.textContent = "Play";
  }
});

oc1Butt.addEventListener("click", () => {
  if (oc1.paused) {
    oc1.play();
    oc1Butt.textContent = "Pause";
  } else {
    oc1.pause();
    oc1Butt.textContent = "Play";
  }
});

vinButt.addEventListener("click", () => {
  if (vin.paused) {
    vin.play();
    vinButt.textContent = "Pause";
  } else {
    vin.pause();
    vinButt.textContent = "Play";
  }
});

techButt.addEventListener("click", () => {
  if (tech.paused) {
    tech.play();
    techButt.textContent = "Pause";
  } else {
    tech.pause();
    techButt.textContent = "Play";
  }
});
