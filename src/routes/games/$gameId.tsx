import { createFileRoute } from "@tanstack/react-router";
import Scene from "../../components/scene";

import "./game.css";
import { GameProvider } from "../../context/game-context";

export const Route = createFileRoute("/games/$gameId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { gameId } = Route.useParams();
  return (
    <GameProvider id={gameId}>
      <Scene />
    </GameProvider>
  );
}
