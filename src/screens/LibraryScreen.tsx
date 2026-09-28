
import React, { useMemo } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { GroupRow } from '../components/GroupRow';
import { confirmDelete } from '../components/Sheets';
import { ScreenHeader } from '../components/ScreenHeader';
import { useColors, type Palette } from '../theme';
import { useLibraryStore } from '../store/libraryStore';
import { useUserStore } from '../store/userStore';
import { useUiStore } from '../store/uiStore';
import { useOnlineCacheStore } from '../store/onlineCacheStore';
import { useNav } from '../navigation/NavContext';
import { pluralize } from '../utils/format';
import type { Playlist } from '../types';

/** "Library" tab: smart lists (favorites / recent) + the user's playlists. */
export function LibraryScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const nav = useNav();
  const trackMap = useLibraryStore(s => s.trackMap);
  const onlineTracks = useOnlineCacheStore(s => s.tracks);
  const favorites = useUserStore(s => s.favorites);
  const recents = useUserStore(s => s.recents);
  const playlists = useUserStore(s => s.playlists);
  const createPlaylist = useUserStore(s => s.createPlaylist);
  const renamePlaylist = useUserStore(s => s.renamePlaylist);
  const deletePlaylist = useUserStore(s => s.deletePlaylist);
  const openNamePrompt = useUiStore(s => s.openNamePrompt);

  const countExisting = (ids: string[]) =>
    ids.filter(id => trackMap[id] || onlineTracks[id]).length;

  const newPlaylist = () =>
    openNamePrompt({
      title: 'New playlist',
      initial: '',
      confirmLabel: 'Create',
      onSubmit: name => {
        createPlaylist(name);
      },
    });

  const playlistMenu = (p: Playlist) =>
    Alert.alert(p.name, undefined, [
      {
        text: 'Rename',
        onPress: () =>
          openNamePrompt({
            title: 'Rename playlist',
            initial: p.name,
            confirmLabel: 'Save',
            onSubmit: name => renamePlaylist(p.id, name),
          }),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          confirmDelete(
            'Delete playlist?',
            `"${p.name}" will be removed. Your songs are not deleted.`,
            () => deletePlaylist(p.id),
          ),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Library"
        actions={[
          { icon: 'gear', label: 'Settings', onPress: () => nav.push({ kind: 'settings' }) },
          { icon: 'add', label: 'New playlist', onPress: newPlaylist },
        ]}
      />
      <FlatList
        data={playlists}
        keyExtractor={p => p.id}
        ListHeaderComponent={
          <View>
            <GroupRow
              icon="heart"
              title="Favorites"
              subtitle={pluralize(countExisting(favorites), 'song')}
              onPress={() => nav.push({ kind: 'smart', list: 'favorites' })}
            />
            <GroupRow
              icon="history"
              title="Recently played"
              subtitle={pluralize(countExisting(recents), 'song')}
              onPress={() => nav.push({ kind: 'smart', list: 'recent' })}
            />
            <GroupRow
              icon="add"
              title="Recently added"
              subtitle="Newest files on your phone"
              onPress={() => nav.push({ kind: 'smart', list: 'added' })}
            />
            <GroupRow
              icon="folder"
              title="Folders"
              subtitle="Browse by folder"
              onPress={() => nav.push({ kind: 'folders' })}
            />
            <Text style={styles.section}>PLAYLISTS</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            No playlists yet. Tap + to create one, or use "Add to playlist" on
            any song.
          </Text>
        }
        renderItem={({ item }) => {
          const firstTrack = item.trackIds
            .map(id => trackMap[id] ?? onlineTracks[id])
            .find(Boolean);
          return (
            <GroupRow
              title={item.name}
              subtitle={pluralize(countExisting(item.trackIds), 'song')}
              artwork={firstTrack?.artwork}
              onPress={() => nav.push({ kind: 'playlist', id: item.id })}
              onLongPress={() => playlistMenu(item)}
              onMore={() => playlistMenu(item)}
            />
          );
        }}
      />
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  section: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  empty: {
    color: colors.textDim,
    textAlign: 'center',
    padding: 30,
    lineHeight: 20,
  },
});
