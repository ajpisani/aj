// shader constants (same as before)
const HOLO_VERT = `
attribute vec3 aPosition;

void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);

  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

  gl_Position = positionVec4;
}
`;

const HOLO_FRAG = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_res;
uniform float u_size;
uniform float u_seed;
uniform float u_time;

vec3 rainbow(float t) {
  return 0.5 + 0.5 * cos(6.2831 * (t + vec3(0.0, 0.33, 0.66)));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;

  vec3 color = vec3(0.375, 0.375, 0.375);
  
  float autoDrift =
      sin(u_time * 1.25 + u_seed) * 0.35;

    float holoWave =
    sin(uv.x * 8.0 + u_size * 2.5 + autoDrift + u_seed) * 0.2 +
    sin(uv.y * 6.0 - u_size * 2.0 + autoDrift + u_seed) * 0.2;

    vec3 surfaceHolo = rainbow(
        uv.x * 1.5 +
        uv.y * 0.8 +
        holoWave
    );

float center =
    mix(1.1, 0.1, u_size) + (autoDrift / 4.0);

  // distance from shine center
  float dist = uv.x - center;

  // white shine
  float shine =
      smoothstep(0.595, 0.0, abs(dist));


 vec3 holo = rainbow(
    uv.x * 6.0 +
    uv.y * 2.5 +
    sin(u_time * 0.75 + u_seed) * 0.5
);

  color += surfaceHolo * 0.5;
  color = mix(color, color + vec3(0.75),0.35 * shine);
  color += holo * shine * 0.015;

  gl_FragColor = vec4(color, 1.0);
}
`;

const boxes = document.querySelectorAll(".shineEffect");

//for each shine box
boxes.forEach((box) => {
  console.log("creating shader for box", box);

  //create a new p5 istance
  new p5((p) => {

    //initialize variables for shader, animation, and canvas
    let holoShader;
    let hoverAnimation = 0;
    let canvas;
    let seed;

    //create a setup function for each instance
    p.setup = () => {

      //set pd to 1
      p.pixelDensity(1);

      //set the seed to a random number between 0 and 1000
      seed = Math.random() * 1000;

      //create a canvas the size of the box, with WEBGL mode
      canvas = p.createCanvas(
        box.clientWidth,
        box.clientHeight,
        p.WEBGL
      );

      //assign the canvas to the shineCanvas divs inside the box
      canvas.parent(
        box.querySelector(".shineCanvas")
      );

      //set the corners of the canvas to the corners of the text box
      const elt = canvas.elt;

      elt.style.position = "absolute";
      elt.style.top = "0";
      elt.style.left = "0";
      elt.style.width = "100%";
      elt.style.height = "100%";
      elt.style.display = "block";

      //disable borders for shapes in the canvas
      p.noStroke();

      //create a variable to hold the vertex and fragment data for the shaders
      holoShader = new p5.Shader(
        p._renderer,
        HOLO_VERT,
        HOLO_FRAG
      );

    };

    //create a draw function for each instance
    p.draw = () => {

      //if the width or height does not match the box's client width or height,
      if (
        p.width !== box.clientWidth ||
        p.height !== box.clientHeight
      ) {
        //resize it
        p.resizeCanvas(
          box.clientWidth,
          box.clientHeight
        );
      }

      //set the shader to the holographic shader (holoShader)
      p.shader(holoShader);

      //set the time variable to p5 (mili)seconds timer (/1000)
      holoShader.setUniform(
        "u_time",
        p.millis() / 1000
      );

      //set the resolutuion variable to the width and height of the canvas and textbox
      holoShader.setUniform(
        "u_res",
        [p.width, p.height]
      );

      //set a kind of true of false variable for whether the box is being hovered over
      let targetHover =
        box.matches(':hover') ? 1 : 0;

      //if the box IS being hovered over, move the hoverAnimation variable towards 1, otherwise move it towards 0
      hoverAnimation = p.lerp(
        hoverAnimation,
        targetHover,
        0.085
      );

      //set the seed variable fot glsl to the seed variable in js with the random number
      holoShader.setUniform(
      "u_seed",
      seed
      );

      //set the u_size variable to the hoverAnimation variable so it can move the shader
      holoShader.setUniform(
        "u_size",
        hoverAnimation
      );

      //create a rectangle the size of the canvas
      p.rect(
        0,
        0,
        p.width,
        p.height
      );
    };

  });

});



