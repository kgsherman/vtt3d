import type { LevelData } from "../../../lib/entities/level";
import { Fragment } from "react";
import { useSceneContext } from "../scene-context";

const Levels = ({ levels }: { levels?: LevelData[] }) => {
  return (
    <div className="flex grow-0 basis-0 min-h-0 relative ">
      <div className="flex items-center gap-2 border-b border-white pl-4">
        {levels?.map((level) => (
          <div
            key={level.id}
            className="border border-white px-4 py-1.5 text-nowrap bg-black/80"
          >
            {level.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const Elevation = ({ elevation }: { elevation: number }) => (
  <div className="flex items-center justify-end w-16 mr-4">
    <div className="absolute text-nowrap">{elevation}ft</div>
  </div>
);

const Gap = ({ flexGrow }: { flexGrow: number }) => (
  <div className="min-h-0" style={{ flexGrow }}></div>
);

export default function ElevationRuler() {
  const { levels: levelMap } = useSceneContext();
  const levels = Array.from(levelMap.values());
  const levelElevations = Array.from(new Set(levels.map((l) => l.elevation)));
  const levelElevationsMax = Math.max(...levelElevations);
  const levelElevationsMin = Math.min(...levelElevations);

  const limitElevationMax = 10; // the max may not go below 10...
  const limitElevationMin = -10; // ...and the min may not go above -10
  const limitRangeMin = 50; // the default range is 50, meaning by default the ruler will show elevations from -10 to 40

  const currentMin = Math.min(levelElevationsMin, limitElevationMin);
  const currentMax = Math.max(
    levelElevationsMax,
    currentMin + limitRangeMin,
    limitElevationMax
  );

  let elementsLeft = [];
  if (currentMax > levelElevationsMax)
    elementsLeft.push(<Elevation elevation={currentMax} />);

  let elementsRight = [] as JSX.Element[];
  let y = currentMax;

  levelElevations.forEach((elevation) => {
    const rightGap = y - elevation;
    const leftGap = y - elevation;
    y = elevation;

    const levelsAtElevation = levels
      .filter((l) => l.elevation === elevation)
      .sort((a, b) => a.name.localeCompare(b.name));

    const elementRight = (
      <Fragment key={`right-${elevation}`}>
        <Gap flexGrow={rightGap} />
        <Levels levels={levelsAtElevation} />
      </Fragment>
    );
    elementsRight.push(elementRight);

    const elementLeft = (
      <Fragment key={`left-${elevation}`}>
        <Gap flexGrow={leftGap} />
        <Elevation elevation={elevation} />
      </Fragment>
    );
    elementsLeft.push(elementLeft);
  });

  elementsRight.push(<Gap flexGrow={y - currentMin} />);
  elementsLeft.push(
    <>
      <Gap flexGrow={y - currentMin} />
      {y !== currentMin && <Elevation elevation={currentMin} />}
    </>
  );

  return (
    <div className="absolute top-0 bottom-0 my-auto flex items-stretch h-96 ">
      <div className="flex flex-col">{elementsLeft}</div>
      <div className="border-l border-white"></div>
      <div className="flex flex-col">{elementsRight}</div>
    </div>
  );
}
