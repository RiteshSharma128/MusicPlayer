import { create } from 'zustand';

interface SelectionState {
  active: boolean;
  ids: Record<string, true>;
  start: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
  count: () => number;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  active: false,
  ids: {},

  start: id => set({ active: true, ids: { [id]: true } }),

  toggle: id =>
    set(s => {
      const next = { ...s.ids };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      const active = Object.keys(next).length > 0;
      return { ids: next, active };
    }),

  clear: () => set({ active: false, ids: {} }),

  count: () => Object.keys(get().ids).length,
}));
