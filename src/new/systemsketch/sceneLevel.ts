import { Grid, rectangle, type Hex } from "honeycomb-grid";
import Entity, { serializable } from "./entity";
import ftHex from "../lib/ftHex";
import Scene from "./scene";

export type SceneLevelProps = {
  scene: Scene;

  name: string;
  imageSrc: string;
  elevation?: number;
  ppf?: number;
}
export default class SceneLevel extends Entity {
  @serializable scene: Scene;

  @serializable name: string;
  @serializable imageSrc: string;
  @serializable elevation: number;
  @serializable ppf: number;

  grid?: Grid<Hex>;

  constructor({ name, imageSrc, elevation = 0, ppf, scene }: SceneLevelProps) {
    super();
    this.scene = scene;
    this.name = name;
    this.imageSrc = imageSrc;
    this.elevation = elevation;
    this.ppf = ppf ?? scene.ppf;
  }

  createGrid(image: HTMLImageElement) {
    const { width, height } = image;

    const dimensions = {
      width: Math.ceil(width / this.ppf),
      height: Math.ceil(height / this.ppf),
    }

    const startX = -Math.floor(dimensions.width / 2);
    const startY = -Math.floor(dimensions.height / 2);

    const traverser = rectangle({
      start: [startX, startY],
      width: dimensions.width,
      height: dimensions.height,
    });

    const grid = new Grid(ftHex, traverser);
    this.grid = grid;
  };
}
