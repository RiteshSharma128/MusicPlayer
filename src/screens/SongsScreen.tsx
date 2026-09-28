import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { TrackList } from '../components/TrackList';
import { useColors, type Palette } from '../theme';
import { useLibraryStore } from '../store/libraryStore';
import { useUserStore } from '../store/userStore';
import { useUiStore } from '../store/uiStore';
import { useNav } from '../navigation/NavContext';
import { playShuffled } from '../services/player';
import { sortTracks } from '../utils/library';
import { pluralize } from '../utils/format';

export function SongsScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const tracks = useLibraryStore(s => s.tracks);
  const refreshing = useLibraryStore(s => s.refreshing);
  const load = useLibraryStore(s => s.load);
  const sort = useUserStore(s => s.songSort);
  const patch = useUiStore(s => s.patch);
  const nav = useNav();

  const sorted = useMemo(() => sortTracks(tracks, sort), [tracks, sort]);

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Songs"
        subtitle={pluralize(tracks.length, 'song')}
        actions={[
          {
            icon: 'search',
            label: 'Search',
            onPress: () => nav.push({ kind: 'search' }),
          },
          {
            icon: 'sort',
            label: 'Sort',
            onPress: () => patch({ sortSheet: true }),
          },
          {
            icon: 'shuffle',
            label: 'Shuffle all',
            onPress: () => playShuffled(sorted),
          },
        ]}
      />
      <TrackList
        tracks={sorted}
        emptyText={
          'No songs found.\nCopy some music to your phone, then pull down to refresh.'
        }
        refreshing={refreshing}
        onRefresh={() => load(true)}
      />
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
