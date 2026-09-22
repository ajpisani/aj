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
  return 0.35 + 0.35 * cos(6.2831 * (t + vec3(0.0, 0.33, 0.66)));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;

  vec3 color = vec3(0.375, 0.375, 0.375);
  
  float autoDrift =
      sin(u_time * 1.25 + u_seed) * 0.015;

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
      smoothstep(0.25, 0.0, abs(dist));


 vec3 holo = rainbow(
    uv.x * 6.0 +
    uv.y * 2.5 +
    sin(u_time * 0.75 + u_seed) * 0.5
);

  color += surfaceHolo * 0.5;
  color = mix(color, color + vec3(0.75),0.35 * shine);
  color += holo * shine * 0.005;

  // Let the box see through to whatever is behind it (the njt ribbon
  // shader, on its own canvas further back in the page) instead of
  // painting every pixel fully opaque. Mostly translucent by default
  // so the ribbon's color reads clearly through the glass, rising
  // toward more opaque right where the bright shine streak passes
  // over, so the holographic sheen itself still pops instead of
  // washing out flat.
  float alpha = mix(0.75, 0.95, shine);

  gl_FragColor = vec4(color, alpha);
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
    //track whether this box is actually on screen, and whether its
    //WebGL context is currently alive, so we can skip GPU work rather
    //than running several of these shaders at once even when scrolled
    //out of view (a real cost on mobile, which has a much smaller
    //GPU/memory budget than desktop)
    let isVisible = true;
    let contextLost = false;

    //create a setup function for each instance
    p.setup = () => {

      //set pd to 1
      p.pixelDensity(1);

      //ask for an alpha channel on the WebGL context BEFORE the canvas
      //is created, so pixels this shader draws with alpha < 1 actually
      //composite with whatever's behind the canvas element (the box's
      //own translucent background, and the ribbon shader further back)
      //instead of being forced fully opaque
      p.setAttributes('alpha', true);

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

      //only run this shader's draw loop while its box is actually
      //scrolled into view
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisible = entry.isIntersecting;
          });
        },
        { threshold: 0 }
      );
      observer.observe(box);

      //if the GPU drops this context under memory/driver pressure,
      //stop touching it instead of throwing every frame, and rebuild
      //the shader if the context comes back
      canvas.elt.addEventListener("webglcontextlost", (e) => {
        e.preventDefault();
        contextLost = true;
        console.warn("Shine shader: WebGL context lost, pausing.");
      }, false);

      canvas.elt.addEventListener("webglcontextrestored", () => {
        console.warn("Shine shader: WebGL context restored, rebuilding shader.");
        holoShader = new p5.Shader(p._renderer, HOLO_VERT, HOLO_FRAG);
        contextLost = false;
      }, false);

    };

    //create a draw function for each instance
    p.draw = () => {

      //skip all GPU work while off-screen or while the context is lost
      if (!isVisible || contextLost) {
        return;
      }

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

      //clear the canvas each frame instead of leaving old pixels
      //behind - needed now that this shader draws with transparency,
      //since an overwrite is no longer guaranteed to fully replace the
      //previous frame's alpha the way a fully-opaque draw did
      p.clear();

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



