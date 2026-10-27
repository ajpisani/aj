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

// Shooting-star comet timing, advanced in JS (see cometTimeAccum) and
// wrapped at an exact multiple of the shader's own cycleDuration below
// so it never drifts or cuts a comet off mid-flight, no matter how
// long the page has been open.
uniform float uCometTime;

// The whole visual identity of a given page/section - a list of
// gradient colors (2 up to PALETTE_SIZE of them) - comes in as a
// uniform instead of being hardcoded, so one shader can be every
// page's ribbon just by feeding it different numbers from JS. A theme
// can define as few as 2 colors for a simple two-tone fade, or as many
// as PALETTE_SIZE for something like a full rainbow - JS always
// resamples whatever a theme defines into exactly PALETTE_SIZE
// evenly-spaced stops before sending it up here, so this shader never
// needs to know how many "real" colors a theme actually has, only this
// fixed ladder of stops.
const int PALETTE_SIZE = 24;
uniform vec3 uPalette[PALETTE_SIZE];

// Which side of the screen the coil leans toward (0 = left edge, 1 =
// right edge) - also doubles as which way it curls, see curlSide below.
uniform float uCenterXBase;

// How far this theme's coil exit angle drifts from straight-down, fed
// in per-theme from JS below (see currentTheme.drift / setUniform).
// Needs the "uniform" keyword, same as uCenterXBase above it - without
// it this is just an ordinary shader-local variable with no connection
// to JS at all, so setUniform("uDrift", ...) would have nothing to
// write into. See exitAngle/driftFalloff further down for where this
// actually gets applied - only the coil's far end swings with it, not
// the whole shape.
uniform float uDrift;

// How much of a strand's color comes from its fixed left-to-right slot
// in the bundle instead of from how far along the coil it is. At 0.0
// (every section right now) color is a function of distance along the
// coil, like a gradient painted along its length - at 1.0, color is
// almost entirely a function of which slot a strand sits in, so the
// bundle instead reads as parallel colored stripes riding side by side
// along the same coil, rather than one color fading into the next.
uniform float uColorSlotBias;

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

    // === Snail-shell spiral (every section) ===
    // A real coiled spiral (unlike a plain sweeping curl) can cross the
    // exact same horizontal row of the screen more than once - the top
    // of an inner ring sits directly below the top of an outer one -
    // and this shader's usual trick of picking just one X position per
    // row can't draw that. So the coil below works in real 2D instead:
    // everything is an angle and a distance from one fixed point, not
    // an x-per-row path.
    const float SPIRAL_CENTER_T = 0.545; // the coil's own origin point sits at the vertical middle of the section
    // This is the actual "how tight is the coil" dial, AJ - it's how
    // many full turns the spiral makes to get from its own center out
    // to SPIRAL_MAX_RADIUS. Since the radius always grows the same
    // total amount (0 to SPIRAL_MAX_RADIUS) no matter what this is set
    // to, more turns packed into that same reach means each individual
    // ring sits closer to the ring before it - a bigger number here is
    // a TIGHTER coil (more, closer-together rings), a smaller number is
    // a LOOSER one (fewer, further-apart rings). Bumped from 1.85 (barely
    // more than one loop - "a fat, mostly-one-turn paisley shape") up to
    // 2.5 turns.
    // One thing to watch once this is cranked higher: each ring's own
    // real spacing (the "pitch") is roughly SPIRAL_MAX_RADIUS/SPIRAL_LOOPS,
    // and that shrinks as this goes up - if it gets smaller than how
    // WIDE the band of 52 strands actually is (SPIRAL_SPACING_FRACTION
    // and the two strand half-widths above, further down), neighboring
    // rings start overlapping each other instead of reading as separate
    // rings, and a high enough value here turns the whole thing into one
    // solid filled-in shape rather than a visible coil. If that happens,
    // either back this off a bit or pull the band width in to match
    // (those are the "make the whole thing thicker" knobs from before,
    // just working backwards here - thinner/narrower keeps rings
    // distinct at a tighter wind).


    const float SPIRAL_LOOPS = 2.6;
    const float SPIRAL_MAX_RADIUS = 0.375;


    // No sway, no drift to the coil's own CENTER POSITION - it still
    // sits dead still at uCenterXBase, the exact same x the straight
    // trunk above and below it used to use too. AJ's "sway" turned out
    // to mean the PATH's own hand-drawn-looking wobble (see
    // SPIRAL_WOBBLE_AMPLITUDE below) animating over time, not the whole
    // shape sliding left-right as a rigid unit - this file tried that
    // rigid-slide version first and AJ said that's not what he meant,
    // so it's gone again. (It would have been safe either way, for what
    // it's worth - a single shared offset like that can't reopen the
    // old seam/disconnection bug a wobble to the center once caused,
    // since every pixel in a frame would've read the same value - but
    // it just wasn't the right effect.)
    // The screen isn't square, so comparing raw uv distances would draw
    // an egg-shaped coil on a wide screen - toPixel corrects for that
    // (uResolution.x/y) so it reads as a round shell instead.
    vec2 spiralCenter = vec2(uCenterXBase, 1.0 - SPIRAL_CENTER_T);
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 toPixel = (uv - spiralCenter) * vec2(aspect, 1.0);
    float rPixel = length(toPixel);
    float thetaPixel = atan(toPixel.y, toPixel.x);

    // Which way the coil winds - same side uCenterXBase already leans
    // toward, same idea as the old curlSide.


    float curlSide = sign(uCenterXBase - 0.5 + 0.00001);
    float thetaMax = SPIRAL_LOOPS * 6.28318;
    
    
    // The coil always finishes heading straight down (whichever way it
    // winds to get there), so the hand-off into the trunk below is
    // always clean.
    
    
    const float SPIRAL_EXIT_ANGLE = -1.5707963;

    // Same pattern as colorShift/tailBreathe elsewhere in this file: a
    // const can never read a uniform in this language, even multiplied
    // in like this, so SPIRAL_EXIT_ANGLE itself stays the fixed
    // straight-down resting angle and a plain variable below is what
    // actually gets used.
    //
    // uDrift used to multiply straight onto SPIRAL_EXIT_ANGLE here,
    // which rotated the WHOLE coil as one rigid unit - exitAngle feeds
    // into exitDiff below uniformly for every pixel regardless of how
    // far out along the coil it is, so the start near the center
    // swung right along with the end. AJ just wants the far end (out
    // near the tip, where it exits into the trunk) to swing to a
    // different angle per theme while the start stays anchored and
    // doesn't rotate at all.
    //
    // rPixel (this pixel's own distance from spiralCenter, computed
    // just above) is a cheap stand-in for how far along the coil this
    // pixel probably sits - small near the center, growing out toward
    // SPIRAL_MAX_RADIUS at the tip - without having to know this
    // pixel's actual matched progress yet (that's solved by the loop
    // just below, using exitAngle itself, so it isn't available this
    // early). driftFalloff turns that into a smooth 0 (center, no
    // drift) to 1 (tip, full drift) blend; squaring it just keeps the
    // swing concentrated toward the outer portion instead of starting
    // to creep in from the very center.
    float driftFalloff = clamp(rPixel / SPIRAL_MAX_RADIUS, 0.0, 1.0);
    driftFalloff = driftFalloff * driftFalloff;
    float exitAngle = mix(SPIRAL_EXIT_ANGLE, SPIRAL_EXIT_ANGLE * uDrift, driftFalloff);

    // thetaPixel only knows this pixel's angle modulo one full turn, so
    // every whole-turn "unwrap" of it is tried in turn; whichever one
    // both falls inside the coil's actual angle range AND lands closest
    // to this pixel's own distance from center wins. Solved once here,
    // shared by every strand below (each just offsets this same matched
    // radius outward/inward by its own slot in the bundle) rather than
    // re-solved 52 times over. spiralProgress (0 at the very center, 1 at
    // the outer exit) is kept alongside the matched radius now too, so
    // the strand loop below can taper the coil thin-to-thick by how far
    // OUT along it a pixel actually is, instead of by screen row.
    //
    // thetaParam is worked out as thetaMax + curlSide*(exitDiff+turn)
    // rather than the more obvious (thetaPixel+turn-startAngle)*curlSide
    // - they're the same value algebraically, but this file declares
    // "precision mediump float" up top, and the obvious version first
    // builds startAngle as a LARGE number (tens of radians, growing with
    // SPIRAL_LOOPS) and then subtracts two more large, similarly-sized
    // numbers to get back down to a small result - exactly the kind of
    // subtraction that eats most of mediump's few significant digits on
    // GPUs that actually honor it (a lot of integrated/mobile ones do,
    // even though some desktop GPUs quietly run mediump at full
    // precision anyway, masking the bug there). That precision loss was
    // the real cause of the last "seam": it didn't shift the match
    // boundary cleanly, it made the winning candidate flip unpredictably
    // pixel to pixel near it, leaving a ragged dead patch of pixels that
    // matched nothing at all. exitDiff (thetaPixel minus the small fixed
    // SPIRAL_EXIT_ANGLE constant) stays small no matter how many turns
    // SPIRAL_LOOPS asks for, so nothing here ever subtracts two large
    // numbers from each other.
    
    
    float exitDiff = thetaPixel - exitAngle;
    float spiralBaseRadius = 999.0;
    float spiralProgress = 0.0;
    
    
    // A perfectly smooth r = k*theta spiral reads as a little too
    // mechanical/CAD-drawn - AJ wants back some of the hand-drawn
    // waviness the old wobble system used to give it, just far simpler
    // this time: one single sine ripple added straight onto the
    // expected radius below, no harmonics, no new uniforms, nothing
    // else JS-side - nudge these numbers and reload to retune it.
    // Scaled by progress (0 right at the coil's own center, 1 out at
    // the tip) so it fades to nothing at the center and only reaches
    // full strength at the tip - AJ wanted the end to wobble more than
    // the start, and the tight inner windings are also exactly where a
    // wobble would be most likely to make adjacent rings cross each
    // other, so starting it at zero there is the safe choice too.
    // wobblePhase (reusing uCometTime, already ticking away smoothly in
    // JS for the shooting-star comets, instead of adding a second time
    // uniform or any JS-side changes) slowly slides the ripple pattern
    // itself along the coil over time instead of leaving it frozen in
    // one fixed shape - this is the actual "can it sway" AJ asked for:
    // the hand-drawn-looking wobble itself animating, not the whole
    // shape physically sliding around.
    
    
    const float SPIRAL_WOBBLE_CYCLES = 5.5; // how many in-and-out ripples run along the coil's full length, center to tip
    const float SPIRAL_WOBBLE_AMPLITUDE = 0.025; // how far in/out of its perfect path the ripple pushes the coil, at full strength (right at the tip)
    const float SPIRAL_WOBBLE_SPEED = 0.18; // how fast the ripple pattern itself slides along the coil, in radians/second - slow and lazy on purpose
    float wobblePhase = uCometTime * SPIRAL_WOBBLE_SPEED;
    
    for (int ni = 0; ni <= 10; ni++) {
        float n = float(ni - 5);
        float thetaParam = thetaMax + curlSide * (exitDiff + 6.28318 * n);
        if (thetaParam >= 0.0 && thetaParam <= thetaMax) {
            float progress = thetaParam / thetaMax;
            float wobble = SPIRAL_WOBBLE_AMPLITUDE * progress * sin(progress * SPIRAL_WOBBLE_CYCLES * 6.28318 + wobblePhase);
            float rExpected = SPIRAL_MAX_RADIUS * progress + wobble;
            if (abs(rPixel - rExpected) < abs(rPixel - spiralBaseRadius)) {
                spiralBaseRadius = rExpected;
                spiralProgress = progress;
            }
        }
    }

    // Every strand reads as close to the same thin line the whole way
    // out now, not a thin curl ballooning into one fat outer loop -
    // AJ's outer edge was "way too thick", which was really all 52
    // strands overlapping each other at that much width. Both numbers
    // pulled way back down (outer especially, from 0.050) and kept
    // close together so the taper barely reads at all.
    // The coil doesn't draw all the way in to its own mathematical
    // center point (spiralProgress 0) anymore - a bare dot sitting out
    // in the open was an obvious, visible "starting point." Nothing at
    // all is drawn below SPIRAL_START_CUT - a hard floor, not a fade
    // (see strandEndProgress, further down in the strand loop, for how
    // the far end is handled instead). Pulled in from 0.16 to 0.10 so
    // more of the coil's own inner winding is visible before that floor
    // - the startTaper just below turns the floor itself into a clean
    // drawn point rather than a flat cut-off edge.

    const float SPIRAL_START_CUT = 0.0725;

    // AJ, these two are where "make the whole thing thicker" actually
    // lives - they're each individual strand's own radial width (inner
    // = right near the coil's start, outer = out by the tip), and since
    // all 52 strands overlap into one cohesive band, fattening these is
    // what fattens the whole visible ribbon. You'd already bumped both
    // up to 0.024 (from 0.006/0.014) when I found this.
    //
    // There's a SECOND, separate knob further down worth knowing about
    // too, if the band still doesn't look wide enough once these two
    // are where you want them: SPIRAL_SPACING_FRACTION controls how far
    // APART the 52 strands sit from each other (currently pulled in to
    // 0.007, from 0.009) - that's what sets the band's overall radial
    // SPAN, separate from how fat any one strand is. Right now that's
    // pulling the strands closer together while these two widths push
    // them to overlap more, which is a reasonable combo for a denser,
    // solid-looking band - but if what you actually want is a wider
    // ribbon (not just a denser one), SPIRAL_SPACING_FRACTION is the
    // one to raise, not these two.
    const float SPIRAL_INNER_HALF_WIDTH = 0.002;
    const float SPIRAL_OUTER_HALF_WIDTH = 0.048;
    // Both the thin-to-thick taper AND the pointed-tip taper below used
    // to be worked out once per pixel, off the shared spiralProgress
    // from the center-line solve above - but each of the 52 strands
    // actually sits at its own radius (strandSpiralRadius, inside the
    // loop below), offset out or in from that shared center line. Right
    // where the taper runs to zero width, that small per-strand radius
    // difference was enough to shift exactly where each strand's own
    // taper actually hit zero - 52 slightly-staggered tips instead of
    // one, which read as a jagged comb rather than a single clean point.
    // Both tapers are worked out per-strand instead now, right where
    // strandSpiralRadius is known (see spiralHalfWidth/startTaper
    // inside the loop) - there's nothing left to compute up here.

    // The coil's start used to just be a hard cutoff in progress - the
    // instant a strand's progress crossed SPIRAL_START_CUT, it appeared
    // already at that point's full taper width, which reads as a flat
    // chopped-off end, not a clean beginning. Shrinking the width itself
    // down to nothing right at the cutoff (and growing it back out to
    // the normal taper over a short stretch after) turns that same
    // cutoff into a drawn point instead - the coil now visibly comes to
    // a sharp tip and grows from there, rather than starting at full
    // width out of nowhere.
    const float SPIRAL_START_TAPER_END = 0.009;

    // Each of the 52 strands sits spiralSpacing further out (or in)
    // from the matched center line, scaled by its own slot in the
    // bundle. A spacing simply tapered by spiralProgress (what this
    // used to be) doesn't work here: right near the coil's own start
    // the matched radius itself (spiralBaseRadius) is still small, and
    // a spacing meant for the FULL-SIZE outer coil can easily end up
    // bigger than that small radius - outer-slot strands get pushed
    // straight through the center and out the other side instead of
    // just spreading out around it, which reads as exactly the
    // too-wide, jagged mess AJ saw right near the start. Scaling
    // spacing to a fraction of the ACTUAL matched radius instead keeps
    // every strand's spread comfortably smaller than the radius it's
    // spreading around, at every point along the coil, not just near
    // the outer edge where there was always plenty of room.
    const float SPIRAL_SPACING_FRACTION = 0.008; // pulled in from 0.012 - packs the 52 strands a little closer together so there's less empty background showing between them
    const float SPIRAL_SPACING_FLOOR = 0.0003;
    float spiralSpacing = max(SPIRAL_SPACING_FLOOR, spiralBaseRadius * SPIRAL_SPACING_FRACTION);

    // A shading trick instead of a transparency fade for the far end:
    // the deeper into the coil a point is (low spiralProgress, near the
    // center), the more it reads as sitting BEHIND the outer windings
    // layered on top of it, so its color is simply darkened a little
    // rather than faded toward invisible. Back to full brightness by
    // spiralProgress 0.4; never drops below SPIRAL_SHADE_MIN even right
    // at the cut-in point above.
    const float SPIRAL_SHADE_MIN = 0.55;
    float spiralShade = mix(SPIRAL_SHADE_MIN, 1.0, smoothstep(0.0, 1.0, spiralProgress));

    // 52 thin strands woven together into one cohesive coil, each just
    // offset from the shared center-line solve above by its own fixed
    // slot in the bundle (trunkRel, inside the loop below).
    const int STRAND_COUNT = 52;
    const float TRUNK_CENTER_INDEX = 26.0; // (STRAND_COUNT - 1) / 2.0 - every strand's color is keyed off its fixed slot relative to this center

    // Start fully transparent instead of filling in a solid
    // background color. Anywhere no strand reaches, this canvas now
    // shows nothing at all instead of an opaque grey that happened to
    // sit close enough to the page's own background color to make the
    // whole ribbon read as "not there" - coverageAccum tracks how
    // covered a pixel ends up and becomes the alpha channel below.
    vec3 color = vec3(0.0);
    float coverageAccum = 0.0;

    // Slowly slides WHICH PART of the palette each point along the coil
    // samples (see strandProgress further down), same slow-and-lazy
    // uCometTime-driven sway as everything else that animates in this
    // shader. This is a shift in palette POSITION (a number added to
    // strandProgress, which only ever ranges 0..1), not a brightness
    // multiplier on the final color - multiplying the color itself by a
    // raw, ever-growing value like wobblePhase (as this briefly did)
    // just scales every channel by that same number, so the whole
    // strand fades toward black near wobblePhase 0 and blows out past
    // white as wobblePhase keeps climbing past 1 - that's the "it just
    // affects the white balance" symptom. sin() here keeps colorShift
    // gently oscillating back and forth within a small, fixed range
    // instead of growing without bound.
    const float SPIRAL_COLOR_SHIFT_SPEED = 0.15; // how fast the palette drifts back and forth, in radians/second - slow and lazy on purpose
    const float SPIRAL_COLOR_SHIFT_AMOUNT = 0.015; // how far along the palette it drifts at most, each direction (palette runs 0..1 end to end)
    float colorShift = SPIRAL_COLOR_SHIFT_AMOUNT * sin(uCometTime * SPIRAL_COLOR_SHIFT_SPEED);
    // (AJ, this is the pattern for animating any of the const numbers
    // above - declare a plain, non-const variable like colorShift down
    // here instead, add a uCometTime-based sine to the const's resting
    // value, and reference that new variable at the actual point of use
    // further down. Two things that pattern works around: a const in
    // this language can never read a uniform like uCometTime even
    // indirectly, so the const itself must stay a fixed number; and this
    // language reads top to bottom with no exceptions, so the new
    // variable has to be declared somewhere above wherever it gets
    // used.)

    for (int i = 0; i < STRAND_COUNT; i++) {
        float fi = float(i);

        // A strand's COLOR is always keyed off its fixed slot in the
        // 52-wide bundle (trunkRel/TRUNK_CENTER_INDEX), and its POSITION
        // is this exact same slot, as a radial offset from the shared
        // coil solve above (spiralSpacing/spiralHalfWidth - thin at the
        // center, wide by the outer exit, see above).
        float trunkRel = fi - TRUNK_CENTER_INDEX;
        float strandSpiralRadius = spiralBaseRadius + trunkRel * spiralSpacing;

        // This strand's OWN progress along the coil, worked out from
        // its OWN radius (r = SPIRAL_MAX_RADIUS * progress falls
        // straight out of the rExpected formula in the solve above),
        // not borrowed from the shared center-line match. Everything
        // about this one strand - how thick it is here and where its
        // tip actually lands - now comes from the same number, so every
        // strand's point lands exactly where its own line actually
        // stops, instead of 52 slightly different points scattered
        // around the shared one.
        float strandSpiralProgress = strandSpiralRadius / SPIRAL_MAX_RADIUS;
        float spiralHalfWidth = mix(SPIRAL_INNER_HALF_WIDTH, SPIRAL_OUTER_HALF_WIDTH, strandSpiralProgress * strandSpiralProgress);
        float startTaper = smoothstep(SPIRAL_START_CUT, SPIRAL_START_TAPER_END, strandSpiralProgress);
        // Letting the taper multiply width all the way down to literally
        // 0 was what made the tip glitch/shimmer - a line that's thinner
        // than about a pixel can't be drawn cleanly (there's nothing to
        // smoothstep across), so it flickers between covered and not
        // from one pixel to the next instead of reading as a clean,
        // solid point. Mixing toward a small floor instead of all the
        // way to 0 keeps the tip from ever getting thinner than that -
        // it still reads as a fine point (the floor is barely a couple
        // of pixels), just a stable, cleanly-antialiased one. The hard
        // cutoff right at SPIRAL_START_CUT (below, same as before) is
        // still what actually makes it disappear, not this floor.
        const float SPIRAL_START_MIN_WIDTH = 0.002;
        spiralHalfWidth = mix(SPIRAL_START_MIN_WIDTH, spiralHalfWidth, startTaper);

        float radialDist = abs(rPixel - strandSpiralRadius);
        // A noticeably wide soft edge for the coil - a razor-hard edge
        // would both make thin strands glitch and leave a visible sliver
        // of background between strands that mathematically overlap,
        // since a hard edge has no blend margin to close that sliver
        // with. This wider blend band antialiases cleanly and softens
        // each strand's edge out a little further, closing up most of
        // that leftover empty space between neighboring strands.
        const float SPIRAL_EDGE_SOFT = 0.0012;
        float spiralCoverage = smoothstep(spiralHalfWidth + SPIRAL_EDGE_SOFT, spiralHalfWidth - SPIRAL_EDGE_SOFT, radialDist);

        // Instead of one uniform fade at the tail, each of the 52
        // strands simply stops at its own slightly different point
        // along the coil - a fixed, per-strand roll (seeded off fi
        // alone, so it never changes frame to frame) rather than
        // anything time-based. Collectively that ragged, staggered set
        // of stopping points is its own kind of fade-out, without any
        // single strand actually fading - each one is either fully
        // there or not drawn at all.
        //
        // This end check is tested against the shared spiralProgress
        // (the base center-line's progress), NOT strandSpiralProgress -
        // on purpose, unlike the start check right below it. A strand's
        // OWN progress isn't just the base progress plus a fixed amount,
        // it's the base progress scaled by a per-strand factor (roughly
        // 0.77x to 1.23x across the 52 strands, from how far out or in
        // its own radial offset sits) - fine for the width taper up at
        // the start, where that scaling just makes already-tiny widths
        // a little more or less tiny, but fatal for a hard stop/no-stop
        // test: measured against strandSpiralProgress, the outer-offset
        // half of the strands would cross their own random threshold
        // far EARLIER than intended (that factor inflates their own
        // progress reading), scattering their cutoffs across a much
        // wider range than the random rolls below actually call for -
        // "some ending in the wrong spots". Worse, the inner-offset
        // half's own progress never even reaches 0.985+ before running
        // out of coil to match against at all, so instead of fraying by
        // their own roll, EVERY ONE of them just rides to the coil's
        // actual physical end and stops there together - "most ending
        // in the same spot". Comparing the shared spiralProgress (the
        // same value for every strand at a given pixel) against each
        // strand's own threshold instead means every strand's stopping
        // point is set by its own random roll and nothing else, which
        // is exactly what this fray was supposed to look like.
        float strandEndRoll = hash1(fi * 7.919 + 11.3);
        // Each strand's own tail length now slowly grows and shrinks
        // too, on top of its fixed random stopping point above - this
        // is the actual "strand lengths grow and shrink" AJ asked for,
        // not the hollow-center breathing from before. Reusing
        // strandEndRoll itself as this strand's own phase offset
        // (already a unique, fixed 0..1 random number per strand, so no
        // extra hash1() call needed) keeps all 52 strands breathing out
        // of sync with each other instead of growing and shrinking in
        // one uniform pulse together, which is what makes it read as
        // loose, organic tendrils rather than a mechanical heartbeat.
        const float SPIRAL_TAIL_BREATHE_SPEED = 0.5; // how fast each strand's own tail grows/shrinks, in radians/second
        const float SPIRAL_TAIL_BREATHE_AMOUNT = 0.001; // how far each strand's tail grows/shrinks, at most, each direction
        float tailBreathe = SPIRAL_TAIL_BREATHE_AMOUNT * sin(uCometTime * SPIRAL_TAIL_BREATHE_SPEED + strandEndRoll * 6.28318);
        float strandEndProgress = clamp(mix(0.985, 1.0, strandEndRoll) + tailBreathe, 0.0, 1.0);
        if (strandSpiralProgress < SPIRAL_START_CUT || spiralProgress > strandEndProgress) {
            spiralCoverage = 0.0;
        }

        float coverage = spiralCoverage;
        coverageAccum = max(coverageAccum, coverage);

        // this pixel is nowhere near this strand - skip the rest of
        // this iteration's math entirely instead of paying for a full
        // comet calculation (several sin/exp calls) on every one of
        // the strands for every pixel on screen, most of which aren't
        // anywhere near the line at all
        if (coverage < 0.001) {
            continue;
        }

        // Two different ways to pick a strand's color, blended by
        // uColorSlotBias: lengthProgress fades along the coil's own
        // path (nudged a little by which slot in the bundle a strand
        // is in), while slotProgress ignores position along the coil
        // entirely and is purely which fixed left-to-right slot a
        // strand sits in - at full bias, every strand keeps the exact
        // same color its entire length, so the bundle reads as flat
        // parallel stripes following the curve rather than one color
        // fading into the next over distance.
        //
        // lengthProgress uses spiralProgress (distance along the coil,
        // center to edge), not t (plain vertical screen position) - the
        // coil winds back over the same rows of the screen more than
        // once, so coloring by t made the same color jump around to
        // wherever else on screen shared that row, instead of flowing
        // smoothly along the line itself. That's what was behind the
        // other half of the jagged look near the coil's start: tight
        // inner windings sit close together in SPACE but can be far
        // apart in t, so adjacent rings could land on very different,
        // clashing colors instead of a smooth gradient between
        // neighbors.
        //
        // spiralProgress itself is still squared before any of that,
        // though - it's an angle fraction (how far around the coil has
        // swept), not a length fraction (how much of the coil's actual
        // visible pixels have gone by), and on a spiral those are very
        // different: near the tight inner windings a given swing of
        // angle covers barely any physical distance (small radius), but
        // the exact same angle swing out by the loose outer windings
        // covers a lot (big radius) - so angle-fraction 0.5 is really
        // only about a quarter of the way along the coil by actual
        // visible length, not halfway. Coloring straight off that angle
        // fraction (what this used to do) squeezed most of the palette's
        // early colors into that tiny-length inner quarter and let the
        // back of the palette paint the other three-quarters of the
        // coil almost by itself - "barely any of the first color, way
        // too much of the last." Squaring closely approximates the
        // real angle-to-length curve (worked out from the same r = k*θ
        // relationship the matching loop above uses) well enough to fix
        // that with one line: it stretches the start of the palette
        // back out over its fair share of the coil's actual length, and
        // compresses the end back down to its fair share too.
        float arcLengthProgress = spiralProgress * spiralProgress;
        float lengthProgress = clamp(arcLengthProgress + (trunkRel / TRUNK_CENTER_INDEX) * 0.2, 0.0, 1.0);
        float slotProgress = clamp(trunkRel / TRUNK_CENTER_INDEX * 0.5 + 0.5, 0.0, 1.0);
        float strandProgress = clamp(mix(lengthProgress, slotProgress, uColorSlotBias) + colorShift, 0.0, 1.0);
        // spiralShade (see above) darkens color near the coil's own
        // center, as if that part sits behind the outer windings rather
        // than fading it toward transparent.
        vec3 strandColor = sectionPalette(strandProgress) * spiralShade;

        color = mix(color, strandColor, coverage * 1.0);

        // --- shooting-star shine ---
        // a thin white streak that starts somewhere along the line,
        // crawls a short distance, then fades back out - fade in and
        // fade out both happen fully inside this comet's own cycle, so
        // it never gets cut off abruptly when the next cycle starts.
        // Crawls along spiralProgress (0 at the coil's own center, 1 at
        // its outer edge) rather than t (plain vertical screen
        // position) - the coil loops back over the same rows of the
        // screen more than once, so t isn't a "how far along the line"
        // measurement here the way it is for a straight trunk. Using it
        // anyway was why every comet looked like it was crawling
        // straight down the page regardless of which way the coil
        // itself actually wound at that point - several of them ending
        // up visually converging near the screen's own vertical middle
        // (not the coil's actual center) rather than all simply moving
        // outward along the spiral together, and the ones on the big
        // outer rings looking especially disconnected from the curve
        // under them. spiralProgress moves smoothly and consistently
        // outward along the coil no matter how the coil winds, so every
        // comet now just crawls from the center out toward the tip,
        // the same direction as every other one.
        // uCometTime (not the raw uTime the site used to keep growing
        // for the life of the tab) is wrapped in JS every frame at an
        // exact multiple of cycleDuration, which keeps cycleIndex -
        // and therefore the hash1() seed below, which itself runs
        // through sin() - from ever growing into the range where
        // mediump float starts losing precision, no matter how long
        // the page has been sitting open. The wrap point always lands
        // exactly on a cycle boundary, so it never cuts a comet off
        // mid-flight or restarts one early.
        float cycleDuration = 4.5;
        float activeFrac = 0.85; // fraction of the cycle actually spent visible; the rest is a pause
        float localTime = uCometTime + fi * 0.41 * cycleDuration;
        float cycleIndex = floor(localTime / cycleDuration);
        float cycleTime = localTime - cycleIndex * cycleDuration;

        float seed = fi * 13.13 + cycleIndex * 7.77;
        float spawnRoll = hash1(seed);
        float startProgress = hash1(seed + 31.7) * 0.55;
        float cometSpeed = 0.05 + hash1(seed + 91.3) * 0.025; // very slow crawl

        float activeDuration = cycleDuration * activeFrac;
        float u = clamp(cycleTime / activeDuration, 0.0, 1.0);
        float fadeIn = smoothstep(0.0, 0.95, u);
        float fadeOut = 1.0 - smoothstep(0.65, 1.0, u);
        float lifeEnvelope = fadeIn * fadeOut;

        float cometHead = startProgress + cometSpeed * activeDuration * u;
        float behind = cometHead - spiralProgress;
        float tailLength = 0.025;

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
// below) and which way its ribbon leans. Adding a new page later is
// just adding an entry here - nothing else about the shader needs to
// change. Colors are 0-1 RGB.
//
// centerXBase (0 = screen's left edge, 1 = right edge) is chosen per
// section to lean AWAY from wherever that section's content box sits -
// see the .page-section / .page-section.alignRight split in style.css
// and the alignRight class on individual <section> tags in index.html.
// Every section except Railroader Mods now keeps its box on the left
// (no alignRight) and its ribbon leaning right (~0.65-0.74) - a single
// consistent layout rather than alternating sides section to section.
// Railroader Mods keeps alignRight (box right, ribbon left, ~0.26),
// intentionally excluded from this uniform rule so its bespoke look
// stays put. The exact centerXBase value still varies a little section
// to section for personality.
// Every section below calls plainTheme(), which fills in the shared
// coil/palette settings every section now uses.
function plainTheme(core) {
    return {
        ...core,
        colorSlotBias: 0.0,
    };
}

const SECTION_THEMES = {
    home: plainTheme({
        // full 24-color rainbow, per AJ - this is "the main one"
        colors: [
            [0.932, 0.168, 0.168], [0.932, 0.359, 0.168], [0.932, 0.550, 0.168], [0.932, 0.741, 0.168],
            [0.932, 0.932, 0.168], [0.741, 0.932, 0.168], [0.550, 0.932, 0.168], [0.359, 0.932, 0.168],
            [0.168, 0.932, 0.168], [0.168, 0.932, 0.359], [0.168, 0.932, 0.550], [0.168, 0.932, 0.741],
            [0.168, 0.932, 0.932], [0.168, 0.741, 0.932], [0.168, 0.550, 0.932], [0.168, 0.359, 0.932],
            [0.168, 0.168, 0.932], [0.359, 0.168, 0.932], [0.550, 0.168, 0.932], [0.741, 0.168, 0.932],
            [0.932, 0.168, 0.932], [0.932, 0.168, 0.741], [0.932, 0.168, 0.550], [0.932, 0.168, 0.359],
        ],
        // flagship page, matching how bold everything else about this
        // page already is. Box on the left, so the ribbon leans right -
        // furthest of the "box on the left" group.
        centerXBase: 0.75,
        drift: 0.05
    }),
    bio: plainTheme({
        colors: [[0.16, 0.71, 0.67], [0.35, 0.31, 0.78], [0.59, 0.24, 0.75]],
        // calm/personal page. Box on the left (every section but
        // Railroader Mods now keeps its div on the left), so the ribbon
        // leans right.
        centerXBase: 0.75,
        drift: 0.08
    }),
    // SparkStage and Railroader Mods used to be the two bespoke
    // exceptions, each on its own older wobbly fixed-entry-and-fork
    // system instead of the coil every other section uses. AJ figured
    // that difference was itself what was causing the remaining
    // seam/"weird legs" problems, and asked for them to use the exact
    // same spiral as everything else - so both are now plain
    // plainTheme() entries like the other seven, keeping only their own
    // colors and which side they lean toward.
    sparkstage: plainTheme({
        // red / green / blue, per AJ - echoes the logo's 3 colored orbs
        colors: [[0.9, 0.2, 0.2], [0.2, 0.78, 0.35], [0.24, 0.43, 0.9]],
        centerXBase: 0.75,
        drift: 0.13
    }),
    railroadermods: plainTheme({
        // NJ TRANSIT "disco stripe" colors - eyeballed off AJ's own
        // reference photo of an actual NJT bus (orange/magenta/blue
        // swoosh), nudged a little more vivid/saturated than the
        // original placeholder guesses were.
        colors: [[0.92, 0.42, 0.13], [0.78, 0.08, 0.50], [0.08, 0.30, 0.68]],
        // Box on the right, so the ribbon leans left - the furthest left
        // of any section.
        centerXBase: 0.75,
        drift: 0.4
    }),
    music: plainTheme({
        colors: [[0.9, 0.24, 0.59], [0.55, 0.27, 0.86], [0.2, 0.35, 0.78]],
        // Box on the left like every other non-excluded section now,
        // ribbon leans right but not as far as collegecoding's, for its
        // own distinct feel.
        centerXBase: 0.75,
        drift: 0.6
    }),
    soloprojects: plainTheme({
        colors: [[0.98, 0.78, 0.24], [1.0, 0.47, 0.24], [0.9, 0.31, 0.59]],
        // Box on the left, ribbon leans right.
        centerXBase: 0.75,
        drift: 0.8
    }),
    collegeperformances: plainTheme({
        colors: [[0.71, 0.16, 0.24], [0.86, 0.67, 0.24], [0.16, 0.24, 0.43]],
        // Box on the left, ribbon leans right.
        centerXBase: 0.75,
        drift: 1.0
    }),
    collegecoding: plainTheme({
        colors: [[0.24, 0.78, 0.86], [0.27, 0.47, 0.9], [0.35, 0.27, 0.78]],
        // Box on the left, ribbon leans right.
        centerXBase: 0.75,
        drift: 1.5
    }),
    resume: plainTheme({
        colors: [[0.35, 0.43, 0.55], [0.59, 0.59, 0.63], [0.16, 0.22, 0.35]],
        // Shouldn't upstage the actual resume PDF sitting on top of it.
        // Box on the left like every other non-excluded section now,
        // ribbon leans right, closest to center of any of the "leans
        // right" sections since it should stay the most unobtrusive.
        centerXBase: 0.75,
        drift: 1.8
    }),
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
        centerXBase: theme.centerXBase,
        colorSlotBias: theme.colorSlotBias,
        drift: theme.drift,
    };
}

// Same shape as cloneTheme's output, but for re-copying a theme
// that's ALREADY been resampled to MAX_PALETTE_STOPS stops (used to
// snapshot currentTheme itself below) - running it back through
// resamplePalette would be redundant and would also break, since
// resamplePalette expects a theme's original raw .colors list, not
// an already-expanded .stops array.
function cloneResampledTheme(t) {
    return {
        stops: t.stops.map((c) => c.slice()),
        centerXBase: t.centerXBase,
        colorSlotBias: t.colorSlotBias,
        drift: t.drift,
    };
}

function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// How long a section-to-section transition takes, start to finish.
// Easy to retune - smaller = snappier, bigger = more of a slow fade.
const THEME_TRANSITION_MS = 700;

// "current" is what actually gets sent to the shader every frame.
// Transitions are now a proper time-based eased tween instead of a
// per-frame percentage-of-the-remaining-gap lerp: "from" is a
// snapshot of wherever the ribbon actually was the instant a new
// section became active, "target" is where it's headed, and draw()
// re-derives current every frame as ease(elapsed / duration) of the
// way from "from" to "target". The old approach (current +=
// (target - current) * smoothing every frame) always moved a FIXED
// PERCENTAGE of whatever the remaining gap happened to be - which
// meant a big jump (say railroadermods's sharply negative curve to
// soloprojects') moved a lot of visual distance in the very first
// frame (reads as a sudden jump) and then crept the rest of the way
// with a long, slowly-fading tail (reads as never quite finishing) -
// while a small jump barely moved at all at first. Two sections
// could feel completely different to transition between even though
// the code was identical, and neither case actually finished per any
// fixed schedule. A fixed duration with easing looks and feels the
// same regardless of how different two themes are, and it actually
// completes right on time instead of asymptotically approaching it.
let currentTheme = cloneTheme(SECTION_THEMES[DEFAULT_THEME_KEY]);
let targetTheme = cloneTheme(SECTION_THEMES[DEFAULT_THEME_KEY]);
let fromTheme = cloneResampledTheme(currentTheme);
// Far enough in the past that the very first draw() call computes an
// elapsed time past THEME_TRANSITION_MS, so currentTheme starts out
// exactly equal to the default theme instead of playing a pointless
// intro transition from itself to itself.
let transitionStartMs = -1e9;
let activeSectionId = DEFAULT_THEME_KEY;

// A second, independent safety net against rapid section flip-
// flopping, on top of the pixel-based hysteresis in
// getMostVisibleSection below - see that comment for the full
// backstory. That hysteresis alone turned out not to be quite enough
// once the section themes got a lot more varied from each other (a
// wider color spread section to section): even the rare, marginal
// switches it still let through used to be visually small because
// every theme looked similar, but now the same rare switch can be a
// big, jarring jump. A hard minimum time between switches closes that
// gap directly, regardless of how different any two themes happen to
// be: no matter what the pixel hysteresis lets through, the active
// section still can't change more often than this.
const MIN_SECTION_SWITCH_INTERVAL_MS = 220;
let lastSectionSwitchMs = -1e9;

// Comet timing gets its own accumulator rather than reusing uTime too,
// wrapped at COMET_WRAP_SECONDS (an exact multiple of the shader's own
// 4.5s cycleDuration) so the wrap always lands precisely on a cycle
// boundary - a comet never gets cut off mid-flight or restarted early
// by the wrap, it's simply invisible.
const COMET_CYCLE_DURATION = 4.5;
const COMET_WRAP_SECONDS = COMET_CYCLE_DURATION * 200;
let cometTimeAccum = 0;
let lastFrameMs = null;

function setActiveSection(sectionId) {
    const theme = SECTION_THEMES[sectionId];
    if (!theme) {
        return;
    }

    // Only actually (re)start a transition when the section changed -
    // this gets called on every scroll/resize tick, often several
    // times while still sitting in the same section, and restarting
    // the tween on every one of those calls would keep resetting
    // progress back to 0 and the ribbon would never finish moving.
    if (sectionId !== activeSectionId) {
        const now = millis();
        if (now - lastSectionSwitchMs < MIN_SECTION_SWITCH_INTERVAL_MS) {
            // Too soon after the last switch - ignore this one. The
            // next scroll/resize tick will call this again, so a
            // genuine, sustained scroll into a new section still gets
            // picked up almost immediately; this only blocks switches
            // that are rapidly flip-flopping.
            return;
        }
        activeSectionId = sectionId;
        lastSectionSwitchMs = now;
        // Snapshot wherever the ribbon actually is RIGHT NOW (not the
        // previous section's theme) as the transition's starting
        // point, so scrolling through several sections quickly keeps
        // redirecting one continuous, smooth motion toward whatever
        // the latest section is instead of jumping back to a stale
        // starting value each time.
        fromTheme = cloneResampledTheme(currentTheme);
        targetTheme = cloneTheme(theme);
        transitionStartMs = now;
    }

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

// Finds whichever section currently covers the most of the viewport,
// by plain geometry (getBoundingClientRect) rather than an
// IntersectionObserver. iOS Safari has a known class of bugs where an
// IntersectionObserver can stop re-firing correctly after an
// orientation change - exactly what was happening here (the nav
// highlight and ribbon theme would freeze after rotating, even though
// native scrolling and the section content underneath kept working
// fine, since that part doesn't depend on this JS at all). Plain
// getBoundingClientRect checks driven directly by scroll/resize events
// don't have that failure mode.
// How much more visible area a different section needs over the
// currently-active one before this actually switches to it.
// Without this, right at the boundary between two sections their
// visible areas can be nearly tied, so a tiny scroll wobble flips
// "most visible" back and forth several times a second - and since
// every flip restarts the ribbon's theme transition toward a
// DIFFERENT target before the last one got anywhere, that's what was
// making the curve/colors visibly shake while scrolling through a
// section boundary instead of just crossing it once. Requiring a
// clear lead before switching (this is standard "hysteresis" - the
// same trick a thermostat uses so it doesn't click on and off
// rapidly at the target temperature) makes the currently-active
// section "sticky" through that ambiguous middle zone.
//
// This is expressed as a fraction of the viewport height (with a
// small fixed floor for very short viewports) instead of one flat
// pixel number. A flat 60px was enough back when every theme's curve
// looked fairly similar to its neighbors, so even a stray flip near
// the boundary wasn't very noticeable - but after widening how
// different each section's theme looks from the next (the "more
// variance" request), that same rare/marginal flip became a much
// bigger, more jarring visual jump. Scaling with viewport height also
// means this doesn't need separate tuning for phones vs. desktops.
const SECTION_SWITCH_HYSTERESIS_FRACTION = 0.22;
const SECTION_SWITCH_HYSTERESIS_MIN_PX = 140;

function getMostVisibleSection(sections, currentActiveId) {
    const viewportHeight = window.innerHeight;
    const hysteresisPx = Math.max(
        SECTION_SWITCH_HYSTERESIS_MIN_PX,
        viewportHeight * SECTION_SWITCH_HYSTERESIS_FRACTION
    );
    let best = null;
    let bestVisible = -1;
    let currentVisible = -1;
    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const visibleTop = Math.max(rect.top, 0);
        const visibleBottom = Math.min(rect.bottom, viewportHeight);
        const visible = Math.max(0, visibleBottom - visibleTop);
        if (section.id === currentActiveId) {
            currentVisible = visible;
        }
        if (visible > bestVisible) {
            bestVisible = visible;
            best = section;
        }
    });
    if (best && best.id !== currentActiveId && bestVisible < currentVisible + hysteresisPx) {
        const stillCurrent = document.getElementById(currentActiveId);
        if (stillCurrent) {
            return stillCurrent;
        }
    }
    return best;
}

// Watches every page section and switches the ribbon's target theme
// to whichever one is most in view. This fires the same way whether
// you scrolled there yourself or clicked a nav link - a nav click is
// just a scroll to that section's id, and this notices where you
// land either way, so there's only one code path to maintain. It also
// deliberately rechecks on resize AND on orientationchange (twice,
// since iOS can take a moment to settle the new layout after
// rotating) rather than trusting a single resize event to cover both.
function watchSections() {
    const scroller = document.querySelector(".page-scroller");
    const sections = document.querySelectorAll(".page-section");
    if (sections.length === 0) {
        return;
    }

    let ticking = false;
    function recheck() {
        ticking = false;
        const best = getMostVisibleSection(sections, activeSectionId);
        if (best) {
            setActiveSection(best.id);
        }
    }
    function onScrollOrResize() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(recheck);
        }
    }

    (scroller || window).addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("orientationchange", () => {
        setTimeout(recheck, 50);
        setTimeout(recheck, 300);
    });

    recheck();
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

    // Re-derive the live values as an eased point between "from" (a
    // snapshot of wherever the ribbon was when this transition
    // started) and "target" (the active section's theme) - see
    // setActiveSection/THEME_TRANSITION_MS above for why this is a
    // fixed-duration eased tween now instead of a per-frame lerp.
    // Every theme's palette has already been resampled to the same
    // fixed MAX_PALETTE_STOPS length (see resamplePalette/cloneTheme
    // above), so blending stop-by-stop here always lines up correctly
    // even when transitioning between a 3-color theme and a 24-color
    // rainbow one.
    const rawProgress = Math.min((millis() - transitionStartMs) / THEME_TRANSITION_MS, 1);
    const eased = easeInOutCubic(rawProgress);
    for (let i = 0; i < MAX_PALETTE_STOPS; i++) {
        for (let j = 0; j < 3; j++) {
            currentTheme.stops[i][j] = fromTheme.stops[i][j] + (targetTheme.stops[i][j] - fromTheme.stops[i][j]) * eased;
        }
    }
    currentTheme.centerXBase = fromTheme.centerXBase + (targetTheme.centerXBase - fromTheme.centerXBase) * eased;
    currentTheme.colorSlotBias = fromTheme.colorSlotBias + (targetTheme.colorSlotBias - fromTheme.colorSlotBias) * eased;
    currentTheme.drift = fromTheme.drift + (targetTheme.drift - fromTheme.drift) * eased;

    // Comet timing gets its own ever-advancing accumulator (wrapped at
    // COMET_WRAP_SECONDS so a comet never gets cut off mid-flight or
    // restarted early by the wrap - see its declaration above). dt is
    // this frame's own tiny elapsed time, clamped so a stale
    // lastFrameMs (first frame after page load, or after the tab was
    // backgrounded a while) can't hand it one huge one-off jump.
    const nowMs = millis();
    const dtSeconds = lastFrameMs === null ? 0 : Math.min(Math.max(0, (nowMs - lastFrameMs) / 1000), 0.25);
    lastFrameMs = nowMs;
    cometTimeAccum = (cometTimeAccum + dtSeconds) % COMET_WRAP_SECONDS;

    shader(flowShader);

    // Flatten the 24 [r,g,b] stops into one plain array of 72 numbers -
    // that's the layout p5/WebGL expects for a `uniform vec3 arr[24]`.
    const flatPalette = [];
    for (let i = 0; i < MAX_PALETTE_STOPS; i++) {
        flatPalette.push(currentTheme.stops[i][0], currentTheme.stops[i][1], currentTheme.stops[i][2]);
    }

    // gl_FragCoord is always in actual DEVICE pixels of the canvas's
    // backing buffer, not p5's CSS-pixel width/height - those only
    // match on a 1x-density display. Every Apple display (Retina Macs,
    // any iPhone) runs at 2x or 3x pixel density, so without this,
    // uv = gl_FragCoord/uResolution ranged 0-2 or 0-3 there instead of
    // 0-1, breaking every bit of positional math in the shader (strand
    // placement, coverage thresholds, the curve itself) - while a 1x
    // Windows display (most PC monitors) never showed the bug at all,
    // since on that hardware the two values happen to already match.
    const density = pixelDensity();
    flowShader.setUniform("uResolution", [width * density, height * density]);
    flowShader.setUniform("uCometTime", cometTimeAccum);
    flowShader.setUniform("uPalette", flatPalette);
    flowShader.setUniform("uColorSlotBias", currentTheme.colorSlotBias);
    flowShader.setUniform("uCenterXBase", currentTheme.centerXBase);
    flowShader.setUniform("uDrift", currentTheme.drift);

    rect(0, 0, width, height);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    // Belt-and-suspenders for browsers without ResizeObserver - a
    // window resize (including a phone rotation) is also a reasonable
    // time to recheck the nav's real height.
    updateNavHeightVar();
}
