import {create} from "zustand";
import { Actor } from "../system/actor";

interface SelectionState {
  selected: Actor[];
  addSelected: (actor: Actor) => void;
  removeSelected: (actorId: string) => void;
  isSelected: (actorId: string) => boolean;
  toggleSelected: (actor: Actor) => void;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selected: [],

  addSelected: (actor) =>
    set((state) => {
      if (state.selected.some((item) => item.id === actor.id)) {
        return state;
      }
      return { selected: [...state.selected, actor] };
    }),

  removeSelected: (actorId) =>
    set((state) => ({
      selected: state.selected.filter((item) => item.id !== actorId),
    })),

  isSelected: (actorId) => get().selected.some((item) => item.id === actorId),

  toggleSelected: (actor) => {
    const { isSelected, removeSelected, addSelected } = get();

    if (isSelected(actor.id)) {
      removeSelected(actor.id);
    } else {
      addSelected(actor);
    }
  },
}));
