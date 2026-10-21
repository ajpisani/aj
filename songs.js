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

// Every song now has its own volume + progress slider in index.html,
// all following the same id pattern Stranded's started with:
// "<song>VolSlider" / "<song>Progress" / "<song>ProgressLabel".
const strandedVol = document.getElementById("strandedVolSlider");
const strandedProg = document.getElementById("strandedProgress");
const strandedProgLabel = document.getElementById("strandedProgressLabel");

const jonyardVol = document.getElementById("jonyardVolSlider");
const jonyardProg = document.getElementById("jonyardProgress");
const jonyardProgLabel = document.getElementById("jonyardProgressLabel");

const oc4Vol = document.getElementById("oc4VolSlider");
const oc4Prog = document.getElementById("oc4Progress");
const oc4ProgLabel = document.getElementById("oc4ProgressLabel");

const oc2Vol = document.getElementById("oc2VolSlider");
const oc2Prog = document.getElementById("oc2Progress");
const oc2ProgLabel = document.getElementById("oc2ProgressLabel");

const oc1Vol = document.getElementById("oc1VolSlider");
const oc1Prog = document.getElementById("oc1Progress");
const oc1ProgLabel = document.getElementById("oc1ProgressLabel");

const vinVol = document.getElementById("vinVolSlider");
const vinProg = document.getElementById("vinProgress");
const vinProgLabel = document.getElementById("vinProgressLabel");

const techVol = document.getElementById("techVolSlider");
const techProg = document.getElementById("techProgress");
const techProgLabel = document.getElementById("techProgressLabel");

// --- Bass-reactive background --------------------------------------
// Darkens/pulses the page's resting background color (set in
// style.css, body { background-color: rgb(108, 123, 136); }) in time
// with the LOW END of whichever song(s) are currently playing - kick
// drums and bass live down here, so this reacts mostly to those
// instead of the whole mix (vocals, cymbals, etc. sit well above this
// range and barely move it). Uses the Web Audio API's AnalyserNode in
// frequency-domain mode (getByteFrequencyData) instead of reading the
// raw waveform, so only a handful of low-frequency "bins" are looked
// at each frame rather than the signal's overall loudness.

// One shared AudioContext for the whole page - browsers only allow a
// handful of these to exist at once, and only one is ever needed here
// (every song's analyser below is created from this same context).
// Created lazily, on the first play click anywhere, rather than at
// page load: browsers start a fresh AudioContext "suspended" unless
// it's created/resumed inside an actual user gesture's call stack (a
// click handler counts, a page load does not), so creating it any
// earlier would leave it permanently suspended with no audio data.
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Every song's analyser, once it's been built (see connectAnalyserOnce
// inside wireUpSong), lands in here - the animation loop below just
// walks this list every frame and only reads from whichever ones
// belong to a song that's actually unpaused right now, so playing more
// than one song at once (that's allowed - see wireUpSong) blends all
// of their loudness together instead of only reacting to whichever
// song was clicked last.
const songAnalysers = [];

// The rgb(...) the page's background rests at (same numbers as
// style.css's body rule) - kept here too so the pulse has an actual
// "normal" color to darken away from and ease back to.
const BASE_BG = [108, 123, 136];

// Every bin across the whole spectrum contributes to the reading,
// weighted by how "bassy" its frequency is - full weight down in the
// kick/bass range, fading down toward BASS_MIN_WEIGHT by the time it
// reaches BASS_ROLLOFF_HZ. This is still a WEIGHTED average rather than
// a hard cutoff for the same reason as before: a hard band narrow
// enough to be just 1-2 real bins (like the old BASS_MAX_HZ=50) is too
// noisy to read cleanly. But at this sample rate/fftSize there are
// ~85 real bins between 0-2000Hz alone - plenty to average cleanly -
// so BASS_MIN_WEIGHT doesn't need to be anywhere near as generous as it
// was.
//
// It used to be 0.15, and that turned out to be a real problem, not
// just a rounding choice: measured directly against one of AJ's own
// recordings of this feature running, roughly 1000 bins sit above
// 2000Hz (vocals, cymbals, hi-hats, general mix noise) vs. ~85 below
// it, so even a "small" 0.15 floor on that many bins added up to
// ~73% of the ENTIRE weighted reading coming from content that isn't
// bass at all - the bass-detector was mostly a broadband loudness
// detector wearing a bass costume. That's the real explanation for
// pulses that "don't make sense" (reacting to a loud vocal or cymbal
// moment, not a kick/bass hit) and for the detector feeling like an
// overworked compressor (that broadband floor is almost always
// somewhat "on", which flattens/dilutes how much an actual bass hit
// can stand out). Dropped way down so the reading is genuinely
// bass-led again.
//
// Dropping the floor to 0.03 still wasn't enough, because the slow
// fade from 150Hz to 2000Hz was the bigger leak: that fade covers ~80
// bins at an average weight of ~0.5, and since getByteFrequencyData is
// in dB, almost every bin reads a similar-sized number whether or not
// anything loud is there. Worked out for this fftSize, only ~8% of the
// reading came from 150Hz and below - about 55% came from the
// 150-2000Hz fade (bass synths, snare body, low vocals) and ~37% from
// the 0.03 floor above it. So it was still mostly reacting to things
// that aren't kicks.
// A kick's punch lives roughly 40-120Hz, so now: nothing below
// BASS_LOW_CUT_HZ (sub rumble, and bin 0/1), full weight up to
// BASS_CORE_HZ, a short fade to zero by BASS_ROLLOFF_HZ, and nothing
// above that. At fftSize 2048 that's still ~6-8 real bins to average,
// so it's not the 1-2 bin noise problem the old BASS_MAX_HZ=50 had.
const BASS_LOW_CUT_HZ = 35;
const BASS_CORE_HZ = 120;
const BASS_ROLLOFF_HZ = 250;
const BASS_MIN_WEIGHT = 0;

// getByteFrequencyData maps the analyser's minDecibels..maxDecibels range
// onto 0-255 and clips anything louder to 255. The song's volume slider
// is applied BEFORE the analyser sees anything (Chrome applies
// audio.volume at the source), so at the default maxDecibels (-30) a
// song turned up to full volume pins the kick bins at 255 - measured on
// the Techno track at 100%: about a quarter of all frames - and a
// pinned kick and the bass note after it read the same. -10 leaves
// headroom so kicks still stand out at full volume.
const ANALYSER_MAX_DB = -10;
// The analyser's default minDecibels, set explicitly because the hit
// math in updateBackgroundPulse needs to know the full dB range.
const ANALYSER_MIN_DB = -100;

// How far toward black the loudest bass moment can push the
// background (0 = no darkening ever, 1 = pure black).
const DARKEN_AMOUNT = 0.4;

// Separate attack (rising) and release (falling) speeds instead of one
// flat smoothing value. A single shared speed fast enough to feel
// punchy on a kick hit was just as fast snapping back down a moment
// later, which is what actually read as "flashing" - a rapid
// flicker-flicker-flicker instead of a smooth pulse. ATTACK stays fast
// so a hit still darkens the background right away; RELEASE is much
// slower so it fades back out over a few hundred ms instead of
// immediately snapping back - that's what turns a string of drum/bass
// hits into one smooth pulsing glow instead of a flashing light. Raise
// RELEASE (closer to ATTACK) for a snappier/flashier feel again, or
// lower it further to slow the fade out even more.
//
// Both are "how far to move per frame AT 60fps". They used to be
// applied once per frame no matter the refresh rate, so on a 120Hz or
// 144Hz monitor everything ran 2-2.4x faster than tuned - snappier
// attack, quicker release, more flicker. updateBackgroundPulse now
// converts them using the real time between frames, so they feel the
// same on any monitor. (Same for AVG_SMOOTHING below.)
//
// ATTACK was 0.075 (~200ms to rise), slow enough that a kick was
// usually over before the background got dark, so pulses landed late
// and smeared into each other. 0.2 rises in ~75ms - lands on the kick
// without an instant strobe-like snap. RELEASE 0.06 fades back out over
// ~250-300ms: long enough to read as a smooth pulse, short enough that
// the next kick gets its own pulse instead of the page just staying dark.
const ATTACK = 0.2;
const RELEASE = 0.2;

// Different songs sit at wildly different absolute loudness down in
// the bass - confirmed by testing this against two very different
// songs here: a flat gain number tuned to visibly pulse on Stranded's
// quiet ambient pad permanently pegged at full-dark on the techno
// track's hot, constant sub-bass, and a number tuned not to peg on
// the techno track barely moved on Stranded. Instead of one fixed
// gain, RUNNING_MAX tracks the loudest bass level seen recently and
// every reading is normalized AGAINST that ceiling, so each song
// calibrates its own range automatically - a quiet track's own loud
// moments still read as "loud" relative to ITS quiet moments, and a
// hot track's constant sub-bass settles into its own range too,
// instead of needing a different gain number retuned per song.
// RUNNING_MAX_DECAY controls how slowly that ceiling forgets a loud
// moment and settles back down - closer to 1 remembers longer (more
// stable, slower to adapt if a song gets quieter for a while),
// further from 1 adapts faster (but can itself start flickering if
// set too low).
// Normalizing against the loudest moment EVER seen (what this used to
// do) had a bad failure mode: the very first bass reading after
// hitting play had no history to compare against yet, so it instantly
// BECAME the ceiling - reading as "100% as loud as this ever gets"
// right away and slamming straight to full dark. And since that
// ceiling barely decayed afterward, everything else kept reading
// close to it too, so it never came back up - "goes dark and stays
// dark" start to finish.
//
// This instead compares each moment to a slow-moving AVERAGE of
// recent bass level, not an all-time peak - avgLevel drifts toward
// whatever's typical right now (over roughly a couple seconds), and
// only a moment that's clearly LOUDER than that recent typical level
// counts as a hit. That's a much closer match for "a kick/bass hit"
// in the first place (a brief spike above the sustained bass bed)
// and it can't get stuck: if the bass stays elevated for a while,
// avgLevel rises to meet it and the pulse settles back down on its
// own instead of staying pegged dark.
// How fast avgLevel "forgets" and adapts to a new typical level, per
// animation frame at 60fps (see perFrame below).
//
// History: this was 0.02, then 0.003, then 0.008, each time trading
// "only reacts to the first note of a bar" against "misses most hits".
// Both of those were really side effects of the z-score (dividing by
// avgDeviation, the song's typical swing size): on a song with a strong,
// regular kick, the kicks ARE the typical swing, so they never looked
// surprising - measured on the Techno track, the z-score version caught
// only ~1 in 9 kick/bass onsets.
//
// Now a hit is measured in plain decibels above avgLevel instead (see
// HIT_THRESHOLD_DB below). getByteFrequencyData is already in dB, so
// the difference between two readings IS a dB difference, and a fixed
// "this many dB louder than a moment ago" works the same on a quiet
// file and a hot one - no per-song calibration needed. That also lets
// avgLevel be FAST: 0.1 means "the last ~150ms". Each kick then jumps
// above the dip just before it, and a held bass note stops counting
// once avgLevel catches up to it (~150ms later), so it gives one pulse
// at its start instead of holding the page dark for the whole note.
const AVG_SMOOTHING = 0.1;
let avgLevel = 0.05;

// How many dB above avgLevel a moment has to be to count as a hit at
// all, and how many dB above counts as a full-strength hit (gained = 1).
// Measured against Vingette and the Techno track (as a fraction of real
// kick/bass onsets caught vs. pulses with no onset behind them), 2/8 was
// the best balance. Raise HIT_THRESHOLD_DB if softer bass still pulses;
// lower HIT_CEILING_DB if clear kicks aren't getting dark enough.
const HIT_THRESHOLD_DB = 1;
const HIT_CEILING_DB = 4;

let smoothedRms = 0;

// The old version started avgLevel from wherever it had drifted while
// nothing was playing - usually ~0 - so the first frames of every song
// (and every resume after a pause) read as "way above average" and
// flashed the background dark. That's the flash on pressing Play. (The
// old WARMUP_FRAMES/WARMUP_SMOOTHING blend shortened that flash but
// couldn't stop it, and isn't needed now that AVG_SMOOTHING is fast.)
// Fix: the first frame that actually has sound in it SEEDS avgLevel
// with the song's real level (needsSeed), and no hit can fire for
// SEED_HOLDOFF_SEC after that. needsSeed gets set again whenever
// everything's paused, a song starts/resumes, the playhead jumps
// (seek), or a volume slider moves - all of those change the level
// without it being a kick.
// SILENCE_LEVEL: readings at or below this (0..1, same scale as
// bassLevel) count as "no sound yet" - e.g. the few frames between
// pressing Play and the audio actually arriving.
const SEED_HOLDOFF_SEC = 0.35;
const SILENCE_LEVEL = 0.1;
let needsSeed = true;
let holdoffUntil = 0;
let lastFrameTime = null;

// Called by every song's play/seek/volume handlers (see wireUpSong).
function reseedPulse() {
  needsSeed = true;
}

// Converts a "per frame at 60fps" smoothing amount (ATTACK, RELEASE,
// AVG_SMOOTHING, ...) into the right amount for however much time
// actually passed since the last frame - see ATTACK/RELEASE above.
function perFrame(amountAt60fps, frames60) {
  return 1 - Math.pow(1 - amountAt60fps, frames60);
}

// --- Per-song gain normalization ------------------------------------
// None of these song files are mastered yet, so they don't just sound
// different in overall loudness - they peak at genuinely different
// absolute levels (one file's loudest moment might be half the raw
// amplitude of another's). That's a problem for two separate reasons:
// it makes some songs play noticeably quieter/louder than others even
// with the volume sliders set the same, AND it feeds the pulse's bass
// reading an inconsistent starting signal before any of the
// self-calibration above even gets a chance to even things out.
//
// Fix: before a song is actually played for the first time, fetch and
// decode its audio file once, scan every sample for the single loudest
// one (the true peak, -1..1), and compute a gain multiplier that would
// bring THAT peak up/down to TARGET_PEAK. That gain gets applied via a
// GainNode inserted into the song's Web Audio graph, so it normalizes
// what comes out of the speakers the same way for every song. (The
// pulse's analyser now taps in BEFORE this gain - see the comment at
// source.connect(analyser) in wireUpSong for why.)
const TARGET_PEAK = 0.9;
// Caps how far a near-silent file can get boosted - without this, a
// file that's mostly quiet with one tiny blip would compute a massive
// gain (dividing by a peak close to 0), which would blast that blip and
// amplify noise the rest of the time. 4x is already a lot of makeup
// gain; anything needing more than that is almost certainly not a
// normalization problem.
const MAX_GAIN = 4;

// Decodes an audio file fresh (a separate fetch from whatever the
// <audio> element itself is streaming, so this never interferes with
// actual playback) purely to measure its true peak sample across every
// channel. Returns a gain multiplier, or 1 (no change) if anything
// about this fails - a failed peak measurement should never be able to
// break playback or silence a song.
async function computeSongGain(ctx, url) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    let peak = 0;
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        const abs = Math.abs(data[i]);
        if (abs > peak) {
          peak = abs;
        }
      }
    }
    if (peak <= 0) {
      return 1;
    }
    return Math.min(MAX_GAIN, TARGET_PEAK / peak);
  } catch (err) {
    console.warn("Peak-gain detection failed for " + url + ":", err);
    return 1;
  }
}

function updateBackgroundPulse(now = performance.now()) {
  requestAnimationFrame(updateBackgroundPulse);

  // How many 60fps-frames' worth of time passed since the last frame:
  // 1 at 60Hz, ~0.42 at 144Hz (see ATTACK/RELEASE above). Capped so a
  // tab coming back from the background doesn't lurch.
  const frames60 =
    lastFrameTime === null
      ? 1
      : Math.min(6, ((now - lastFrameTime) / 1000) * 60);
  lastFrameTime = now;

  let bassLevel = 0;
  for (const entry of songAnalysers) {
    if (entry.audio.paused) {
      continue;
    }
    entry.analyser.getByteFrequencyData(entry.freqData);
    let weightedSum = 0;
    for (let i = 0; i < entry.freqData.length; i++) {
      weightedSum += entry.freqData[i] * entry.binWeights[i];
    }
    // Weighted average across EVERY bin (each 0-255), then normalize
    // to 0..1 - see entry.binWeights/totalWeight below for why this
    // is a weighted average over the whole spectrum rather than a
    // plain average over a narrow slice of it.
    const avg = weightedSum / entry.totalWeight / 255;
    // The loudest of any simultaneously-playing songs wins, rather
    // than averaging them down into something quieter than either.
    bassLevel = Math.max(bassLevel, avg);
  }

  const anyPlaying = songAnalysers.some((entry) => !entry.audio.paused);

  // Seed the average from the first frame that has real sound in it,
  // then hold off on hits briefly - see needsSeed/SEED_HOLDOFF_SEC above.
  if (!anyPlaying) {
    needsSeed = true;
  } else if (needsSeed && bassLevel > SILENCE_LEVEL) {
    avgLevel = bassLevel;
    holdoffUntil = now + SEED_HOLDOFF_SEC * 1000;
    needsSeed = false;
  }
  const holdingOff = needsSeed || now < holdoffUntil;

  // avgLevel always drifts toward the current reading - see
  // AVG_SMOOTHING above. This has to happen even while bassLevel is 0
  // (nothing playing/paused), or avgLevel would stay stuck at whatever
  // it last was.
  avgLevel += (bassLevel - avgLevel) * perFrame(AVG_SMOOTHING, frames60);

  // How many dB louder this moment is than the last ~150ms (bassLevel
  // and avgLevel are both 0..1 across the analyser's dB range), remapped
  // so HIT_THRESHOLD_DB and below is "not a hit" (0) and HIT_CEILING_DB
  // and above is "fully loud" (1).
  const dbAboveAvg = (bassLevel - avgLevel) * (ANALYSER_MAX_DB - ANALYSER_MIN_DB);
  const gained = holdingOff
    ? 0
    : Math.max(
        0,
        Math.min(
          1,
          (dbAboveAvg - HIT_THRESHOLD_DB) / (HIT_CEILING_DB - HIT_THRESHOLD_DB)
        )
      );

  // Fast attack toward a louder reading, slow release toward a
  // quieter one - see ATTACK/RELEASE above for why this (not a single
  // shared speed) is what actually fixes the flashing.
  const speed = gained > smoothedRms ? ATTACK : RELEASE;
  smoothedRms += (gained - smoothedRms) * perFrame(speed, frames60);

  const darken = 1 - smoothedRms * DARKEN_AMOUNT;
  const r = Math.round(BASE_BG[0] * darken);
  const g = Math.round(BASE_BG[1] * darken);
  const b = Math.round(BASE_BG[2] * darken);
  document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}
updateBackgroundPulse();

// mm:ss for a raw seconds value - currentTime/duration are both plain
// seconds. Guards against NaN (duration briefly reads as NaN before
// the browser has loaded enough of the file to know it).
function formatTime(totalSeconds) {
  if (!isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return minutes + ":" + String(seconds).padStart(2, "0");
}

// Everything built out for Stranded's play button + volume slider +
// progress slider/label, now shared by every song instead of copying
// that same block out by hand seven times over (which is exactly how
// the id/class mixups from before happened in the first place).
// Calling this once per song below is what actually wires each one up.
function wireUpSong(audio, button, volSlider, progSlider, progLabel) {

  // Web Audio connection for this song, built the first time it's
  // actually played (see getAudioContext above for why this can't
  // happen any earlier than a user gesture). createMediaElementSource
  // can only ever be called once per <audio> element for the whole
  // page's lifetime - calling it a second time throws - so this is
  // guarded to only run once per song no matter how many times its
  // button gets clicked.
  let analyser = null;
  function connectAnalyserOnce() {
    if (analyser) {
      return;
    }
    const ctx = getAudioContext();
    const source = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.minDecibels = ANALYSER_MIN_DB; // see ANALYSER_MAX_DB above
    analyser.maxDecibels = ANALYSER_MAX_DB;

    // A GainNode sits between the source and the speakers for the
    // per-song peak-normalization gain (see computeSongGain above) -
    // starts at unity (no change) since the real gain isn't
    // known yet (measuring it means decoding the whole file, which
    // takes a moment), then gets ramped to the measured value once
    // that finishes. setTargetAtTime ramps smoothly over ~0.3s instead
    // of snapping instantly, so if that finishes while the song's
    // already playing it's not an audible jump in volume.
    const gainNode = ctx.createGain();
    gainNode.gain.value = 1;
    computeSongGain(ctx, audio.currentSrc || audio.src).then((gain) => {
      gainNode.gain.setTargetAtTime(gain, ctx.currentTime, 0.3);
    });

    // Routing the source THROUGH the gain node and analyser and on to
    // ctx.destination (the actual speakers) is required, not optional -
    // once an <audio> element gets wired into the Web Audio graph at
    // all, it stops using its own normal output entirely and ONLY plays
    // through wherever this chain actually leads. Skipping this connect
    // would make the song go completely silent despite still visibly
    // "playing" (currentTime still advancing, button still flipping to
    // Pause) - nothing here would throw an error to explain why.
    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    // The analyser listens to the source directly, BEFORE the gain
    // node, as a dead-end branch (it doesn't need to lead to the
    // speakers - the gainNode path above already does). It used to sit
    // after the gain node, and that caused the near-black flash about a
    // second into each song's first play: that's when computeSongGain
    // finishes decoding and the gain ramps up (up to MAX_GAIN = 4x),
    // which the detector saw as one enormous bass hit. The detector
    // doesn't need the normalization anyway - it measures how many dB
    // each moment jumps above the song's OWN recent average (avgLevel),
    // which is the same whether the file is quiet or loud.
    source.connect(analyser);

    // Each frequency bin covers (sampleRate / fftSize) Hz, and that
    // depends on the device/browser's actual sample rate (commonly
    // 44100 or 48000) - computed here instead of hardcoded so the
    // weighting below lines up with real Hz regardless of what sample
    // rate this machine happens to be running.
    //
    // A per-bin weight, computed once here instead of every frame
    // (there can be 1000+ bins, and this never changes for a given
    // song/sample rate) - zero below BASS_LOW_CUT_HZ, full weight (1.0)
    // up through BASS_CORE_HZ, fading down to BASS_MIN_WEIGHT by
    // BASS_ROLLOFF_HZ, then staying at BASS_MIN_WEIGHT (now 0) the rest
    // of the way up. Bin 0 (0Hz/DC) is zeroed out - it's not a real
    // frequency.
    const hzPerBin = ctx.sampleRate / analyser.fftSize;
    const binWeights = new Float32Array(analyser.frequencyBinCount);
    let totalWeight = 0;
    for (let i = 1; i < binWeights.length; i++) {
      const hz = i * hzPerBin;
      let weight;
      if (hz < BASS_LOW_CUT_HZ) {
        weight = 0;
      } else if (hz <= BASS_CORE_HZ) {
        weight = 1;
      } else if (hz >= BASS_ROLLOFF_HZ) {
        weight = BASS_MIN_WEIGHT;
      } else {
        const t = (hz - BASS_CORE_HZ) / (BASS_ROLLOFF_HZ - BASS_CORE_HZ);
        weight = 1 - t * (1 - BASS_MIN_WEIGHT);
      }
      binWeights[i] = weight;
      totalWeight += weight;
    }

    songAnalysers.push({
      audio: audio,
      analyser: analyser,
      freqData: new Uint8Array(analyser.frequencyBinCount),
      binWeights: binWeights,
      totalWeight: totalWeight,
    });
  }

  button.addEventListener("click", () => {
    connectAnalyserOnce();
    if (audio.paused) {
      audio.play();
      button.textContent = "Pause";
    } else {
      audio.pause();
      button.textContent = "Play";
    }
  });

  // A plain <input type="range"> with no min/max/value set defaults to
  // 0-100, but audio.volume only accepts 0.0-1.0 - dividing by 100
  // below is what bridges the two. Setting audio.volume here once,
  // right away, matches the audio to wherever the slider starts out
  // (the browser's own default resting position, 50) instead of
  // leaving the audio at its own default of 1.0 (full volume) while
  // the slider SHOWS 50% - those would disagree until first touched.
  volSlider.value = volSlider.value || 100;
  audio.volume = volSlider.value / 100;

  // "input" fires continuously while dragging (not just once released
  // like "change" would), so the volume actually follows the slider live.
  volSlider.addEventListener("input", () => {
    audio.volume = volSlider.value / 100;
    reseedPulse(); // a volume change isn't a kick - see needsSeed
  });

  // True for the whole time the user has the progress thumb actively
  // grabbed. Needed below so "timeupdate" (which keeps firing several
  // times a second while the song plays) doesn't fight the drag by
  // snapping the thumb back to the actual playback position mid-drag -
  // "input" fires repeatedly as the thumb moves (so this flips on
  // right as dragging starts), "change" fires once when the drag
  // ends/the value is committed (so this is where the seek itself
  // happens, and where the flag flips back off).
  let scrubbing = false;

  progSlider.addEventListener("input", () => {
    scrubbing = true;
  });

  progSlider.addEventListener("change", () => {
    if (audio.duration) {
      audio.currentTime = (progSlider.value / 100) * audio.duration;
    }
    scrubbing = false;
  });

  // "timeupdate" fires several times a second while playing (and once
  // on a seek) - exactly what's needed to keep both the slider's
  // position and the label's text following along with playback.
  // audio.duration isn't known yet on the very first few ticks (still
  // 0/NaN until the browser's loaded enough metadata), so the slider
  // is only moved once there's an actual duration to divide by - and
  // not at all while the user currently has it grabbed (see scrubbing
  // above), so dragging doesn't get yanked back mid-motion by the
  // song's own actual playback position.
  audio.addEventListener("timeupdate", () => {
    if (audio.duration && !scrubbing) {
      progSlider.value = (audio.currentTime / audio.duration) * 100;
    }
    progLabel.textContent = formatTime(audio.currentTime);
  });

  // Without this, finishing the song naturally (never hitting pause)
  // left the button stuck on "Pause" and the bar/label frozen at the
  // very end instead of resetting.
  audio.addEventListener("ended", () => {
    button.textContent = "Play";
    progSlider.value = 0;
    progLabel.textContent = "0:00";
  });

  // Starting/resuming a song or jumping to a new spot changes the low
  // end without it being a kick - re-learn the level (see needsSeed).
  audio.addEventListener("play", reseedPulse);
  audio.addEventListener("seeked", reseedPulse);
}

wireUpSong(stranded, strandedButt, strandedVol, strandedProg, strandedProgLabel);
wireUpSong(jonyard, jonyardButt, jonyardVol, jonyardProg, jonyardProgLabel);
wireUpSong(oc4, oc4Butt, oc4Vol, oc4Prog, oc4ProgLabel);
wireUpSong(oc2, oc2Butt, oc2Vol, oc2Prog, oc2ProgLabel);
wireUpSong(oc1, oc1Butt, oc1Vol, oc1Prog, oc1ProgLabel);
wireUpSong(vin, vinButt, vinVol, vinProg, vinProgLabel);
wireUpSong(tech, techButt, techVol, techProg, techProgLabel);

strandedProg.value = 0;
jonyardProg.value = 0;
oc4Prog.value = 0;
oc2Prog.value = 0;
oc1Prog.value = 0;
vinProg.value = 0;

strandedVol.value = 100;
jonyardVol.value = 100
oc4Vol.value = 100;
oc2Vol.value = 100;
oc1Vol.value = 100;
vinVol.value = 100;
techVol.value = 100;
