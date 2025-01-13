import { NoToneMapping } from "three";
import { Canvas } from "@react-three/fiber";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

export default function SceneCanvas({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Canvas
      shadows
      gl={{
        toneMapping: NoToneMapping,
      }}
    >
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
      {children}
    </Canvas>
  );
}
