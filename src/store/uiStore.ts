import { create } from 'zustand';
import type { Track } from '../types';

export interface NamePrompt {
  title: string;
  initial: string;
  confirmLabel: string;
  onSubmit: (name: string) => void;
}

interface UiState {
  trackMenu: { track: Track; playlistId?: string } | null;
  playlistPicker: { trackIds: string[] } | null;
  namePrompt: NamePrompt | null;
  sleepSheet: boolean;
  speedSheet: boolean;
  queueSheet: boolean;
  sortSheet: boolean;
  lyricsSheet: boolean;
  editTrackSheet: Track | null;
  settingsSheet: boolean;

  openTrackMenu: (track: Track, playlistId?: string) => void;
  openPlaylistPicker: (trackIds: string[]) => void;
  openNamePrompt: (prompt: NamePrompt) => void;
  closeAll: () => void;
  patch: (p: Partial<Omit<UiState, 'patch'>>) => void;
}

const closed = {
  trackMenu: null,
  playlistPicker: null,
  namePrompt: null,
  sleepSheet: false,
  speedSheet: false,
  queueSheet: false,
  sortSheet: false,
  lyricsSheet: false,
  editTrackSheet: null,
  settingsSheet: false,
};

export const useUiStore = create<UiState>(set => ({
  ...closed,
  openTrackMenu: (track, playlistId) =>
    set({ trackMenu: { track, playlistId } }),
  openPlaylistPicker: trackIds => set({ playlistPicker: { trackIds } }),
  openNamePrompt: namePrompt => set({ namePrompt }),
  closeAll: () => set(closed),
  patch: p => set(p),
}));
