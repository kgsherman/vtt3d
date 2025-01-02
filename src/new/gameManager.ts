import type { GetState, SetState } from "zustand";
import create from "zustand";
import type Scene from "./systemsketch/scene";
import Actor from "./systemsketch/actor";
import type SceneLevel from "./systemsketch/sceneLevel";
import Entity from "./systemsketch/entity";

type EntityActions<T extends Entity> = {
  register: (entities: T[], entity: T) => void;
  fetch: (entities: T[], entityId: string) => T;
  clone: (entities: T[], entityId: string) => T;
  remove: (entities: T[], entityId: string) => void;
};

type ActorActions = EntityActions<Actor> & {};
type ActorStore = ActorActions & {
  actors: Actor[];
};
const useActorStore = create<ActorStore>(
  (set, get) => ({
    actors: [],
    register: (actors, actor) => {
      set({ actors: [...actors, actor] });
    },
    fetch: (actors, actorId) => {
      return actors.find((actor) => actor.id === actorId);
    },
    clone: (actors, actorId) => {
      const actor = get().fetch(actors, actorId);
      return new Actor({ ...actor.serialize() });
    },
    remove: (actors, actorId) => {
      set({ actors: actors.filter((actor) => actor.id !== actorId) });
    },
  })
);

type SceneActions = EntityActions<Scene> & {
  getLevels: (sceneId: string) => SceneLevel[];
};
type SceneStore = SceneActions & {
  scenes: Scene[];
};

type LevelActions = EntityActions<SceneLevel> & {};
type LevelStore = LevelActions & {
  levels: SceneLevel[];
};
