let flowShader;
let flowCanvas;
let contextLost = false;

const vertShader = `
attribute vec3 aPosition;

void main() {

    vec4 positionVec4 = vec4(aPosition, 1.0);

    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

    gl_Position = positionVec4;
}
`;

const fragShader = `
precision mediump float;

uniform vec2 uResolution;
uniform float uTime;

// The whole visual identity of a given page/section - a whole list of
// gradient colors (2 up to PALETTE_SIZE of them) and the shape of the
// big curve - now comes in as uniforms instead of being hardcoded, so
// one shader can be every page's ribbon just by feeding it different
// numbers from JS. A theme can define as few as 2 colors for a simple
// two-tone fade, or as many as PALETTE_SIZE for something like a full
// rainbow - JS always resamples whatever a theme defines into exactly
// PALETTE_SIZE evenly-spaced stops before sending it up here, so this
// shader never needs to know how many "real" colors a theme actually
// has, only this fixed ladder of stops.
const int PALETTE_SIZE = 24;
uniform vec3 uPalette[PALETTE_SIZE];
uniform float uCurveAmplitude;
uniform float uDriftAmplitude;
uniform float uDriftSpeed;
uniform float uCenterXBase;

vec3 sectionPalette(float t) {
    float scaled = clamp(t, 0.0, 1.0) * float(PALETTE_SIZE - 1);
    float idxF = floor(scaled);
    float frac = scaled - idxF;
    int idx = int(idxF);

    // GLSL ES 1.00 (WebGL1) can't reliably dynamically-index a uniform
    // array on every GPU (some older mobile chips choke on it), so this
    // walks a constant-bound loop instead of doing uPalette[idx]
    // directly - slightly more work per pixel, but it runs everywhere.
    vec3 colorA = uPalette[0];
    vec3 colorB = uPalette[PALETTE_SIZE - 1];
    for (int i = 0; i < PALETTE_SIZE; i++) {
        if (i == idx) {
            colorA = uPalette[i];
        }
        if (i == idx + 1) {
            colorB = uPalette[i];
        }
    }
    return mix(colorA, colorB, frac);
}

// cheap single-value hash - much lighter than the old value-noise
// function, used only to pick random-looking start times/positions
// for the shooting stars below
float hash1(float n) {
    return fract(sin(n) * 43758.5453123);
}

void main() {

    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    // "t" is just top (0) to bottom (1) of whatever's currently on
    // screen - no scroll position or document height involved at all
    // anymore. Every page/section is its own full viewport now, so
    // this is all the ribbon needs, and it sidesteps every mobile
    // quirk around window.scrollY / document height that the old
    // whole-document version depended on.
    float t = 1.0 - uv.y;

    // ONE big smooth curve, always a single bow (never an S-shape,
    // since t only ever spans half a sine period) plus a separate,
    // bounded side-to-side sway over time so it's never static.
    float baseCurve = sin(t * 3.14159265) * uCurveAmplitude;
    float drift = sin(uTime * uDriftSpeed) * uDriftAmplitude;
    float centerX = uCenterXBase + baseCurve + drift;

    // --- a bundle of thin strands, woven together into one line that
    // widens/spreads out as it goes.
    const int STRAND_COUNT = 52;
    const float CENTER_INDEX = 25.5; // (STRAND_COUNT - 1) / 2.0
    float spacing = mix(0.0015, 0.0055, t);
    float strandHalfWidth = mix(0.00075, 0.003, t);
    float edgeSoft = mix(0.0001, 0.0000, t);

    // Start fully transparent instead of filling in a solid
    // background color. Anywhere no strand reaches, this canvas now
    // shows nothing at all instead of an opaque grey that happened to
    // sit close enough to the page's own background color to make the
    // whole ribbon read as "not there" - coverageAccum tracks how
    // covered a pixel ends up and becomes the alpha channel below.
    vec3 color = vec3(0.0);
    float coverageAccum = 0.0;

    for (int i = 0; i < STRAND_COUNT; i++) {
        float fi = float(i);
        float rel = fi - CENTER_INDEX;

        // every strand follows the exact same curve, just offset
        // sideways by its slot in the bundle - no per-strand wobble,
        // so it reads as one coherent shape rather than many
        float strandX = centerX + rel * spacing;

        float d = abs(uv.x - strandX);
        float coverage = smoothstep(strandHalfWidth + edgeSoft, strandHalfWidth - edgeSoft, d);
        coverageAccum = max(coverageAccum, coverage);

        // this pixel is nowhere near this strand - skip the rest of
        // this iteration's math entirely instead of paying for a full
        // comet calculation (several sin/exp calls) on every one of
        // the strands for every pixel on screen, most of which aren't
        // anywhere near the line at all
        if (coverage < 0.001) {
            continue;
        }

        // each strand's own color transition is nudged a little
        // earlier or later than its neighbors', normalized so the
        // total spread across the bundle stays a fixed proportion no
        // matter how many strands there are
        float strandProgress = clamp(t + (rel / CENTER_INDEX) * 0.2, 0.0, 1.0);
        vec3 strandColor = sectionPalette(strandProgress);

        color = mix(color, strandColor, coverage * 1.0);

        // --- shooting-star shine ---
        // a thin white streak that starts somewhere along the line,
        // crawls a short distance, then fades back out - fade in and
        // fade out both happen fully inside this comet's own cycle, so
        // it never gets cut off abruptly when the next cycle starts.
        float cycleDuration = 4.5;
        float activeFrac = 0.85; // fraction of the cycle actually spent visible; the rest is a pause
        float localTime = uTime + fi * 0.41 * cycleDuration;
        float cycleIndex = floor(localTime / cycleDuration);
        float cycleTime = localTime - cycleIndex * cycleDuration;

        float seed = fi * 13.13 + cycleIndex * 7.77;
        float spawnRoll = hash1(seed);
        float startProgress = hash1(seed + 31.7) * 0.55;
        float cometSpeed = 0.05 + hash1(seed + 91.3) * 0.02; // very slow crawl

        float activeDuration = cycleDuration * activeFrac;
        float u = clamp(cycleTime / activeDuration, 0.0, 1.0);
        float fadeIn = smoothstep(0.0, 0.85, u);
        float fadeOut = 1.0 - smoothstep(0.65, 1.0, u);
        float lifeEnvelope = fadeIn * fadeOut;

        float cometHead = startProgress + cometSpeed * activeDuration * u;
        float behind = cometHead - t;
        float tailLength = 0.022;

        float trail = (behind >= 0.0) ? exp(-behind / tailLength) : 0.0;
        float comet = trail * lifeEnvelope;
        comet *= step(spawnRoll, 0.5); // only ~half of cycles actually spawn one

        color += vec3(1.0) * comet * coverage * 0.15;
    }

    // Alpha comes from how much strand coverage actually landed on this
    // pixel, not a flat 1.0 - this is what makes everywhere outside the
    // ribbon fully see-through instead of an opaque fill. The small
    // boost (*1.15) compensates for the soft-edged strands rarely
    // reaching full 1.0 coverage even dead-center.
    gl_FragColor = vec4(color, clamp(coverageAccum * 1.15, 0.0, 1.0));
}
`;

// Every page/section gets its own look: a list of gradient colors
// (as few as 2, up to MAX_PALETTE_STOPS of them - see resamplePalette
// below) and the numbers that shape the big curve. Adding a new page
// later is just adding an entry here - nothing else about the shader
// needs to change. Colors are 0-1 RGB.
const SECTION_THEMES = {
    home: {
        // full 24-color rainbow, per AJ - this is "the main one"
        colors: [
            [0.932, 0.168, 0.168], [0.932, 0.359, 0.168], [0.932, 0.550, 0.168], [0.932, 0.741, 0.168],
            [0.932, 0.932, 0.168], [0.741, 0.932, 0.168], [0.550, 0.932, 0.168], [0.359, 0.932, 0.168],
            [0.168, 0.932, 0.168], [0.168, 0.932, 0.359], [0.168, 0.932, 0.550], [0.168, 0.932, 0.741],
            [0.168, 0.932, 0.932], [0.168, 0.741, 0.932], [0.168, 0.550, 0.932], [0.168, 0.359, 0.932],
            [0.168, 0.168, 0.932], [0.359, 0.168, 0.932], [0.550, 0.168, 0.932], [0.741, 0.168, 0.932],
            [0.932, 0.168, 0.932], [0.932, 0.168, 0.741], [0.932, 0.168, 0.550], [0.932, 0.168, 0.359],
        ],
        curveAmplitude: 0.18, driftAmplitude: 0.07, driftSpeed: 0.045, centerXBase: 0.5,
    },
    bio: {
        colors: [[0.16, 0.71, 0.67], [0.35, 0.31, 0.78], [0.59, 0.24, 0.75]],
        curveAmplitude: -0.16, driftAmplitude: 0.06, driftSpeed: 0.04, centerXBase: 0.5,
    },
    sparkstage: {
        // red / green / blue, per AJ
        colors: [[0.9, 0.2, 0.2], [0.2, 0.78, 0.35], [0.24, 0.43, 0.9]],
        curveAmplitude: 0.22, driftAmplitude: 0.09, driftSpeed: 0.07, centerXBase: 0.5,
    },
    railroadermods: {
        // NJT orange / magenta / blue, per AJ - the original palette
        colors: [[1.0, 0.5, 0.1], [0.8, 0.2, 1.0], [0.1, 0.5, 1.0]],
        curveAmplitude: -0.2, driftAmplitude: 0.08, driftSpeed: 0.05, centerXBase: 0.5,
    },
    music: {
        colors: [[0.9, 0.24, 0.59], [0.55, 0.27, 0.86], [0.2, 0.35, 0.78]],
        curveAmplitude: 0.19, driftAmplitude: 0.07, driftSpeed: 0.05, centerXBase: 0.5,
    },
    soloprojects: {
        colors: [[0.98, 0.78, 0.24], [1.0, 0.47, 0.24], [0.9, 0.31, 0.59]],
        curveAmplitude: -0.2, driftAmplitude: 0.08, driftSpeed: 0.06, centerXBase: 0.5,
    },
    collegeperformances: {
        colors: [[0.71, 0.16, 0.24], [0.86, 0.67, 0.24], [0.16, 0.24, 0.43]],
        curveAmplitude: 0.17, driftAmplitude: 0.06, driftSpeed: 0.04, centerXBase: 0.5,
    },
    collegecoding: {
        colors: [[0.24, 0.78, 0.86], [0.27, 0.47, 0.9], [0.35, 0.27, 0.78]],
        curveAmplitude: -0.19, driftAmplitude: 0.07, driftSpeed: 0.05, centerXBase: 0.5,
    },
    resume: {
        colors: [[0.35, 0.43, 0.55], [0.59, 0.59, 0.63], [0.16, 0.22, 0.35]],
        curveAmplitude: 0.14, driftAmplitude: 0.05, driftSpeed: 0.035, centerXBase: 0.5,
    },
};

const DEFAULT_THEME_KEY = "home";

// Must match PALETTE_SIZE in the shader above - this is the fixed
// number of color stops actually sent to the GPU every frame.
const MAX_PALETTE_STOPS = 24;

// Resamples a theme's own list of "real" colors (any length 2 or up)
// into exactly MAX_PALETTE_STOPS evenly-spaced stops along that same
// gradient. This is what lets a theme define just 2 or 3 colors for a
// simple fade, or all the way up to MAX_PALETTE_STOPS for something
// like a full rainbow, while the shader always just receives a fixed-
// size array and never needs to know how many colors a theme
// "really" has.
function resamplePalette(colors, count) {
    const lastIndex = colors.length - 1;
    const out = [];
    for (let i = 0; i < count; i++) {
        if (lastIndex <= 0) {
            out.push(colors[0].slice());
            continue;
        }
        const scaled = (i / (count - 1)) * lastIndex;
        const idx = Math.min(Math.floor(scaled), lastIndex - 1);
        const frac = scaled - idx;
        const a = colors[idx];
        const b = colors[idx + 1];
        out.push([
            a[0] + (b[0] - a[0]) * frac,
            a[1] + (b[1] - a[1]) * frac,
            a[2] + (b[2] - a[2]) * frac,
        ]);
    }
    return out;
}

function cloneTheme(theme) {
    return {
        stops: resamplePalette(theme.colors, MAX_PALETTE_STOPS),
        curveAmplitude: theme.curveAmplitude,
        driftAmplitude: theme.driftAmplitude,
        driftSpeed: theme.driftSpeed,
        centerXBase: theme.centerXBase,
    };
}

// "current" is what actually gets sent to the shader every frame,
// "target" is where it's headed - draw() nudges current a little
// closer to target each frame, which is the entire transition effect.
// No easing library, no timers, just a per-frame lerp.
let currentTheme = cloneTheme(SECTION_THEMES[DEFAULT_THEME_KEY]);
let targetTheme = cloneTheme(SECTION_THEMES[DEFAULT_THEME_KEY]);

function setActiveSection(sectionId) {
    const theme = SECTION_THEMES[sectionId];
    if (!theme) {
        return;
    }
    targetTheme = cloneTheme(theme);

    // light up the matching nav link, dim the rest
    document.querySelectorAll(".navLink").forEach((link) => {
        const isActive = link.getAttribute("href") === "#" + sectionId;
        link.classList.toggle("navLinkActive", isActive);
    });
}

// Keeps the --nav-height CSS variable in sync with the nav's REAL
// rendered height. The nav wraps to two rows on narrower phones
// (their system font renders the link text wider than desktop's
// fallback font does), so a single hardcoded padding-top value for
// every .page-section would either overlap a wrapped two-row nav or
// waste space under a single-row one, depending on the device. This
// measures the actual element instead of guessing.
function updateNavHeightVar() {
    const nav = document.getElementById("siteNav");
    if (!nav) {
        return;
    }
    document.documentElement.style.setProperty("--nav-height", nav.offsetHeight + "px");
}

// Watches every page section and switches the ribbon's target theme
// to whichever one is most in view. This fires the same way whether
// you scrolled there yourself or clicked a nav link - a nav click is
// just a scroll to that section's id, and this notices where you
// land either way, so there's only one code path to maintain.
function watchSections() {
    const sections = document.querySelectorAll(".page-section");
    if (sections.length === 0) {
        return;
    }
    const observer = new IntersectionObserver(
        (entries) => {
            let best = null;
            entries.forEach((entry) => {
                if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) {
                    best = entry;
                }
            });
            if (best) {
                setActiveSection(best.target.id);
            }
        },
        { threshold: [0.5, 0.75, 0.99] }
    );
    sections.forEach((section) => observer.observe(section));
}

function setup() {

    // The canvas is always exactly one viewport, whichever section is
    // currently showing, so this cap is just cheap extra headroom.
    pixelDensity(Math.min(window.devicePixelRatio || 1, 2));

    flowCanvas = createCanvas(windowWidth, windowHeight, WEBGL);

    flowCanvas.parent("canvas-container");

    noStroke();

    flowShader = createShader(vertShader, fragShader);

    watchSections();

    // Set --nav-height once up front, then keep it correct any time the
    // nav's own size changes (font finishes loading, phone rotates, nav
    // wraps to a different number of rows, etc.) - ResizeObserver catches
    // all of that directly instead of only reacting to window resizes.
    updateNavHeightVar();
    const navEl = document.getElementById("siteNav");
    if (navEl && window.ResizeObserver) {
        new ResizeObserver(updateNavHeightVar).observe(navEl);
    }

    // If the GPU drops the context under memory/driver pressure, stop
    // touching it instead of throwing every frame (which some mobile
    // browsers escalate into a full tab crash), and rebuild the shader
    // if/when the context comes back.
    flowCanvas.elt.addEventListener("webglcontextlost", (e) => {
        e.preventDefault();
        contextLost = true;
        console.warn("Flow field: WebGL context lost, pausing shader.");
    }, false);

    flowCanvas.elt.addEventListener("webglcontextrestored", () => {
        console.warn("Flow field: WebGL context restored, rebuilding shader.");
        flowShader = createShader(vertShader, fragShader);
        contextLost = false;
    }, false);
}

function draw() {

    if (contextLost) {
        return;
    }

    // Now that the ribbon draws with real per-pixel alpha instead of a
    // flat opaque fill, the canvas MUST be cleared to fully transparent
    // every frame before redrawing - otherwise each frame's semi-
    // transparent strand blends on top of whatever was left over from
    // the last frame instead of replacing it, which is what was
    // piling up extra lines every time the curve drifted.
    clear();

    // Nudge the live values a little closer to the active section's
    // target every frame - this is the entire smooth-transition trick.
    // Every theme's palette has already been resampled to the same
    // fixed MAX_PALETTE_STOPS length (see resamplePalette/cloneTheme
    // above), so lerping stop-by-stop here always lines up correctly
    // even when transitioning between a 3-color theme and a 24-color
    // rainbow one.
    const smoothing = 0.03;
    for (let i = 0; i < MAX_PALETTE_STOPS; i++) {
        for (let j = 0; j < 3; j++) {
            currentTheme.stops[i][j] += (targetTheme.stops[i][j] - currentTheme.stops[i][j]) * smoothing;
        }
    }
    currentTheme.curveAmplitude += (targetTheme.curveAmplitude - currentTheme.curveAmplitude) * smoothing;
    currentTheme.driftAmplitude += (targetTheme.driftAmplitude - currentTheme.driftAmplitude) * smoothing;
    currentTheme.driftSpeed += (targetTheme.driftSpeed - currentTheme.driftSpeed) * smoothing;
    currentTheme.centerXBase += (targetTheme.centerXBase - currentTheme.centerXBase) * smoothing;

    shader(flowShader);

    // Flatten the 24 [r,g,b] stops into one plain array of 72 numbers -
    // that's the layout p5/WebGL expects for a `uniform vec3 arr[24]`.
    const flatPalette = [];
    for (let i = 0; i < MAX_PALETTE_STOPS; i++) {
        flatPalette.push(currentTheme.stops[i][0], currentTheme.stops[i][1], currentTheme.stops[i][2]);
    }

    flowShader.setUniform("uResolution", [width, height]);
    flowShader.setUniform("uTime", millis() * 0.001);
    flowShader.setUniform("uPalette", flatPalette);
    flowShader.setUniform("uCurveAmplitude", currentTheme.curveAmplitude);
    flowShader.setUniform("uDriftAmplitude", currentTheme.driftAmplitude);
    flowShader.setUniform("uDriftSpeed", currentTheme.driftSpeed);
    flowShader.setUniform("uCenterXBase", currentTheme.centerXBase);

    rect(0, 0, width, height);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    // Belt-and-suspenders for browsers without ResizeObserver - a
    // window resize (including a phone rotation) is also a reasonable
    // time to recheck the nav's real height.
    updateNavHeightVar();
}
