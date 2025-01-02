/** Based on
      https://github.com/Fyrestar/THREE.InfiniteGridHelper by https://github.com/Fyrestar
      and https://github.com/threlte/threlte/blob/main/packages/extras/src/lib/components/Grid/Grid.svelte
        by https://github.com/grischaerbe and https://github.com/jerzakm
*/

import * as React from "react";
import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";
//import { shaderMaterial } from './shaderMaterial'
import { shaderMaterial } from "@react-three/drei/core";
import { ForwardRefComponent } from "@react-three/drei/helpers/ts-utils";
import { version } from "@react-three/drei/helpers/constants";

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
  /** Fade from camera (1) or origin (0), or somewhere in between, default: camera */
  fadeFrom?: number;
  /** Material side, default: THREE.BackSide */
  side?: THREE.Side;
};

export type GridProps = GridMaterialType & {
  /** Default plane-geometry arguments */
  args?: ConstructorParameters<typeof THREE.PlaneGeometry>;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      gridMaterial: JSX.IntrinsicElements["shaderMaterial"] & GridMaterialType;
    }
  }
}

const GridMaterial = /* @__PURE__ */ shaderMaterial(
  {
    cellSize: 0.5,
    sectionSize: 1,
    fadeDistance: 100,
    fadeStrength: 1,
    fadeFrom: 1,
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
  varying vec3 localPosition;   // .x, .z used for grid
  varying vec4 worldPosition;
  
  uniform vec3 worldCamTargetPosition;
  uniform float cellSize;          // side length of each hex
  uniform float sectionSize;       // side length for "section" lines
  uniform vec3 cellColor;
  uniform vec3 sectionColor;
  uniform float fadeDistance;
  uniform float fadeStrength;
  uniform float fadeFrom;
  uniform float cellThickness;
  uniform float sectionThickness;
  
  // For convenience:
  const float PI = 3.14159265358979323846;
  
  // 120° in radians
  const float ANG120 = 2.0 * PI / 3.0;  // 120°
  const float ANG240 = 4.0 * PI / 3.0;  // 240°
  
  /**
   * Returns a 0..1 alpha indicating how "in a line" we are.
   *  1.0 => on a hex edge; 0.0 => interior.
   *  Using three directions 120° apart for a pointy-top hex.
   */
  float getHexGrid(vec2 p, float side, float thickness)
  {
      // -- 1) Define the direction vectors for a pointy-top regular hex
      //    d0 = angle 0°, d1 = angle 120°, d2 = angle 240°.
      //    (We only need cos/sin for x or y.)
      vec2 d0 = vec2(cos(0.0),      sin(0.0));
      vec2 d1 = vec2(cos(ANG120),   sin(ANG120));
      vec2 d2 = vec2(cos(ANG240),   sin(ANG240));
  
      // -- 2) Project p onto each direction, scaled so that "1.0" in
      //    fractional space equals one hex side length.
      //    The factor k = 1.0 / side ensures that fract(dot(p,d)*k)
      //    repeats every ‘side’ units along that direction.
      float k = 1.0 / side;
      float p0 = dot(p, d0) * k;
      float p1 = dot(p, d1) * k;
      float p2 = dot(p, d2) * k;
  
      // -- 3) For each direction, detect how close fract(...) is to 0.0 or 1.0
      //    by checking |fract(...) - 0.5|. Then scale by 1/fwidth(...) for an
      //    anti-aliased line. 
      float l0 = abs(fract(p0) - 0.5) / fwidth(p0);
      float l1 = abs(fract(p1) - 0.5) / fwidth(p1);
      float l2 = abs(fract(p2) - 0.5) / fwidth(p2);
  
      // -- 4) Combine the line signals. The "min" merges line stripes 
      //    from all 3 directions so that we only see a line if p is
      //    near ANY of the 3 hex edges.
      float line = min(min(l0, l1), l2);
  
      // -- 5) Use thickness to widen/narrow the lines, then clamp to [0..1].
      //    "line" is large near edges, so we do 'line + (1 - thickness)',
      //    then invert so it becomes 1.0 near edges, 0.0 in the interior.
      line += (1.0 - thickness);
      return 1.0 - clamp(line, 0.0, 1.0);
  }
  
  void main()
  {
      // XZ plane
      vec2 p = localPosition.xz;
  
      // "Cell" lines (the smaller / more frequent hex pattern)
      float g1 = getHexGrid(p, cellSize, cellThickness);
  
      // "Section" lines (the bigger / sparser hex pattern)
      float g2 = getHexGrid(p, sectionSize, sectionThickness);
  
      // Combine the two line signals
      float combined = g1 + g2;
  
      // -- Fade logic (same as your original)
      float dist = distance(worldCamTargetPosition, worldPosition.xyz);
      float fade = 1.0 - min(dist / fadeDistance, 1.0);
      fade = pow(fade, fadeStrength);
  
      // -- Mix color: near the bigger lines => 'sectionColor', else 'cellColor'.
      //    We'll do a simple blend:
      vec3 color = mix(cellColor, sectionColor, min(1.0, sectionThickness * g2));
  
      // Final alpha is line intensity * fade
      float alpha = combined * fade;
  
      // Slightly boost alpha where the "section" lines are
      alpha = mix(0.75 * alpha, alpha, g2);
  
      // Output
      gl_FragColor = vec4(color, alpha);
  
      // Discard fully transparent fragments
      if (gl_FragColor.a <= 0.0) discard;
  
      // Tone mapping & color space
      #include <tonemapping_fragment>
      #include <${version >= 154 ? "colorspace_fragment" : "encodings_fragment"}>
  }
  
  `
);

export const Grid: ForwardRefComponent<Omit<JSX.IntrinsicElements["mesh"], "args"> & GridProps, THREE.Mesh> =
  /* @__PURE__ */ React.forwardRef(
    (
      {
        args,
        cellColor = "#000000",
        sectionColor = "#2080ff",
        cellSize = 0.5,
        sectionSize = 1,
        followCamera = false,
        infiniteGrid = false,
        fadeDistance = 100,
        fadeStrength = 1,
        fadeFrom = 1,
        cellThickness = 0.5,
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

        //     console.log(worldCamTargetPosition.value);

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
        fadeFrom,
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
