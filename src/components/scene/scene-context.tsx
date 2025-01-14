import { useState, useContext, createContext } from "react";

import { LevelData } from "../../lib/entities/level";

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
export function SceneProvider({ children }: { children: React.ReactNode }) {
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
