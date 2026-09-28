import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Playlist, SavedSession, SongSort } from '../types';

const MAX_RECENTS = 100;

interface UserState {
  hydrated: boolean;
  favorites: string[];
  recents: string[];
  playlists: Playlist[];
  songSort: SongSort;
  session: SavedSession | null;
  trackOverrides: Record<string, { title?: string; artist?: string; album?: string }>;

  toggleFavorite: (trackId: string) => void;
  addRecent: (trackId: string) => void;
  setSongSort: (sort: SongSort) => void;
  setSession: (session: SavedSession | null) => void;
  setTrackOverride: (
    trackId: string,
    fields: { title?: string; artist?: string; album?: string },
  ) => void;
  clearTrackOverride: (trackId: string) => void;

  createPlaylist: (name: string, trackIds?: string[]) => string;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (id: string, trackIds: string[]) => number;
  removeFromPlaylist: (id: string, trackId: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      favorites: [],
      recents: [],
      playlists: [],
      songSort: 'title',
      session: null,
      trackOverrides: {},

      toggleFavorite: trackId =>
        set(s => ({
          favorites: s.favorites.includes(trackId)
            ? s.favorites.filter(id => id !== trackId)
            : [trackId, ...s.favorites],
        })),

      addRecent: trackId =>
        set(s => ({
          recents: [trackId, ...s.recents.filter(id => id !== trackId)].slice(
            0,
            MAX_RECENTS,
          ),
        })),

      setSongSort: songSort => set({ songSort }),
      setSession: session => set({ session }),

      setTrackOverride: (trackId, fields) =>
        set(s => ({
          trackOverrides: {
            ...s.trackOverrides,
            [trackId]: { ...s.trackOverrides[trackId], ...fields },
          },
        })),

      clearTrackOverride: trackId =>
        set(s => {
          const next = { ...s.trackOverrides };
          delete next[trackId];
          return { trackOverrides: next };
        }),

      createPlaylist: (name, trackIds = []) => {
        const id = `pl_${Date.now().toString(36)}_${Math.random()
          .toString(36)
          .slice(2, 6)}`;
        const playlist: Playlist = {
          id,
          name: name.trim() || 'New playlist',
          trackIds: Array.from(new Set(trackIds)),
          createdAt: Date.now(),
        };
        set(s => ({ playlists: [playlist, ...s.playlists] }));
        return id;
      },

      renamePlaylist: (id, name) =>
        set(s => ({
          playlists: s.playlists.map(p =>
            p.id === id ? { ...p, name: name.trim() || p.name } : p,
          ),
        })),

      deletePlaylist: id =>
        set(s => ({ playlists: s.playlists.filter(p => p.id !== id) })),

      addToPlaylist: (id, trackIds) => {
        const playlist = get().playlists.find(p => p.id === id);
        if (!playlist) {
          return 0;
        }
        const existing = new Set(playlist.trackIds);
        const fresh = trackIds.filter(t => !existing.has(t));
        if (fresh.length === 0) {
          return 0;
        }
        set(s => ({
          playlists: s.playlists.map(p =>
            p.id === id ? { ...p, trackIds: [...p.trackIds, ...fresh] } : p,
          ),
        }));
        return fresh.length;
      },

      removeFromPlaylist: (id, trackId) =>
        set(s => ({
          playlists: s.playlists.map(p =>
            p.id === id
              ? { ...p, trackIds: p.trackIds.filter(t => t !== trackId) }
              : p,
          ),
        })),
    }),
    {
      name: 'music-player-user-data',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: s => ({
        favorites: s.favorites,
        recents: s.recents,
        playlists: s.playlists,
        songSort: s.songSort,
        session: s.session,
        trackOverrides: s.trackOverrides,
      }),
      onRehydrateStorage: () => () => {
        useUserStore.setState({ hydrated: true });
      },
    },
  ),
);
