import type { Track } from '@nodefinity/react-native-music-library';

export type { Track };

export interface AlbumGroup {
  id: string;
  title: string;
  artist: string;
  artwork: string | null;
  tracks: Track[];
}

export interface ArtistGroup {
  id: string;
  name: string;
  artwork: string | null;
  albumCount: number;
  tracks: Track[];
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}

export type SongSort = 'title' | 'artist' | 'album' | 'added';

export type SmartListKey = 'favorites' | 'recent' | 'added';

export interface SavedSession {
  ids: string[];
  index: number;
  position: number;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
}

export interface OnlineTrack {
  id: string; // "online:<trackId>"
  title: string;
  artist: string;
  album: string | null;
  artwork: string | null;
  previewUrl: string;
  durationMs: number;
}

export interface FolderGroup {
  path: string;
  name: string;
  tracks: Track[];
}
