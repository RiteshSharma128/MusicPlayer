import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  crossfadeEnabled: boolean;
  crossfadeSeconds: number;
  setCrossfadeEnabled: (v: boolean) => void;
  setCrossfadeSeconds: (v: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      crossfadeEnabled: false,
      crossfadeSeconds: 4,
      setCrossfadeEnabled: v => set({ crossfadeEnabled: v }),
      setCrossfadeSeconds: v => set({ crossfadeSeconds: v }),
    }),
    {
      name: 'music-player-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
