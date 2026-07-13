let flowShader;

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


//webgl random functions

float random(vec2 st) {
    return fract(
        sin(dot(st.xy, vec2(12.9898,78.233)))
        * 43758.5453123
    );
}

float noise(vec2 st) {

    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x)
        + (c - a) * u.y * (1.0 - u.x)
        + (d - b) * u.x * u.y;
}

    //scroll variable
    uniform float uScroll;

void main() {

    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    vec3 background = vec3(0.8, 0.8, 0.85);
    vec3 color = background;

    float life = 1.0 - uv.y;

    for(float i = 0.0; i < 50.0; i++) {

        // evenly space lines
        float startX = 0.25;
        float endX = 0.75;

        // use uv.y to move between them
        float px = mix(startX, endX, uv.y);
        px += (i - 50.0) * 0.0003;

        //different wave patterns using noise to add varience to lines even after they were spawned in
        float wave1 =
            (noise(vec2(
                uv.y * 2.0 + uTime * 0.05 + uScroll ,
                i * 0.15
            )) - 0.5);

        float wave2 =
            (noise(vec2(
                uv.y * 6.0 - uTime * 0.08 + uScroll ,
                i * 0.11 + 40.0
            )) - 0.5);

        float wave =
            wave1 * 0.06 +
            wave2 * 0.025;

        // distance to line
        float d = abs(uv.x - px + wave);

        // glow
        float line = smoothstep(0.0015, 0.0, d);

        // add line color
        vec3 orange = vec3(1.0, 0.5, 0.1);
        vec3 magenta = vec3(0.8, 0.2, 1.0);
        vec3 blue = vec3(0.1, 0.5, 1.0);

        vec3 gradientColor;

        // first half: orange -> magenta
        if(life < 0.5) {

            float t = life / 0.5;

            gradientColor = mix(
                orange,
                magenta,
                t
            );

        } else {

            // second half: magenta -> blue
            float t = (life - 0.5) / 0.5;

            gradientColor = mix(
                magenta,
                blue,
                t
            );
        }
        color = mix(
            color,
            gradientColor,
            line * 0.45
        );
    }

    gl_FragColor = vec4(color, 1.0);
}
`;

function setup() {

    let canvas = createCanvas(windowWidth, document.body.scrollHeight, WEBGL);

    canvas.parent("canvas-container");

    noStroke();

    flowShader = createShader(vertShader, fragShader);
}

function draw() {

    shader(flowShader);

    flowShader.setUniform("uResolution", [width, height]);
    flowShader.setUniform("uTime", millis() * 0.001);

    // convert scroll to something usable
    let scroll = window.scrollY || document.documentElement.scrollTop;

    flowShader.setUniform("uScroll", scroll * 0.001);

    rect(0, 0, width, height);
}

function windowResized() {
    resizeCanvas(windowWidth, document.body.scrollHeight, WEBGL);
}