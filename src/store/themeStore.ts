import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AccentKey } from '../theme';

interface ThemeState {
  mode: 'dark' | 'light';
  accentKey: AccentKey;
  setMode: (mode: 'dark' | 'light') => void;
  setAccent: (accentKey: AccentKey) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      mode: 'dark',
      accentKey: 'violet',
      setMode: mode => set({ mode }),
      setAccent: accentKey => set({ accentKey }),
    }),
    {
      name: 'music-player-theme',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
