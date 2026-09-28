import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { GroupRow } from '../components/GroupRow';
import { ScreenHeader } from '../components/ScreenHeader';
import { sizes, useColors, type Palette } from '../theme';
import { useLibraryStore } from '../store/libraryStore';
import { useNav } from '../navigation/NavContext';
import { pluralize } from '../utils/format';

export function ArtistsScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const artists = useLibraryStore(s => s.artists);
  const nav = useNav();

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Artists"
        subtitle={pluralize(artists.length, 'artist')}
      />
      <FlatList
        data={artists}
        keyExtractor={a => a.id}
        getItemLayout={(_, i) => ({
          length: sizes.row,
          offset: sizes.row * i,
          index: i,
        })}
        initialNumToRender={14}
        windowSize={9}
        removeClippedSubviews
        ListEmptyComponent={<Text style={styles.empty}>No artists found</Text>}
        renderItem={({ item }) => (
          <GroupRow
            round
            title={item.name}
            subtitle={`${pluralize(item.albumCount, 'album')} · ${pluralize(
              item.tracks.length,
              'song',
            )}`}
            artwork={item.artwork}
            onPress={() => nav.push({ kind: 'artist', id: item.id })}
          />
        )}
      />
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  empty: { color: colors.textDim, textAlign: 'center', padding: 40 },
});
