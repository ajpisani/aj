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
uniform float uScrollPx;   // window.scrollY, in real page pixels
uniform float uDocHeight;  // total scrollable document height, in real page pixels

// Fixed top-to-bottom palette: orange at the top of the PAGE, magenta
// in the middle, blue at the bottom. "t" is 0 at the very top of the
// document and 1 at the very bottom, and this mapping never drifts
// over time - the top is always orange, no matter when you look.
vec3 njtPalette(float t) {
    vec3 orange  = vec3(1.0, 0.5, 0.1);
    vec3 magenta = vec3(0.8, 0.2, 1.0);
    vec3 blue    = vec3(0.1, 0.5, 1.0);

    if (t < 0.5) {
        return mix(orange, magenta, t / 0.5);
    } else {
        return mix(magenta, blue, (t - 0.5) / 0.5);
    }
}

// cheap single-value hash - much lighter than the old value-noise
// function, used only to pick random-looking start times/positions
// for the shooting stars below
float hash1(float n) {
    return fract(sin(n) * 43758.5453123);
}

void main() {

    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    vec3 background = vec3(0.8, 0.8, 0.85);

    // "world" position down the FULL page (0 = very top of the page,
    // 1 = very bottom), even though this canvas only ever renders one
    // viewport's worth of pixels. This is what lets the ribbon read as
    // one continuous line running the entire length of the page
    // without the canvas itself being that tall.
    float worldY = uScrollPx + (1.0 - uv.y) * uResolution.y;
    float pageProgress = clamp(worldY / max(uDocHeight, 1.0), 0.0, 1.0);

    // ONE big smooth curve down the whole page. pageProgress only ever
    // spans 0..pi here (half a sine period), so baseCurve by itself is
    // always a single bow in one direction - it can never flip into an
    // S-shape. The side-to-side sway over time is a SEPARATE, bounded
    // term (drift) added on afterward, instead of being baked into the
    // same sin() that defines the curve's shape. That separation is
    // what keeps this from "getting weird" the longer it runs: with a
    // single combined sin(pageProgress*pi + phase), an ever-growing
    // phase slowly rotates the argument through the FULL sine cycle,
    // so every few minutes the curve's fundamental shape flips between
    // a single bow and an S-curve - which reads as the line suddenly
    // doing something unintended. Keeping drift bounded (it oscillates,
    // it never accumulates) means the curve always stays a single bow
    // that just leans left/right over time, no matter how long it runs
    // or what speed you dial drift's frequency to.
    float baseCurve = sin(pageProgress * 7.0) * 0.125;
    float drift = sin(uTime * 0.05) * 0.08;
    float centerX = 0.5 + baseCurve + drift;

    // --- a bundle of thin strands, woven together into one line that
    // tapers as it goes: thick and spread apart near the top of the
    // page, narrowing down into what reads as one thin line by the
    // bottom.
    const int STRAND_COUNT = 52;
    const float CENTER_INDEX = 30.0; // (STRAND_COUNT - 1) / 2.0
    float spacing = mix(0.0025, 0.009, pageProgress);
    float strandHalfWidth = mix(0.00125, 0.005, pageProgress);
    float edgeSoft = mix(0.0001, 0.0000, pageProgress);

    vec3 color = background;

    for (int i = 0; i < STRAND_COUNT; i++) {
        float fi = float(i);
        float rel = fi - CENTER_INDEX;

        // every strand follows the exact same curve, just offset
        // sideways by its slot in the bundle - no per-strand wobble,
        // so it reads as one coherent shape rather than many
        float strandX = centerX + rel * spacing;

        float d = abs(uv.x - strandX);
        float coverage = smoothstep(strandHalfWidth + edgeSoft, strandHalfWidth - edgeSoft, d);

        // this pixel is nowhere near this strand - skip the rest of
        // this iteration's math entirely instead of paying for a full
        // comet calculation (several sin/exp calls) on every one of
        // the strands for every pixel on the whole page, most of
        // which aren't anywhere near the line at all
        if (coverage < 0.001) {
            continue;
        }

        // this is what gives the "fading between colors at slightly
        // different times in their life" look: each strand's own color
        // transition is nudged a little earlier or later than its
        // neighbors', instead of every strand changing color at
        // exactly the same page position. Normalized by CENTER_INDEX
        // (rel / CENTER_INDEX is always -1..1) so the total spread
        // across the bundle stays a fixed +/-0.2 no matter how many
        // strands there are - before, this used a flat per-strand
        // offset (rel * 0.018), so adding more strands (24 -> 52)
        // widened the spread to nearly +/-0.6 without meaning to,
        // which is most of the whole gradient - some strands were
        // already showing blue while others still showed orange at
        // the same scroll position, which is what read as the color
        // "changing too fast".
        float strandProgress = clamp(pageProgress + (rel / CENTER_INDEX) * 0.2, 0.0, 1.0);
        vec3 strandColor = njtPalette(strandProgress);

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
        float cometSpeed = 0.05 + hash1(seed + 91.3) * 0.02; // very slow crawl, much lower max speed

        float activeDuration = cycleDuration * activeFrac;
        float u = clamp(cycleTime / activeDuration, 0.0, 1.0);
        float fadeIn = smoothstep(0.0, 0.85, u);   // longer, slower fade in
        float fadeOut = 1.0 - smoothstep(0.65, 1.0, u); // longer, slower fade out
        float lifeEnvelope = fadeIn * fadeOut;

        float cometHead = startProgress + cometSpeed * activeDuration * u;
        float behind = cometHead - pageProgress;
        float tailLength = 0.022; // short/small streak

        float trail = (behind >= 0.0) ? exp(-behind / tailLength) : 0.0;
        float comet = trail * lifeEnvelope;
        comet *= step(spawnRoll, 0.5); // only ~half of cycles actually spawn one, so it feels random

        color += vec3(1.0) * comet * coverage * 0.15; // translucent, not "shouting"
    }

    gl_FragColor = vec4(color, 1.0);
}
`;

function setup() {

    // Cap pixel density. The canvas is now only ever viewport-sized
    // (see below), so this is just cheap extra headroom, not a
    // life-or-death fix the way it was for the old full-page canvas.
    pixelDensity(Math.min(window.devicePixelRatio || 1, 2));

    // Fixed to the viewport instead of sized to the whole document.
    // #canvas-container is position:fixed in style.css, so this stays
    // pinned to the screen while the page scrolls past it - cheap for
    // the GPU (never bigger than one screen), and never static, since
    // the shader above still treats it as a window onto one long,
    // continuously animated ribbon that runs the full page.
    flowCanvas = createCanvas(windowWidth, windowHeight, WEBGL);

    flowCanvas.parent("canvas-container");

    noStroke();

    flowShader = createShader(vertShader, fragShader);

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

    shader(flowShader);

    flowShader.setUniform("uResolution", [width, height]);
    flowShader.setUniform("uTime", millis() * 0.001);
    flowShader.setUniform("uScrollPx", window.scrollY || document.documentElement.scrollTop);
    flowShader.setUniform("uDocHeight", document.body.scrollHeight);

    rect(0, 0, width, height);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
