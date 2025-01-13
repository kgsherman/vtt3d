import { Line, useGLTF } from "@react-three/drei";
import { Direction, Grid, Hex, spiral } from "honeycomb-grid";
import { Vector3, Plane, Raycaster } from "three";
import { useState, useMemo, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";




import * as THREE from "three";

interface UnitProps {
  size?: number;
  grid: Grid<Hex>;
  groundPlane: Plane;
}

interface HexOutlineProps {
  grid: Grid<Hex>;
  hex: Hex;
  size: number;
}

export const HexOutline = ({ grid, hex, size }: HexOutlineProps) => {
  // Get all hexes within the specified spiral
  const spiralTraverser = spiral({
    start: [hex.q, hex.r],
    radius: Math.floor(size / 2),
  });
  const gridInRange = grid.traverse(spiralTraverser);
  const hexesInRange = gridInRange.toArray();

  // Collect boundary edges
  const boundaryEdges = useMemo(() => {
    const edges: Vector3[][] = [];

    // corners start east and go clockwise

    for (const h of hexesInRange) {
      const pointyDirections = [
        Direction.E,
        Direction.SE,
        Direction.SW,
        Direction.W,
        Direction.NW,
        Direction.NE,
      ];
      const corners = h.corners; // 6 corners in a typical hex

      pointyDirections.forEach((direction, i) => {
        const neighbor = gridInRange.neighborOf([h.q, h.r], direction, {
          allowOutside: false,
        });

        if (!neighbor) {
          const c1 = corners[i];
          const c2 = corners[(i + 1) % 6];

          edges.push([
            new Vector3(c1.x, 0.1, c1.y),
            new Vector3(c2.x, 0.1, c2.y),
          ]);
        }
      });
    }

    return edges;
  }, [gridInRange, hexesInRange]);

  return (
    <>
      {boundaryEdges.map((edge, i) => (
        <Line
          key={i}
          points={edge}
          color="hotpink"
          lineWidth={5}
          transparent
          opacity={0.5}
        />
      ))}
    </>
  );
};

export function Unit({ size = 5, grid, groundPlane }: UnitProps) {
  const { scene } = useGLTF("/assets/gobbo.gltf");
  const [worldPosition, setWorldPosition] = useState<Vector3>(new Vector3());
  const [currentHex, setCurrentHex] = useState<Hex | null>(null);
  const { camera, mouse } = useThree();
  const raycaster = new Raycaster();
  const [modelScale, setModelScale] = useState(1);
  const [vel, setVel] = useState(0);
  const posx = useMotionValue(1);
  const posz = useMotionValue(1);
  const [tiltRotation, setTiltRotation] = useState(0);
  const [accel, setAccel] = useState(0);
  const tiltRot = useSpring(0, { stiffness: 750, damping: 25 });
  const headingRot = useSpring(0, { stiffness: 750, damping: 25 });

  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
  const velocityToTilt = (velocity: number) => {
    // Map velocity 0-10 to sigmoid curve -6 to 6
    const mapped = (velocity / 10 * 12) - 6;
    // Map sigmoid output 0-1 to tilt 0-0.3
    return sigmoid(mapped) * 0.3;
  };

  const clonedScene = scene.clone(true);

  useEffect(() => {
    // Find Object_4
    let targetObject = null;
    clonedScene.traverse((object) => {
      object.castShadow = true;

      if (object.name === "Object_4") {
        targetObject = object;
      }
    });

    if (targetObject) {
      const box = new THREE.Box3().setFromObject(targetObject);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const dimensions = new THREE.Vector3();
      box.getSize(dimensions);

      // shift so that the "base" is at y=0
      clonedScene.position.set(
        -center.x, // center the model in X
        -box.min.y, // move the bottom of the bounding box to y=0
        -center.z // center the model in Z
      );

      // If you still want to scale so the base fits 5x5:
      const scaleFactor = 5 / Math.max(dimensions.x, dimensions.z);
      setModelScale(scaleFactor * 0.66);
    }

    console.log("clonedScene changed");
  }, [clonedScene]);

  useFrame(() => {
    raycaster.setFromCamera(mouse, camera);
    const intersection = new Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersection);

    if (intersection) {
      const hex = grid.pointToHex({ x: intersection.x, y: intersection.z });
      if (hex) {
        const { x, y } = hex;
        setWorldPosition(new Vector3(x, 0, y));
        setCurrentHex(hex);
      }
    }

    const newVelX = posx.getVelocity();
    const newVelZ = posz.getVelocity();

    const newVel = Math.sqrt(newVelX ** 2 + newVelZ ** 2);

    // Calculate direction vector
    const directionX = worldPosition.x - posx.get();
    const directionZ = worldPosition.z - posz.get();
    
    // Calculate heading angle (y-axis rotation)
    const heading = Math.atan2(directionX, directionZ);
    headingRot.set(heading);

    
    // Get tilt (x-axis rotation) from velocity
    const tiltAngle = velocityToTilt(Math.abs(newVel));
    tiltRot.set(tiltAngle);

  });

  return (
    <>
      <motion.group
        scale={[modelScale, modelScale, modelScale]}
        position-x={posx}
        position-z={posz}

        animate={{
          x: worldPosition.x,
          y: worldPosition.y,
          z: worldPosition.z,
        }}
        transition={{ type: "spring", bounce: 0.2, duration: 1 }}
      >
        <primitive object={clonedScene} />
      </motion.group>
      {currentHex && <HexOutline grid={grid} hex={currentHex} size={size} />}
    </>
  );
}

useGLTF.preload("/assets/gobbo.gltf");
