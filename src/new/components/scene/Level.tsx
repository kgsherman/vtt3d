import { useSuspenseQuery } from "@tanstack/react-query";
import { Tables } from "../../entities/database.types";
import { supabase } from "../../entities/supabase";
import { TransformControls, useTexture } from "@react-three/drei";
import { DoubleSide, Group, Mesh, Object3D, Vector2 } from "three";
import { Suspense, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";

import { Grid } from "./HexGrid";
import { animated, config, easings, useTransition } from "@react-spring/three";
import { useControls } from "leva";

type LevelData = Tables<"level">;

type FetchMapUrlProps = {
  queryKey: ["get-map", string, string];
};
async function fetchMapUrl({ queryKey }: FetchMapUrlProps) {
  const [_key, _id, image_src] = queryKey;
  const { data } = await supabase.storage.from("maps").getPublicUrl(image_src);

  return data.publicUrl;
}

const MapMesh = ({
  url,
  ppi,
  updateImageDimensions,
}: {
  url: string;
  ppi: number;
  updateImageDimensions: (dim: Vector2) => void;
}) => {
  const texture = useTexture(url);
  const imageDimensions = new Vector2(
    texture.image.width,
    texture.image.height
  );
  const mapDimensions = imageDimensions.divideScalar(ppi / 5);

  useEffect(() => {
    updateImageDimensions(mapDimensions);
  }, [mapDimensions]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={mapDimensions.toArray()} />
      <meshBasicMaterial map={texture} side={DoubleSide} />
    </mesh>
  );
};

const LoadingMesh = () => {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const scale = 1 + Math.sin(clock.elapsedTime * 2) * 0.2;
      ref.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} ref={ref}>
      <ringGeometry args={[2, 3, 32]} />
      <meshBasicMaterial color="hotpink" wireframe />
    </mesh>
  );
};

export function Level({ ...data }: LevelData) {
  const groupRef = useRef<Object3D>(null);
  const [imageDimensions, setImageDimensions] = useState(new Vector2(0, 0));

  const onUpdateImageDimensions = (dim: Vector2) => {
    if (imageDimensions.equals(dim)) return;
    setImageDimensions(dim);
    console.log("Image dimensions updated", dim);
  };

  const { id, image_src, ppi } = data;

  const { data: mapUrl } = useSuspenseQuery({
    queryKey: ["get-map", id, image_src!],
    queryFn: fetchMapUrl,
  });

  const {mounted} = useControls({
    mounted: { value: false, label: "Mounted" },
  });
  const transitions = useTransition(mounted, {
    from: { y: -1000, opacity: 0 },
    enter: { y: data.elevation, opacity: 1 },
    leave: { y: -25, opacity: 0 },
    config: {  ...config.default}, 
  });

  return transitions(
    ({ y, opacity }, m) =>
      m && (
        <object3D>
          {groupRef.current && (
            <object3D
              position={[imageDimensions.x / 2, 0, imageDimensions.y / 2]}
            >
              <TransformControls showY={false} object={groupRef.current} />
            </object3D>
          )}
          <animated.object3D position-y={y} ref={groupRef}>
            <Grid
              position={[0, 0.1, 0]}
              args={[10, 10]}
              cellSize={0.433 * 2}
              cellThickness={0.5}
              cellColor="#fff"
              sectionSize={5}
              fadeStrength={1}
              fadeDistance={30}
              infiniteGrid={true}
            />
            {data.image_src && (
              <Suspense fallback={<LoadingMesh />}>
                <MapMesh
                  url={mapUrl}
                  ppi={ppi}
                  updateImageDimensions={onUpdateImageDimensions}
                />
              </Suspense>
            )}
          </animated.object3D>
        </object3D>
      )
  );
}
