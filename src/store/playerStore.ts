import { create } from 'zustand';
import { RepeatMode } from '@rntp/player';

interface PlayerUiState {
  shuffle: boolean;
  repeat: RepeatMode;
  speed: number;
  set: (patch: Partial<Omit<PlayerUiState, 'set'>>) => void;
}

/** JS-side mirror of player modes so the UI can react to changes. */
export const usePlayerStore = create<PlayerUiState>(set => ({
  shuffle: false,
  repeat: RepeatMode.Off,
  speed: 1,
  set: patch => set(patch),
}));
