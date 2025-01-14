import { createContext, useContext, useEffect } from "react";
import { motion } from "framer-motion-3d";
import { LevelData, useLevelData } from "../../../lib/entities/level";
import MapImage from "./map-image";

import { useSceneContext } from "../scene-context";

type LevelContextProps = {
  data: LevelData;
};
const LevelContext = createContext<LevelContextProps>(
  null as unknown as LevelContextProps
);

export function useLevelContext() {
  const context = useContext(LevelContext);
  if (!context) {
    throw new Error(
      "useLevelContext must be used within a LevelContext Provider"
    );
  }
  return context;
}

export default function Level({ id, index }: { id: string; index: number }) {
  const data = useLevelData(id);
  console.log(`${data.name} - Fetched level data`);
  const { setLevels } = useSceneContext();

  useEffect(() => setLevels((prev) => new Map(prev.set(id, data))), [data]);

  return (
    <LevelContext.Provider value={{ data }}>
      <motion.object3D
        key={`level-${id}`}
        initial={{ y: -100 + data.elevation, scale: 0 }}
        animate={{
          y: 0 + data.elevation,
          scale: 1,
          transition: {
            delay: index * 0.1,
            stiffness: 2000,
            damping: 65,
            mass: 1,
            type: "spring",
          },
        }}
        exit={{
          y: data.elevation - 10,
          transition: {
            type: "tween",
            duration: 0.3,
            ease: "easeIn",
          },
        }}
      >
        <MapImage />
      </motion.object3D>
    </LevelContext.Provider>
  );
}
