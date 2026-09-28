
import type { AlbumGroup, ArtistGroup, FolderGroup, SongSort, Track } from '../types';

export const UNKNOWN_ARTIST = 'Unknown artist';
export const UNKNOWN_ALBUM = 'Unknown album';


function isPlaceholder(value: string | null | undefined): boolean {
  if (!value) {
    return true;
  }
  const v = value.trim().toLowerCase();
  return v === '' || v === '<unknown>' || v === 'unknown';
}

export function artistOf(track: Track): string {
  return isPlaceholder(track.artist) ? UNKNOWN_ARTIST : track.artist!.trim();
}

export function albumOf(track: Track): string {
  return isPlaceholder(track.album) ? UNKNOWN_ALBUM : track.album!.trim();
}

const NON_MUSIC_PATH =
  /\/(ringtones?|notifications?|alarms?|recordings?|voice ?recorder|call ?recordings?)\//i;


export function isMusic(track: Track, minSeconds = 30): boolean {
  if (!track.url) {
    return false;
  }
  if (track.duration < minSeconds) {
    return false;
  }
  return !NON_MUSIC_PATH.test(track.url);
}

const collator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
});

export function compareText(a: string, b: string): number {
  return collator.compare(a, b);
}

export function albumIdOf(track: Track): string {
  return `${albumOf(track)}\u0000${artistOf(track)}`.toLowerCase();
}

export function artistIdOf(track: Track): string {
  return artistOf(track).toLowerCase();
}

export function sortTracks(tracks: Track[], sort: SongSort): Track[] {
  const copy = tracks.slice();
  switch (sort) {
    case 'artist':
      return copy.sort(
        (a, b) =>
          compareText(artistOf(a), artistOf(b)) ||
          compareText(a.title, b.title),
      );
    case 'album':
      return copy.sort(
        (a, b) =>
          compareText(albumOf(a), albumOf(b)) || compareText(a.title, b.title),
      );
    case 'added':
      return copy.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    case 'title':
    default:
      return copy.sort((a, b) => compareText(a.title, b.title));
  }
}

function albumOrder(a: Track, b: Track): number {
  if (a.url.startsWith('file://') && b.url.startsWith('file://')) {
    return compareText(a.url, b.url);
  }
  return compareText(a.title, b.title);
}

export function buildAlbums(tracks: Track[]): AlbumGroup[] {
  const map = new Map<string, AlbumGroup>();
  for (const t of tracks) {
    const title = albumOf(t);
    const artist = artistOf(t);
    const id = albumIdOf(t);
    let group = map.get(id);
    if (!group) {
      group = { id, title, artist, artwork: null, tracks: [] };
      map.set(id, group);
    }
    group.tracks.push(t);
    if (!group.artwork && t.artwork) {
      group.artwork = t.artwork;
    }
  }
  const albums = Array.from(map.values());
  for (const a of albums) {
    a.tracks.sort(albumOrder);
  }
  return albums.sort((a, b) => compareText(a.title, b.title));
}

export function buildArtists(tracks: Track[]): ArtistGroup[] {
  const map = new Map<string, { group: ArtistGroup; albums: Set<string> }>();
  for (const t of tracks) {
    const name = artistOf(t);
    const id = artistIdOf(t);
    let entry = map.get(id);
    if (!entry) {
      entry = {
        group: { id, name, artwork: null, albumCount: 0, tracks: [] },
        albums: new Set(),
      };
      map.set(id, entry);
    }
    entry.group.tracks.push(t);
    entry.albums.add(albumOf(t).toLowerCase());
    if (!entry.group.artwork && t.artwork) {
      entry.group.artwork = t.artwork;
    }
  }
  const artists: ArtistGroup[] = [];
  for (const { group, albums } of map.values()) {
    group.albumCount = albums.size;
    group.tracks.sort(
      (a, b) =>
        compareText(albumOf(a), albumOf(b)) || compareText(a.title, b.title),
    );
    artists.push(group);
  }
  return artists.sort((a, b) => compareText(a.name, b.name));
}

export function searchTracks(tracks: Track[], query: string): Track[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }
  return tracks.filter(
    t =>
      t.title.toLowerCase().includes(q) ||
      (t.artist ?? '').toLowerCase().includes(q) ||
      (t.album ?? '').toLowerCase().includes(q),
  );
}

export interface TrackOverride {
  title?: string;
  artist?: string;
  album?: string;
}
export function applyOverride(track: Track, override?: TrackOverride): Track {
  if (!override) {
    return track;
  }
  return {
    ...track,
    title: override.title?.trim() || track.title,
    artist: override.artist?.trim() || track.artist,
    album: override.album?.trim() || track.album,
  };
}

export function folderOf(track: Track): string {
  const idx = track.url.lastIndexOf('/');
  return idx === -1 ? track.url : track.url.slice(0, idx);
}

function folderDisplayName(path: string): string {
  const idx = path.lastIndexOf('/');
  const name = idx === -1 ? path : path.slice(idx + 1);
  try {
    return decodeURIComponent(name) || name;
  } catch {
    return name;
  }
}

export function buildFolders(tracks: Track[]): FolderGroup[] {
  const map = new Map<string, FolderGroup>();
  for (const t of tracks) {
    if (!t.url.startsWith('file://')) {
      continue; // only on-device files have a meaningful folder
    }
    const path = folderOf(t);
    let group = map.get(path);
    if (!group) {
      group = { path, name: folderDisplayName(path), tracks: [] };
      map.set(path, group);
    }
    group.tracks.push(t);
  }
  const folders = Array.from(map.values());
  for (const f of folders) {
    f.tracks.sort(albumOrder);
  }
  return folders.sort((a, b) => compareText(a.name, b.name));
}
export function onlineTrackToTrack(o: import('../types').OnlineTrack): Track {
  return {
    id: o.id,
    url: o.previewUrl,
    title: o.title,
    artist: o.artist,
    album: o.album,
    artwork: o.artwork,
    duration: o.durationMs / 1000,
    createdAt: 0,
  } as Track;
}

export function resolveTrack(
  id: string,
  deviceTrackMap: Record<string, Track>,
  onlineTrackMap: Record<string, import('../types').OnlineTrack>,
): Track | null {
  const local = deviceTrackMap[id];
  if (local) {
    return local;
  }
  const online = onlineTrackMap[id];
  if (online) {
    return onlineTrackToTrack(online);
  }
  return null;
}

