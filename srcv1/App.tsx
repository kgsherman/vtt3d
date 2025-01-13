import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { NoToneMapping } from "three";
import { KeyboardControls, KeyboardControlsEntry } from "@react-three/drei";
import { useMemo } from "react";
import { Controls } from "./controls";


function App() {
  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [{ name: Controls.showGrid, keys: ["Alt"] }],
    []
  );
  return (
    <KeyboardControls map={map}>
      <Canvas
        shadows
        gl={{
          toneMapping: NoToneMapping,
        }}
      >
        <Scene />
      </Canvas>
    </KeyboardControls>
  );
}

export default App;
