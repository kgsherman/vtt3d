import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Actor } from "../system/actor";

interface SelectionContextType {
  selected: Actor[];
  addSelected: (actor: Actor) => void;
  removeSelected: (actorId: string) => void;
  isSelected: (actorId: string) => boolean;
  toggleSelected: (actor: Actor) => void;
}

export const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined
);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Actor[]>([]);
  useEffect(() => {
    console.log("selected", selected);
  })

  const addSelected = (actor: Actor) => {
    setSelected((prev) => {
      // Don't add if already selected
      if (prev.some((item) => item.id === actor.id)) {
        return prev;
      }
      return [...prev, actor];
    });
  };

  const removeSelected = (actorId: string) => {
    setSelected((prev) => prev.filter((item) => item.id !== actorId));
  };

  const isSelected = (actorId: string) => {
    return selected.some((item) => item.id === actorId);
  };

  const toggleSelected = (actor: Actor) => {
    return isSelected(actor.id) ? removeSelected(actor.id) : addSelected(actor);
  };

  return (
    <SelectionContext.Provider
      value={{ selected, addSelected, removeSelected, isSelected, toggleSelected }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

// Custom hook to use the selection context
export function useSelection() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return context;
}
