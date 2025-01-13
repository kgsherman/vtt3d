import SceneLevel from "./sceneLevel";

import Entity from "./entity";

type SceneProps = {
  name: string;
  ppf: number;
};
type QuickBuildProps = {
  name: string;
  ppf: number;
  levelImageSrcs: string[];
};
export default class Scene extends Entity {
  @serializable
  name: string;
  ppf: number;
  activeLevel?: SceneLevel;

  constructor({ name, ppf }: SceneProps) {
    super();
    this.name = name;
    this.ppf = ppf;
  }

  static quickBuild({ name, ppf, levelImageSrcs }: QuickBuildProps) {
    const scene = new Scene({ name, ppf });
    levelImageSrcs.forEach(
      (imageSrc, i) =>
        new SceneLevel({
          name: `${name} - ${i}`,
          elevation: i * 10,
          imageSrc,
          scene,
        })
    );
  }
}
