import * as React from "react";
import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";
//import { shaderMaterial } from './shaderMaterial'
import { shaderMaterial } from "@react-three/drei/core";
import { ForwardRefComponent } from "@react-three/drei/helpers/ts-utils";
import { version } from "@react-three/drei/helpers/constants";
import vertexShader from './hexVertexShader.glsl'


export type GridMaterialType = {
  /** Cell size, default: 0.5 */
  cellSize?: number;
  /** Cell thickness, default: 0.5 */
  cellThickness?: number;
  /** Cell color, default: black */
  cellColor?: THREE.ColorRepresentation;
  /** Section size, default: 1 */
  sectionSize?: number;
  /** Section thickness, default: 1 */
  sectionThickness?: number;
  /** Section color, default: #2080ff */
  sectionColor?: THREE.ColorRepresentation;
  /** Follow camera, default: false */
  followCamera?: boolean;
  /** Display the grid infinitely, default: false */
  infiniteGrid?: boolean;
  /** Fade distance, default: 100 */
  fadeDistance?: number;
  /** Fade strength, default: 1 */
  fadeStrength?: number;
  /** Material side, default: THREE.BackSide */
  side?: THREE.Side;
};

export type GridProps = GridMaterialType & {
  /** Default plane-geometry arguments */
  args?: ConstructorParameters<typeof THREE.PlaneGeometry>;
};

import { ShaderMaterial, ShaderMaterialParameters } from 'three';
import { NodeProps, Overwrite, ExtendedColors } from '@react-three/fiber';

declare module '@react-three/fiber' {
  interface ThreeElements {
    gridMaterial: ExtendedColors<Overwrite<Partial<ShaderMaterial>, NodeProps<ShaderMaterial, [ShaderMaterialParameters]>>> & GridMaterialType;
  }
}

const GridMaterial = /* @__PURE__ */ shaderMaterial(
  {
    cellSize: 0.5,
    sectionSize: 1,
    fadeDistance: 100,
    fadeStrength: 1,
    cellThickness: 0.5,
    sectionThickness: 1,
    cellColor: /* @__PURE__ */ new THREE.Color(),
    sectionColor: /* @__PURE__ */ new THREE.Color(),
    infiniteGrid: false,
    followCamera: false,
    worldCamProjPosition: /* @__PURE__ */ new THREE.Vector3(),
    worldCamTargetPosition: /* @__PURE__ */ new THREE.Vector3(),
    worldPlanePosition: /* @__PURE__ */ new THREE.Vector3(),
  },
  /* glsl */ `
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform vec3 worldCamTargetPosition;
    uniform vec3 worldPlanePosition;
    uniform float fadeDistance;
    uniform bool infiniteGrid;
    uniform bool followCamera;

    void main() {
      localPosition = position.xzy;
      if (infiniteGrid) localPosition *= 1.0 + fadeDistance;
      
      worldPosition = modelMatrix * vec4(localPosition, 1.0);
      if (followCamera) {
        worldPosition.xyz += (worldCamProjPosition - worldPlanePosition);
        localPosition = (inverse(modelMatrix) * worldPosition).xyz;
      }

      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  /* glsl */ `
///////////////////////////////////////////////
// 1) Varying and uniform declarations
///////////////////////////////////////////////
varying vec3 localPosition;
varying vec4 worldPosition;

uniform vec3 worldCamProjPosition;
uniform vec3 worldCamTargetPosition;
uniform float cellSize;
uniform float sectionSize;
uniform vec3 cellColor;
uniform vec3 sectionColor;
uniform float fadeDistance;
uniform float fadeStrength;
uniform float cellThickness;
uniform float sectionThickness;

// ---------------------------------------------------------
// For pointy-top hexes, we can define:
#ifndef FLAT_TOP_HEXAGON
const vec2 HEX_SCALE = vec2(1.0, 1.7320508); 
#else
// For flat-top hexes, swap these:
const vec2 HEX_SCALE = vec2(1.7320508, 1.0);
#endif
// ---------------------------------------------------------

///////////////////////////////////////////////
// 2) Helper: “hex distance” function
//
// This is a 2D isosurface function for a single
// hex centered at (0,0).  eDist=0 at the *hex boundary*.
///////////////////////////////////////////////
float hexDistance(vec2 p)
{
  p = abs(p);

  #ifndef FLAT_TOP_HEXAGON
    // pointy-top boundary
    // If eDist < 0.5 => inside; eDist ~ 0.5 => boundary
    return max(dot(p, HEX_SCALE * 0.5), p.x);
  #else
    // flat-top boundary
    return max(dot(p, HEX_SCALE * 0.5), p.y);
  #endif
}

///////////////////////////////////////////////
// 3) Helper: getHex(...) returns the “local”
// hex position relative to the nearest hex center.
// We'll use it to measure how far from the edge we are.
///////////////////////////////////////////////
vec2 getHexCenterCoords(vec2 p)
{
  // We effectively find 2 candidate hex-centers
  // around the point p, pick whichever is closer.
  
  #ifndef FLAT_TOP_HEXAGON
    // pointy-top logic
    // For each candidate center:
    vec4 hC = floor(vec4(p, p - vec2(0.5, 1.0)) / HEX_SCALE.xyxy) + 0.5;
    vec4 h  = vec4(p - hC.xy * HEX_SCALE,
                   p - (hC.zw + 0.5) * HEX_SCALE);

    // Choose whichever candidate center is closer to p:
    return (dot(h.xy, h.xy) < dot(h.zw, h.zw)) ? h.xy : h.zw;
  #else
    // flat-top logic
    vec4 hC = floor(vec4(p, p - vec2(1.0, 0.5)) / HEX_SCALE.xyxy) + 0.5;
    vec4 h  = vec4(p - hC.xy * HEX_SCALE,
                   p - (hC.zw + 0.5) * HEX_SCALE);

    return (dot(h.xy, h.xy) < dot(h.zw, h.zw)) ? h.xy : h.zw;
  #endif
}

///////////////////////////////////////////////
// 4) Our replacement for getGrid(...), now
//    returns a hex line mask (0 or 1).
//    “thickness” is in screen-space units. 
///////////////////////////////////////////////
float getHexGrid(float size, float thickness)
{
  vec2 uv = localPosition.xz / size;
  vec2 c  = getHexCenterCoords(uv);
  float eDist = hexDistance(c);

  float boundaryDist = abs(eDist - 0.5);
  // some scale factor for thickness
  float w = fwidth(eDist) * thickness;

  // “1.0” only if boundaryDist < w
  float line = 1.0 - smoothstep(0.0, w, boundaryDist);

  return line;
}


///////////////////////////////////////////////
// 5) Main fragment 
///////////////////////////////////////////////
void main()
{
    //-----------------------------------------
    // 5a) Get two layers of hex lines:
    //     - "cell" lines
    //     - "section" lines
    //-----------------------------------------
    float g1 = getHexGrid(cellSize,     cellThickness);
    float g2 = getHexGrid(sectionSize,  sectionThickness);

    //-----------------------------------------
    // 5b) Distance-based fading (same logic
    //     as your original square-grid code)
    //-----------------------------------------
    vec3 from = worldCamTargetPosition;
    float dist = distance(from, worldPosition.xyz);
    float d    = 1.0 - min(dist / fadeDistance, 1.0);

    //-----------------------------------------
    // 5c) Compute color
    //     - mix cellColor and sectionColor
    //       so that "section lines" override
    //       cell lines
    //-----------------------------------------
    vec3 color = mix(cellColor, sectionColor, min(1.0, sectionThickness * g2));

    //-----------------------------------------
    // 5d) Combine alpha from both lines,
    //     then apply fade
    //-----------------------------------------
    // If either g1 or g2 is > 0, that means there's a line
    float alphaLines = (g1 + g2);
    if (alphaLines <= 0.0) discard;

    gl_FragColor = vec4(color, (g1 + g2) * pow(d, fadeStrength));


    // if the pixel is part of a "section" line (g2>0)
    // make it more opaque than cell lines alone.
    gl_FragColor.a = mix(0.75 * gl_FragColor.a, gl_FragColor.a, g2);

    // Cut out fully transparent
    if (gl_FragColor.a <= 0.0) discard;

    //-----------------------------------------
    // 5e) Tonemapping / color encoding
    //-----------------------------------------
    //#include <tonemapping_fragment>
    //#include <${version >= 154 ? "colorspace_fragment" : "encodings_fragment"}>
}

  `
);

export const Grid: ForwardRefComponent<Omit<JSX.IntrinsicElements["mesh"], "args"> & GridProps, THREE.Mesh> =
  /* @__PURE__ */ React.forwardRef(
    (
      {
        args,
        cellColor = "#fff",
        sectionColor = "#000",
        cellSize = 0.433,
        sectionSize = 1,
        followCamera = false,
        infiniteGrid = false,
        fadeDistance = 100,
        fadeStrength = 1,
        cellThickness = 1,
        sectionThickness = 1,
        side = THREE.BackSide,
        ...props
      }: Omit<JSX.IntrinsicElements["mesh"], "args"> & GridProps,
      fRef: React.ForwardedRef<THREE.Mesh>
    ) => {
      extend({ GridMaterial });

      const ref = React.useRef<THREE.Mesh>(null!);
      React.useImperativeHandle(fRef, () => ref.current, []);
      const plane = new THREE.Plane();
      const upVector = new THREE.Vector3(0, 1, 0);
      const zeroVector = new THREE.Vector3(0, 0, 0);
      const cameraDirection = new THREE.Vector3();

      useFrame((state) => {
        plane.setFromNormalAndCoplanarPoint(upVector, zeroVector).applyMatrix4(ref.current.matrixWorld);

        const gridMaterial = ref.current.material as THREE.ShaderMaterial;
        const worldCamProjPosition = gridMaterial.uniforms.worldCamProjPosition as THREE.Uniform<THREE.Vector3>;
        const worldPlanePosition = gridMaterial.uniforms.worldPlanePosition as THREE.Uniform<THREE.Vector3>;
        const worldCamTargetPosition = gridMaterial.uniforms.worldCamTargetPosition as THREE.Uniform<THREE.Vector3>;

        state.camera.getWorldDirection(cameraDirection);
        const ray = new THREE.Ray(state.camera.position, cameraDirection);

        ray.intersectPlane(plane, worldCamTargetPosition.value);

        plane.projectPoint(state.camera.position, worldCamProjPosition.value);
        worldPlanePosition.value.set(0, 0, 0).applyMatrix4(ref.current.matrixWorld);
      });

      const uniforms1 = {
        cellSize,
        sectionSize,
        cellColor,
        sectionColor,
        cellThickness,
        sectionThickness,
      };
      const uniforms2 = {
        fadeDistance,
        fadeStrength,
        infiniteGrid,
        followCamera,
      };

      return (
        <mesh ref={ref} frustumCulled={false} {...props}>
          <gridMaterial transparent extensions-derivatives side={side} {...uniforms1} {...uniforms2} />
          <planeGeometry args={args} />
        </mesh>
      );
    }
  );
