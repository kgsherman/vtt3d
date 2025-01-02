import { useSuspenseQuery } from "@tanstack/react-query";
import { Tables } from "../../entities/database.types";
import { supabase } from "../../entities/supabase";
import { Level } from "./Level";

type LevelData = Tables<"level">;
type SceneData = Tables<"scene">;

type FetchLevelProps = {
  queryKey: ["levels", string];
};
async function fetchLevels({
  queryKey,
}: FetchLevelProps): Promise<LevelData[]> {
  const [_key, scene_id] = queryKey;
  const { data, error } = await supabase
    .from("level")
    .select()
    .eq("scene", scene_id);

  if (error) {
    throw error;
  }
  return data;
}

async function fetchScene({
  queryKey,
}: {
  queryKey: ["scene", string];
}): Promise<SceneData> {
  const [_key, id] = queryKey;
  const { data, error } = await supabase
    .from("scene")
    .select()
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }
  return data;
}

function SceneRender({ ...data }: SceneData) {
  const { data: levelsData } = useSuspenseQuery({
    queryKey: ["levels", data.id],
    queryFn: fetchLevels,
  });

  return (
    <group>
      {levelsData.map((levelData) => (
        <Level key={levelData.id} {...levelData} />
      ))}
    </group>
  );
}

function Scene({ sceneId }: { sceneId: string }) {
  const { data } = useSuspenseQuery({
    queryKey: ["scene", sceneId],
    queryFn: fetchScene,
  });

  return <SceneRender {...data} />;
}

export default Scene;
