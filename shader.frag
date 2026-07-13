#ifdef GL_ES
precision mediump float;
#endif

// --- uniforms ---
uniform float uTime;
uniform int uParticleCount;
uniform int uMaxHistory;

uniform vec2 uPositions[16000];   // 200 * 80
uniform vec3 uColors[200];
uniform float uThickness[200];
uniform float uFade[200];

varying vec2 vTexCoord;

// --- SDF helper: distance from point to line segment (capsule core) ---
float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

// --- Hybrid ribbon shading: crisp core + soft halo ---
vec3 shadeRibbon(float dist, vec3 color, float thickness, float fade) {
    float core = smoothstep(thickness * 0.5, thickness * 0.0, dist);  
    float glow = smoothstep(thickness * 2.0, thickness * 0.5, dist);
    float intensity = core + glow * 0.5;
    intensity *= fade;
    return color * intensity;
}

// --- ONLY ONE MAIN FUNCTION ---
void main() {
    vec2 uv = vTexCoord;
    vec3 finalColor = vec3(0.0);

    // Loop through particles
    for (int i = 0; i < 200; i++) {
        if (i >= uParticleCount) break;

        vec3 pColor = uColors[i];
        float pThick = uThickness[i];
        float pFade  = uFade[i];

        // Loop through history segments
        for (int j = 0; j < 80 - 1; j++) {
            if (j >= uMaxHistory - 1) break;

            int idxA = i * uMaxHistory + j;
            int idxB = idxA + 1;

            vec2 a = uPositions[idxA];
            vec2 b = uPositions[idxB];

            if (a.x < 0.0 || b.x < 0.0) continue;

            float d = sdSegment(uv, a, b);
            finalColor += shadeRibbon(d, pColor, pThick, pFade);
        }
    }

    finalColor = clamp(finalColor, 0.0, 1.0);
    gl_FragColor = vec4(finalColor, 1.0);
}
