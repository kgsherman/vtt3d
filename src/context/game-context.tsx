import { createContext, ReactNode, useContext, useState } from "react";

type GameContext = {
  id: string;
};

const GameContext = createContext<GameContext | undefined>(undefined);

export function GameProvider({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <GameContext.Provider value={{ id }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }

  return context;
}
