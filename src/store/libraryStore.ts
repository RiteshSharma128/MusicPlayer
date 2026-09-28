import { create } from 'zustand';
import type { AlbumGroup, ArtistGroup, FolderGroup, Track } from '../types';
import {
  hasAudioPermission,
  requestAudioPermission,
  scanDeviceMusic,
} from '../services/library';
import { buildAlbums, buildArtists, buildFolders } from '../utils/library';

export type LibraryStatus =
  | 'idle'
  | 'needs-permission'
  | 'blocked'
  | 'loading'
  | 'ready'
  | 'error';

interface LibraryState {
  status: LibraryStatus;
  error: string | null;
  tracks: Track[];
  trackMap: Record<string, Track>;
  albums: AlbumGroup[];
  artists: ArtistGroup[];
  folders: FolderGroup[];
  refreshing: boolean;
  init: () => Promise<void>;
  requestPermission: () => Promise<void>;
  load: (silent?: boolean) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  status: 'idle',
  error: null,
  tracks: [],
  trackMap: {},
  albums: [],
  artists: [],
  folders: [],
  refreshing: false,

  init: async () => {
    const ok = await hasAudioPermission();
    if (!ok) {
      set({ status: 'needs-permission' });
      return;
    }
    await get().load();
  },

  requestPermission: async () => {
    const result = await requestAudioPermission();
    if (result === 'granted') {
      await get().load();
    } else {
      set({ status: result === 'blocked' ? 'blocked' : 'needs-permission' });
    }
  },

  load: async (silent = false) => {
    if (silent) {
      set({ refreshing: true });
    } else {
      set({ status: 'loading', error: null });
    }
    try {
      const tracks = await scanDeviceMusic();
      const trackMap: Record<string, Track> = {};
      for (const t of tracks) {
        trackMap[t.id] = t;
      }
      set({
        status: 'ready',
        error: null,
        tracks,
        trackMap,
        albums: buildAlbums(tracks),
        artists: buildArtists(tracks),
        folders: buildFolders(tracks),
        refreshing: false,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      set({
        status: silent && get().tracks.length > 0 ? 'ready' : 'error',
        error: message,
        refreshing: false,
      });
    }
  },
}));
