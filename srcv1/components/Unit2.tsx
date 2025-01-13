import { Box3, Group, Mesh, Object3D, Plane, Vector3 } from "three";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useGLTF, useKeyboardControls } from "@react-three/drei";

import { Grid, Hex } from "honeycomb-grid";
import { HexRing } from "./HexRing";

import { Actor } from "../system/actor";
import {
  Object3DProps,
  ThreeEvent,
  useFrame,
  useThree,
} from "@react-three/fiber";

import { useSpring, animated } from "@react-spring/three";
import { useSelectionStore } from "../stores/selectionStore";
import { Controls } from "../controls";

useGLTF.preload("/assets/gobbo.gltf");

const lol = () => <object3D></object3D>

type GobboProps = Object3DProps & {
  selected?: boolean;
  meshGroup: Group;
};
const Gobbo = ({ meshGroup, ...props }: GobboProps) => {
  const [baseMesh, setBaseMesh] = useState<Mesh | null>(null);
  const [modelOffset, setModelOffset] = useState<Vector3>(new Vector3());
  const [modelScale, setModelScale] = useState<Vector3>(new Vector3(1, 1, 1));

  useEffect(() => {
    if (!meshGroup) return;

    meshGroup.traverse((mesh) => {
      mesh.castShadow = true;
      if (mesh.name === "Object_4") {
        setBaseMesh(mesh as Mesh);
      }
    });
  }, [meshGroup]);

  useEffect(() => {
    if (!baseMesh) return;

    const box = new Box3().setFromObject(baseMesh);
    const boxCenter = new Vector3();
    box.getCenter(boxCenter);
    const boxDimensions = new Vector3();
    box.getSize(boxDimensions);

    setModelOffset(new Vector3(-boxCenter.x, -box.min.y, -boxCenter.z));

    const scaleFactor = 5 / Math.max(boxDimensions.x, boxDimensions.z);
    const scale = scaleFactor * 0.66;
    setModelScale(new Vector3(scale, scale, scale));
  }, [baseMesh]);

  console.log("rendering gobbo");
  return (
    <object3D scale={modelScale}>
      <primitive object={meshGroup} position={modelOffset} {...props} />
    </object3D>
  );
};

function UnitModel({ actorId }: { actorId: string }) {
  const { scene } = useGLTF("/assets/gobbo.gltf");
  const [meshGroup, setMeshGroup] = useState<Group>(scene);

  useEffect(() => {
    const cloned = scene.clone(true);
    setMeshGroup(cloned);
  }, [scene]);

  const pickedUp = useSelectionStore((state) => state.isSelected(actorId));
  const [{ positionY, rotationX, rotationZ }, api] = useSpring(() => ({
    positionY: 0,
    rotationX: 0,
    rotationZ: 0,
    config: {
      tension: 250,
      friction: 15,
    },
  }));

  const handlePickup = useCallback(() => {
    api.start({
      positionY: 3.5,
      rotationX: Math.sin(Date.now() * 0.002) * 0.05,
      rotationZ: Math.cos(Date.now() * 0.002) * 0.05,
      config: {
        tension: 250,
        friction: 15,
      },
    });
  }, [api]);

  const handleEndPickup = useCallback(() => {
    api.start({
      positionY: 0,
      rotationX: 0,
      rotationZ: 0,
      config: {
        tension: 750,
        friction: 50,
      },
    });
  }, [api]);

  useEffect(() => {
    if (!pickedUp) {
      handleEndPickup();
    }
  }, [handleEndPickup, pickedUp]);

  useFrame(() => {
    if (pickedUp) {
      handlePickup();
    }
  });
  return (
    <animated.object3D
      position-y={positionY}
      rotation-x={rotationX}
      rotation-z={rotationZ}
    >
      {meshGroup ? <Gobbo meshGroup={meshGroup} /> : <FallbackUnitModel />}
    </animated.object3D>
  );
}

function FallbackUnitModel() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

interface UnitProps {
  actor: Actor;
  grid: Grid<Hex>;
  ground: Plane;
  size?: number;
  startPosition?: Vector3;
}

const intersection = new Vector3();
export function Unit({
  actor,
  grid,
  ground,
  size = 5,
  startPosition = new Vector3(),
  ...props
}: UnitProps) {
  const { pointer, camera, raycaster } = useThree();
  const objRef = useRef<Object3D>(null);
  const pickedUp = useSelectionStore((state) => state.isSelected(actor.id));
  const showGrid = useKeyboardControls<Controls>(state => state.showGrid)

  const [currentHex, setCurrentHex] = useState<Hex>(
    grid.pointToHex({
      x: startPosition.x,
      y: startPosition.z,
    })
  );
  const [targetHex, setTargetHex] = useState<Hex | null>(null);

  const toggleSelected = useSelectionStore((state) => state.toggleSelected);
  const [{ x, z }, api] = useSpring(() => ({
    x: intersection.x,
    z: intersection.z,
  }));

  const handleOnClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    toggleSelected(actor);
  };

  const handlePickup = useCallback(() => {
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(ground, intersection);
    const { x, z } = intersection;

    const hex = grid.pointToHex({ x: x, y: z });
    if (hex !== currentHex) {
      api.start({
        x: hex.x,
        z: hex.y,
      });
      setCurrentHex(hex);
    }
  }, [api, camera, currentHex, grid, ground, pointer, raycaster]);

  const handleEndPickup = useCallback(() => {
    const { x, y } = currentHex;
    api.start({
      x,
      z: y,
      config: {
        tension: 750,
        friction: 50,
      },
    });
  }, [api, currentHex]);

  useFrame((state, delta) => {
    if (!objRef.current) return;

    if (pickedUp) {
      handlePickup();
    }
  });

  useEffect(() => {
    if (!pickedUp) {
      handleEndPickup();
    }
  }, [handleEndPickup, pickedUp]);

  console.log("rendering unit");
  return (
    <group>
      <animated.object3D
        ref={objRef}
        position-x={x}
        position-z={z}
        onClick={handleOnClick}
        {...props}
      >
        <Suspense fallback={<FallbackUnitModel />}>
          <UnitModel actorId={actor.id} />
        </Suspense>
      </animated.object3D>

      {(pickedUp || showGrid) && (
        <HexRing
          onClick={handleOnClick}
          grid={grid}
          hex={currentHex}
          size={size}
        />
      )}
    </group>
  );
}
