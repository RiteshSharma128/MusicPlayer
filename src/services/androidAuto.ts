import TrackPlayer, { type BrowseCategory } from '@rntp/player';
import type { AlbumGroup, ArtistGroup, Playlist, Track } from '../types';
import { toMediaItem } from './player';

const MAX_ITEMS_PER_CATEGORY = 200;

function trackToItem(track: Track) {
  const media = toMediaItem(track);
  return {
    mediaId: media.mediaId!,
    title: media.title ?? track.title,
    artist: media.artist,
    artworkUrl: media.artworkUrl,
    url: media.url,
    duration: media.duration,
  };
}

export function publishBrowseTree(opts: {
  favorites: Track[];
  albums: AlbumGroup[];
  artists: ArtistGroup[];
  playlists: Playlist[];
  trackMap: Record<string, Track>;
}) {
  const categories: BrowseCategory[] = [];

  if (opts.favorites.length > 0) {
    categories.push({
      mediaId: 'auto:favorites',
      title: 'Favorites',
      items: opts.favorites.slice(0, MAX_ITEMS_PER_CATEGORY).map(trackToItem),
    });
  }

  if (opts.playlists.length > 0) {
    categories.push({
      mediaId: 'auto:playlists',
      title: 'Playlists',
      items: opts.playlists.map(p => ({
        mediaId: `auto:playlist:${p.id}`,
        title: p.name,
        children: p.trackIds
          .map(id => opts.trackMap[id])
          .filter((t): t is Track => !!t)
          .slice(0, MAX_ITEMS_PER_CATEGORY)
          .map(trackToItem),
      })),
    });
  }

  if (opts.albums.length > 0) {
    categories.push({
      mediaId: 'auto:albums',
      title: 'Albums',
      items: opts.albums.slice(0, MAX_ITEMS_PER_CATEGORY).map(a => ({
        mediaId: `auto:album:${a.id}`,
        title: a.title,
        artist: a.artist,
        artworkUrl: a.artwork ?? undefined,
        children: a.tracks.map(trackToItem),
      })),
    });
  }

  if (opts.artists.length > 0) {
    categories.push({
      mediaId: 'auto:artists',
      title: 'Artists',
      items: opts.artists.slice(0, MAX_ITEMS_PER_CATEGORY).map(a => ({
        mediaId: `auto:artist:${a.id}`,
        title: a.name,
        artworkUrl: a.artwork ?? undefined,
        children: a.tracks.map(trackToItem),
      })),
    });
  }

  try {
    TrackPlayer.setBrowseTree(categories);
  } catch {
    
}
}