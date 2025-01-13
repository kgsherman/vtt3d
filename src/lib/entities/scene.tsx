import { useEntityData, useEntityIds } from "./entity";
import { useLevelIds } from "./level";

export const useSceneIds = useEntityIds("scene");

export const useSceneData = useEntityData("scene");
export const useScene = (id: string) => {
  const data = useSceneData(id);

  return {
    data,
    useSceneLevelIds: () =>
      useLevelIds({
        filter: { scene_id: id },
        order: ["elevation", { ascending: false }],
      }),
  };
};
