import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OnlineTrack } from '../types';

const MAX_CACHE_SIZE = 300;

interface OnlineCacheState {
  tracks: Record<string, OnlineTrack>;
  cache: (tracks: OnlineTrack[]) => void;
}

export const useOnlineCacheStore = create<OnlineCacheState>()(
  persist(
    (set, get) => ({
      tracks: {},
      cache: newTracks => {
        if (newTracks.length === 0) {
          return;
        }
        const current = get().tracks;
        const merged = { ...current };
        for (const t of newTracks) {
          merged[t.id] = t;
        }
        const keys = Object.keys(merged);
        if (keys.length > MAX_CACHE_SIZE) {
          for (const key of keys.slice(0, keys.length - MAX_CACHE_SIZE)) {
            delete merged[key];
          }
        }
        set({ tracks: merged });
      },
    }),
    {
      name: 'music-player-online-cache',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);