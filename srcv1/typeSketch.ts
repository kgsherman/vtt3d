import type { Grid, Hex } from "honeycomb-grid";

export type SceneLevel = {
  id: string;
  name: string;
  imageSrc: string;
  elevation: number;
  grid: Grid<Hex>;
};
export type Scene = {
  id: string;
  name: string;
  ppf: number;
  levels: SceneLevel[];
  activeLevel: SceneLevel;
};

export type Actor = {
  id: string;
  name: string;
  mini: Mini;
  size: number;
};

export type Mini = {
  id: string;
  name: string;
  mesh: JSX.Element;
};

export type Token = {
  id: string;
  actor: Actor;
  linked: boolean; // if true, the token is linked to the actor
  mini: Mini;
  size: number;
  position: Hex;
  direction: number;
};

export type VTTState = {
  scenes: Scene[];
  tokens: Token[];
  actors: Actor[];
  minis: Mini[];
  currentScene: Scene;
};
