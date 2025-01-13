import { Line } from "@react-three/drei";
import { Direction, Grid, Hex, spiral } from "honeycomb-grid";
import { useMemo } from "react";
import { DoubleSide, Vector3, Shape } from "three";

interface HexRingProps {
  grid: Grid<Hex>;
  hex: Hex;
  size?: number;
  ringWidth?: number;
  ringColor?: number;
  ringOpacity?: number;
  fillColor?: number;
  fillOpacity?: number;
}

export const HexRing = ({
  grid,
  hex,
  size = 5,
  ringWidth = 5,
  ringColor = 0xff0000,
  ringOpacity = 0.5,
  fillColor = 0xff0000,
  fillOpacity = 0.15,
  ...props
}: HexRingProps) => {
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

          edges.push([new Vector3(c1.x, 0, c1.y), new Vector3(c2.x, 0, c2.y)]);
        }
      });
    }

    return edges;
  }, [gridInRange, hexesInRange]);

  console.log("rendering hex ring");
  return (
    <object3D position={[0, 0.1, 0]} {...props}>
      {fillColor &&
        hexesInRange.map((h, i) => {
          const corners = h.corners;
          const shape = new Shape();
          shape.moveTo(corners[0].x, corners[0].y);
          corners.slice(1).forEach((corner) => {
            shape.lineTo(corner.x, corner.y);
          });
          shape.lineTo(corners[0].x, corners[0].y);

          return (
            <mesh key={`fill-${i}`} rotation={[Math.PI / 2, 0, 0]}>
              <shapeGeometry args={[shape]} />
              <meshBasicMaterial
                color={fillColor}
                opacity={fillOpacity}
                transparent
                side={DoubleSide}
              />
            </mesh>
          );
        })}

      {boundaryEdges.map((edge, i) => (
        <Line
          key={i}
          points={edge}
          color={ringColor}
          opacity={ringOpacity}
          lineWidth={ringWidth}
          transparent
        />
      ))}
    </object3D>
  );
};
