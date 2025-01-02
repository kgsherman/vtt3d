import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";

import { BrowserRouter, Route, Routes } from "react-router";

import ScenePage from "./ScenePage";
import Scenes from "./ScenesPage";

function Game() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Scenes />} />

          <Route path="scene">
            <Route index element={<Scenes />} />
            <Route path=":sceneId" element={<ScenePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default Game;
