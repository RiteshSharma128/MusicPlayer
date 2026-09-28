import React, { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Artwork } from '../components/Artwork';
import { ScreenHeader } from '../components/ScreenHeader';
import { useColors, type Palette } from '../theme';
import { useLibraryStore } from '../store/libraryStore';
import { useNav } from '../navigation/NavContext';
import { pluralize } from '../utils/format';

const GAP = 14;

export function AlbumsScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const albums = useLibraryStore(s => s.albums);
  const nav = useNav();
  const { width } = useWindowDimensions();
  const card = (width - GAP * 3) / 2;

  return (
    <View style={styles.root}>
      <ScreenHeader title="Albums" subtitle={pluralize(albums.length, 'album')} />
      <FlatList
        data={albums}
        numColumns={2}
        keyExtractor={a => a.id}
        columnWrapperStyle={{ paddingHorizontal: GAP, gap: GAP }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 12 }}
        initialNumToRender={8}
        windowSize={7}
        removeClippedSubviews
        ListEmptyComponent={<Text style={styles.empty}>No albums found</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { width: card }]}
            onPress={() => nav.push({ kind: 'album', id: item.id })}>
            <Artwork uri={item.artwork} size={card} radius={12} />
            <Text numberOfLines={1} style={styles.title}>
              {item.title}
            </Text>
            <Text numberOfLines={1} style={styles.sub}>
              {item.artist} · {pluralize(item.tracks.length, 'song')}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  card: { marginBottom: 18 },
  title: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 8 },
  sub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  empty: { color: colors.textDim, textAlign: 'center', padding: 40 },
});
