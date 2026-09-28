import { useUserStore } from '../store/userStore';
import type { Playlist, SongSort } from '../types';

const BACKUP_VERSION = 1;

interface BackupPayload {
  version: number;
  exportedAt: string;
  favorites: string[];
  playlists: Playlist[];
  songSort: SongSort;
}

export function buildBackupJson(): string {
  const s = useUserStore.getState();
  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    favorites: s.favorites,
    playlists: s.playlists,
    songSort: s.songSort,
  };
  return JSON.stringify(payload, null, 2);
}

export interface RestoreResult {
  playlistsAdded: number;
  favoritesAdded: number;
}

export function restoreFromJson(raw: string): RestoreResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('That doesn\u2019t look like valid backup text.');
  }
  const payload = parsed as Partial<BackupPayload>;
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.playlists)) {
    throw new Error('Unrecognized backup format.');
  }

  const store = useUserStore.getState();
  const existingNames = new Set(store.playlists.map(p => p.name.toLowerCase()));
  let playlistsAdded = 0;
  for (const p of payload.playlists) {
    if (!p || typeof p.name !== 'string' || !Array.isArray(p.trackIds)) {
      continue;
    }
    const name = existingNames.has(p.name.toLowerCase())
      ? `${p.name} (restored)`
      : p.name;
    store.createPlaylist(name, p.trackIds.filter((id): id is string => typeof id === 'string'));
    playlistsAdded += 1;
  }

  let favoritesAdded = 0;
  if (Array.isArray(payload.favorites)) {
    const before = new Set(store.favorites);
    for (const id of payload.favorites) {
      if (typeof id === 'string' && !before.has(id)) {
        store.toggleFavorite(id);
        favoritesAdded += 1;
      }
    }
  }

  return { playlistsAdded, favoritesAdded };
}
