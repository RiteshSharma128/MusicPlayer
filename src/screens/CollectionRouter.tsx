
import React from 'react';
import type { StackRoute } from '../navigation/NavContext';
import { CollectionScreen } from './CollectionScreen';
import { confirmDelete } from '../components/Sheets';
import { useLibraryStore } from '../store/libraryStore';
import { useUserStore } from '../store/userStore';
import { useUiStore } from '../store/uiStore';
import { useOnlineCacheStore } from '../store/onlineCacheStore';
import type { SmartListKey, Track } from '../types';
import { resolveTrack, sortTracks } from '../utils/library';

interface Props {
  route: Exclude<StackRoute, { kind: 'search' | 'folders' | 'settings' }>;
  onBack: () => void;
}

const SMART_META: Record<SmartListKey, { title: string; empty: string }> = {
  favorites: {
    title: 'Favorites',
    empty: 'Tap the heart on any song to add it here.',
  },
  recent: {
    title: 'Recently played',
    empty: 'Songs you play will show up here.',
  },
  added: {
    title: 'Recently added',
    empty: 'New files copied to your phone will show up here.',
  },
};

export function CollectionRouter({ route, onBack }: Props) {
  const albums = useLibraryStore(s => s.albums);
  const artists = useLibraryStore(s => s.artists);
  const folders = useLibraryStore(s => s.folders);
  const trackMap = useLibraryStore(s => s.trackMap);
  const tracks = useLibraryStore(s => s.tracks);
  const onlineTracks = useOnlineCacheStore(s => s.tracks);
  const favorites = useUserStore(s => s.favorites);
  const recents = useUserStore(s => s.recents);
  const playlists = useUserStore(s => s.playlists);
  const renamePlaylist = useUserStore(s => s.renamePlaylist);
  const deletePlaylist = useUserStore(s => s.deletePlaylist);
  const openNamePrompt = useUiStore(s => s.openNamePrompt);

  if (route.kind === 'album') {
    const album = albums.find(a => a.id === route.id);
    return (
      <CollectionScreen
        title={album?.title ?? 'Album'}
        subtitle={album?.artist}
        artwork={album?.artwork}
        tracks={album?.tracks ?? []}
        onBack={onBack}
      />
    );
  }

  if (route.kind === 'artist') {
    const artist = artists.find(a => a.id === route.id);
    return (
      <CollectionScreen
        title={artist?.name ?? 'Artist'}
        artwork={artist?.artwork}
        tracks={artist?.tracks ?? []}
        onBack={onBack}
      />
    );
  }

  if (route.kind === 'smart') {
    const meta = SMART_META[route.list];
    const ids = route.list === 'favorites' ? favorites : recents;
    let list: Track[];
    if (route.list === 'added') {
      list = sortTracks(tracks, 'added');
    } else {
      list = ids
        .map(id => resolveTrack(id, trackMap, onlineTracks))
        .filter((t): t is Track => !!t);
    }
    return (
      <CollectionScreen
        title={meta.title}
        tracks={list}
        emptyText={meta.empty}
        onBack={onBack}
      />
    );
  }

  if (route.kind === 'folder') {
    const folder = folders.find(f => f.path === route.path);
    return (
      <CollectionScreen
        title={folder?.name ?? 'Folder'}
        subtitle="Folder"
        tracks={folder?.tracks ?? []}
        onBack={onBack}
      />
    );
  }

  // playlist
  const playlist = playlists.find(p => p.id === route.id);
  const list = (playlist?.trackIds ?? [])
    .map(id => resolveTrack(id, trackMap, onlineTracks))
    .filter((t): t is Track => !!t);

  return (
    <CollectionScreen
      title={playlist?.name ?? 'Playlist'}
      tracks={list}
      playlistId={playlist?.id}
      emptyText='Empty playlist. Use "Add to playlist" on any song.'
      onBack={onBack}
      actions={
        playlist
          ? [
              {
                icon: 'edit',
                label: 'Rename',
                onPress: () =>
                  openNamePrompt({
                    title: 'Rename playlist',
                    initial: playlist.name,
                    confirmLabel: 'Save',
                    onSubmit: name => renamePlaylist(playlist.id, name),
                  }),
              },
              {
                icon: 'delete',
                label: 'Delete playlist',
                onPress: () =>
                  confirmDelete(
                    'Delete playlist?',
                    `"${playlist.name}" will be removed. Your songs are not deleted.`,
                    () => {
                      deletePlaylist(playlist.id);
                      onBack();
                    },
                  ),
              },
            ]
          : []
      }
    />
  );
}
