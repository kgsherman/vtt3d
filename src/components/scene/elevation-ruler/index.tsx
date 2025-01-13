import { useSceneContext } from "..";
import { LevelData } from "../../../lib/entities/level";

const Elevation = ({
  elevation,
  levels,
}: {
  elevation: number;
  levels?: LevelData[];
}) => {
  return (
    <div className="flex items-center translate-y-[50%] relative">
      <div className="p-2 text-right absolute right-full text-nowrap">
        {elevation}
      </div>
      <div className="flex gap-2 items-center">
        {levels?.map((level) => (
          <div key={level.id} className="border border-white px-4 py-1.5">
            {level.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ElevationRuler() {
  const { levels: levelMap } = useSceneContext();
  const levels = Array.from(levelMap.values());

  const defaultMin = -10;
  const defaultMax = 50;
  const defaultRange = defaultMax - defaultMin;

  const levelElevations = levels.map((l) => l.elevation);
  const maxLevelElevation = Math.max(...levelElevations);
  const minLevelElevation = Math.min(...levelElevations);
  const levelElevationRange = maxLevelElevation - minLevelElevation;
  const visibleElevationRange = Math.max(levelElevationRange, defaultRange);

  const elevationMax = Math.max(
    maxLevelElevation,
    Math.min(minLevelElevation, defaultMin) + visibleElevationRange
  );
  const elevationMin = Math.min(minLevelElevation, defaultMin);

  const bottomBuffer = Math.abs(elevationMin - minLevelElevation);

  const levelsByElevation = Object.groupBy(levels, ({ elevation }) =>
    elevation.toString()
  );

  let lastHighest = elevationMax;
  const levelsByElevationWithGrowth = Object.keys(levelsByElevation)
    .sort((a, b) => parseInt(b) - parseInt(a))
    .map((elevationKey) => {
      const elevation = parseInt(elevationKey);
      const levels = levelsByElevation[elevationKey];

      const growth = lastHighest - elevation;
      lastHighest = elevation;

      return {
        elevation,
        growth,
        levels,
      };
    });

  return (
    <div className="absolute bottom-0 top-0 left-24 flex flex-col justify-center">
      <div
        className="flex flex-col border-l border-gray-400"
        style={{ height: 400, width: 700 }}
      >
        {}
        {levelsByElevationWithGrowth.map(
          ({ elevation, growth, levels }, index) => (
            <div
              key={`elevation-${elevation}`}
              className="flex items-end justify-start  relative"
              style={{
                flexGrow: growth,
                flexBasis: 0,
                minHeight: index === 0 ? "0" : "auto",
              }}
            >
              <Elevation elevation={elevation} levels={levels} />
            </div>
          )
        )}
        <div style={{ flexGrow: bottomBuffer }}></div>
      </div>
    </div>
  );
}
