import { Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { useControls } from "leva";

import { SceneProvider } from "./scene-context";
import { useScene } from "../../lib/entities/scene";

import SceneCanvas from "./canvas";
import ElevationRuler from "./elevation-ruler/index";
import Level from "./level";
import { Preload } from "@react-three/drei";

function Scene() {
  const { mounted } = useControls({
    mounted: { value: false, label: "Mounted" },
  });

  const { useSceneLevelIds } = useScene("2c707734-38f2-446f-85aa-25a4d6f8eb57");
  const sceneLevelIds = useSceneLevelIds();

  return (
    <div
      id="scene"
      className="w-full h-full  text-white bg-linear-to-bl from-slate-900 to-slate-950"
    >
      <SceneProvider>
        <SceneCanvas>
          <AnimatePresence>
            {mounted &&
              sceneLevelIds.map((levelId, i) => (
                <Suspense key={`loading-${levelId}`} fallback={<object3D />}>
                  <Level id={levelId} key={levelId} index={i} />
                  <Preload all />
                </Suspense>
              ))}
          </AnimatePresence>
          <mesh>
            <boxGeometry />
            <meshBasicMaterial color="hotpink" />
          </mesh>
        </SceneCanvas>
        <ElevationRuler />
      </SceneProvider>
    </div>
  );
}

export default function SceneContainer() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Scene />
    </Suspense>
  );
}
