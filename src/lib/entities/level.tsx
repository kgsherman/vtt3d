import { Tables } from "./db";
import { useEntityData, useEntityIds } from "./entity";

export type LevelData = Tables<"level">;

export const useLevelIds = useEntityIds("level");

export const useLevelData = useEntityData("level");
