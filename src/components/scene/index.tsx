import type { LevelData } from "../../lib/entities/level";
import { createContext, Suspense, useContext, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useControls } from "leva";
import { useScene } from "../../lib/entities/scene";

import SceneCanvas from "./canvas";
import ElevationRuler from "./elevation-ruler";
import Level from "./level";

type SceneContextProps = {
  levels: Map<string, LevelData>;
  setLevels: (
    levels:
      | Map<string, LevelData>
      | ((prev: Map<string, LevelData>) => Map<string, LevelData>)
  ) => void;
  activeLevel?: string;
};
const SceneContext = createContext<SceneContextProps>(
  null as unknown as SceneContextProps
);
function SceneProvider({ children }: { children: React.ReactNode }) {
  const [levels, setLevels] = useState<Map<string, LevelData>>(new Map());
  return (
    <SceneContext.Provider value={{ levels, setLevels }}>
      {children}
    </SceneContext.Provider>
  );
}
export function useSceneContext() {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error(
      "useSceneContext must be used within a SceneContext Provider"
    );
  }
  return context;
}

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
