import {
  OrbitControls,
  GizmoHelper,
  GizmoViewport,
  PerspectiveCamera,
  Select,
  PerformanceMonitor,
  useKeyboardControls,
} from "@react-three/drei";
import { Grid } from "./components/HexGridPlane";
import { grid } from "./components/hexGrid";
import { MapImage } from "./components/MapImage";
import { Suspense } from "react";
import { Unit } from "./components/Unit";
import { Unit as Unit2 } from "./components/Unit2";
import { Plane, Vector3 } from "three";
import { SelectionProvider } from "./components/UnitManager";
import { Actor } from "./system/actor";
import { Controls } from "./controls";



const GridComponent = () => (
  <Grid
    //position={gridPosition}
    position={[0, 0.1, 0]}
    args={[10, 10]}
    cellSize={0.433 * 2}
    cellThickness={0.5}
    cellColor="#fff"
    sectionSize={5}
    fadeStrength={1}
    fadeDistance={30}
    infiniteGrid={true}
  />
);

const steve = new Actor();

function Scene() {
    const showGrid = useKeyboardControls<Controls>(state => state.showGrid)
  
  const groundPlane = new Plane(new Vector3(0, 1, 0), 0);
  console.log("rendering scene");
  return (
    <>
      <ambientLight />
      <hemisphereLight color={0xffffff} groundColor={0x444444} intensity={1} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={0.1}
        shadow-camera-far={200}
      />

      <PerspectiveCamera makeDefault position={[100, 100, 100]} fov={50} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        screenSpacePanning={false}
      />

      <Suspense fallback={null}>
        <MapImage imageUrl="assets/mattmap.jpg" ppf={140 / 5} />
      </Suspense>
      {showGrid && <GridComponent />}
      {/* <Unit size={5} grid={grid} groundPlane={groundPlane} /> */}
      <SelectionProvider>
        <Suspense fallback={null}>
          <Unit2 actor={steve} grid={grid} ground={groundPlane} />
        </Suspense>
      </SelectionProvider>

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport
          axisColors={["red", "green", "blue"]}
          labelColor="black"
        />
      </GizmoHelper>
    </>
  );
}

export default Scene;
