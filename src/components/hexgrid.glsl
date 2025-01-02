varying vec3 localPosition;
varying vec4 worldPosition;

uniform vec3 worldCamProjPosition;
uniform vec3 worldCamTargetPosition;

// Grid controls
uniform float cellSize;
uniform float sectionSize;
uniform float cellThickness;
uniform float sectionThickness;

// Color controls
uniform vec3 cellColor;
uniform vec3 sectionColor;

// Fade controls
uniform float fadeDistance;
uniform float fadeStrength;
uniform float fadeFrom;

float getHexGrid(float size, float thickness) {
    // Normalize our position into “hex space”
    vec2 st = localPosition.xz / size;
    
    // Three axes for a regular 2D hex layout.
    // The idea is that each axis "cuts" lines at 120° from each other.
    // You can tweak these vectors to change orientation.
    const vec2 a1 = vec2(  0.5 * sqrt(3.0),  0.5 );
    const vec2 a2 = vec2(  0.0,              1.0 );
    const vec2 a3 = vec2( -0.5 * sqrt(3.0),  0.5 );
    
    // Project st onto each axis
    float v1 = dot(st, a1);
    float v2 = dot(st, a2);
    float v3 = dot(st, a3);
    
    // For each axis, we want a sawtooth pattern so we use fract(...).
    // Then shift by 0.5 so lines appear at “borders” rather than at 0.
    // Next, take absolute distance from 0.5, and divide by fwidth(...) to
    // ensure lines remain crisp with derivatives.
    v1 = abs(fract(v1) - 0.5) / fwidth(v1);
    v2 = abs(fract(v2) - 0.5) / fwidth(v2);
    v3 = abs(fract(v3) - 0.5) / fwidth(v3);
    
    // We combine them by taking the minimum. That yields lines
    // where any one of the three “axes” is near 0.5.
    float line = min(v1, min(v2, v3));
    
    // Subtract thickness from the line to control how thick the drawn lines are:
    line = line + (1.0 - thickness);
    
    // Convert to 0..1 where 1.0 is “on the line” and 0.0 is “inside cell”
    return 1.0 - clamp(line, 0.0, 1.0);
}

void main() {
    // Evaluate the hex pattern at “cell” scale and “section” scale
    float g1 = getHexGrid(cellSize, cellThickness);
    float g2 = getHexGrid(sectionSize, sectionThickness);

    // Distance fade logic
    vec3 from = worldCamTargetPosition;
    float dist = distance(from, worldPosition.xyz);

    // Fade factor: goes to 0 at fadeDistance away
    float d = 1.0 - min(dist / fadeDistance, 1.0);

    // Combine cell and section colors; you can adjust how these two combine
    vec3 color = mix(cellColor, sectionColor, min(1.0, sectionThickness * g2));

    // Combine alpha from both grids (g1 & g2), then fade
    gl_FragColor = vec4(color, (g1 + g2) * pow(d, fadeStrength));

    // Slightly emphasize “section” lines in alpha
    gl_FragColor.a = mix(0.75 * gl_FragColor.a, gl_FragColor.a, g2);

    // If everything is transparent, discard the fragment
    if (gl_FragColor.a <= 0.0) {
        discard;
    }

    // Tone mapping / color space conversions
    #include <tonemapping_fragment>
    #include <${version >= 154 ? "colorspace_fragment" : "encodings_fragment"}>
}
