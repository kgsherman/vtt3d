import { useSuspenseQuery } from "@tanstack/react-query";
import { useGameContext } from "../../../context/game-context";
import { supabase } from "../../../lib/entities/supabase";
import { useTexture } from "@react-three/drei";
import { DoubleSide, Vector2 } from "three";
import { useLevelContext } from ".";
import { motion } from "framer-motion-3d";

type FetchMapUrlProps = {
  queryKey: ["get-map", gameId: string, filename: string];
};
async function fetchMapUrl({ queryKey }: FetchMapUrlProps) {
  const [_key, gameId, filename] = queryKey;

  // artificial delay:
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const { data } = await supabase.storage
    .from(`maps/${gameId}`)
    .getPublicUrl(filename);

  return data.publicUrl;
}

export default function MapImage() {
  const { id: gameId } = useGameContext();
  const { data: levelData } = useLevelContext();

  const { data: url } = useSuspenseQuery({
    queryKey: ["get-map", gameId, levelData.image_src!],
    queryFn: fetchMapUrl,
  });
  console.log(`${levelData.name} - Fetched url`);

  const texture = useTexture(url);

  console.log(`${levelData.name} - Loaded texture`);
  const imageDimensions = new Vector2(
    texture.image.width,
    texture.image.height
  );
  const mapDimensions = imageDimensions.divideScalar(levelData.ppi / 5);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={mapDimensions.toArray()} />
      <motion.meshBasicMaterial
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            stiffness: 2000,
            damping: 70,
            mass: 1,
            type: "spring",
          },
        }}
        exit={{
          opacity: 0,
          transition: {
            type: "tween",
            duration: 0.3,
            ease: "linear",
          },
        }}
        map={texture}
        side={DoubleSide}
      />
    </mesh>
  );
}
