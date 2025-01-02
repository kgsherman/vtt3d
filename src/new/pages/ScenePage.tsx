import { NoToneMapping } from "three";
import { Canvas } from "@react-three/fiber";
import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useParams } from "react-router";
import { Suspense } from "react";
import Scene from "../components/scene/Scene";

const OrientationGizmo = () => (
  <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
    <GizmoViewport axisColors={["red", "green", "blue"]} labelColor="black" />
  </GizmoHelper>
);

const Camera = () => (
  <>
    <PerspectiveCamera makeDefault position={[100, 100, 100]} fov={50} />
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      enableDamping={true}
      dampingFactor={0.05}
      screenSpacePanning={false}
      makeDefault
    />
  </>
);

function ScenePage() {
  const { sceneId } = useParams();
  if (!sceneId) return <div>Scene not found</div>;
  return (
    <Canvas
      shadows
      gl={{
        toneMapping: NoToneMapping,
      }}
    >
      <Camera />
      <Suspense fallback={null}>
        <Scene sceneId={sceneId} />
      </Suspense>
      <OrientationGizmo />
    </Canvas>
  );
}

export default ScenePage;
