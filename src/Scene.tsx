import { OrbitControls, Sphere, Stage } from "@react-three/drei";
import { Grid } from "./components/HexGrid";
import { Grid as HexGrid, rectangle } from "honeycomb-grid";
import { MapImage } from "./components/MapImage";
import { Suspense, useRef, useState, useEffect } from "react";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";
import { Vector3 } from "@react-three/fiber";
import { defineHex } from "honeycomb-grid";

const GridComponent = () => (
  <Grid
    //position={gridPosition}
    position={[0, 0.01, 0]}
    args={[10, 10]}
    cellSize={1}
    cellThickness={0.5}
    cellColor="#fff"
    sectionSize={5}
    fadeStrength={1}
    fadeDistance={30}
    infiniteGrid={true}
    fadeFrom={0}
  />
);

const Hex = defineHex();
const rectangularGrid = new HexGrid(Hex, rectangle({ width: 5, height: 5 }));

function Scene() {
  return (
    <>
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        screenSpacePanning={false}
      />
      <Stage>
        <Suspense fallback={null}>
          <MapImage imageUrl="assets/mattmap.jpg" ppf={140 / 5} />
        </Suspense>
        <GridComponent />
        <Sphere>
          <meshStandardMaterial color="hotpink" />
        </Sphere>
      </Stage>
    </>
  );
}

export default Scene;
