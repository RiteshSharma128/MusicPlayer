import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GroupRow } from '../components/GroupRow';
import { Icon } from '../components/Icon';
import { TrackRow } from '../components/TrackRow';
import { sizes, useColors, type Palette } from '../theme';
import type { AlbumGroup, ArtistGroup, Track } from '../types';
import { useLibraryStore } from '../store/libraryStore';
import { useUiStore } from '../store/uiStore';
import { useNav } from '../navigation/NavContext';
import { playTracks } from '../services/player';
import { useActiveTrackId } from '../services/hooks';
import { pluralize } from '../utils/format';
import { compareText, searchTracks } from '../utils/library';

type Row =
  | { key: string; kind: 'header'; title: string }
  | { key: string; kind: 'artist'; artist: ArtistGroup }
  | { key: string; kind: 'album'; album: AlbumGroup }
  | { key: string; kind: 'track'; track: Track; index: number };

interface Props {
  onBack: () => void;
}

export function SearchScreen({ onBack }: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const nav = useNav();
  const [query, setQuery] = useState('');
  const tracks = useLibraryStore(s => s.tracks);
  const albums = useLibraryStore(s => s.albums);
  const artists = useLibraryStore(s => s.artists);
  const openTrackMenu = useUiStore(s => s.openTrackMenu);
  const activeId = useActiveTrackId();

  const { rows, matchedTracks } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { rows: [] as Row[], matchedTracks: [] as Track[] };
    }
    const songs = searchTracks(tracks, q).sort((a, b) =>
      compareText(a.title, b.title),
    );
    const matchedArtists = artists
      .filter(a => a.name.toLowerCase().includes(q))
      .slice(0, 5);
    const matchedAlbums = albums
      .filter(a => a.title.toLowerCase().includes(q))
      .slice(0, 5);
    const out: Row[] = [];
    if (matchedArtists.length) {
      out.push({ key: 'h-artists', kind: 'header', title: 'ARTISTS' });
      matchedArtists.forEach(a =>
        out.push({ key: `a-${a.id}`, kind: 'artist', artist: a }),
      );
    }
    if (matchedAlbums.length) {
      out.push({ key: 'h-albums', kind: 'header', title: 'ALBUMS' });
      matchedAlbums.forEach(a =>
        out.push({ key: `al-${a.id}`, kind: 'album', album: a }),
      );
    }
    if (songs.length) {
      out.push({ key: 'h-songs', kind: 'header', title: 'SONGS' });
      songs
        .slice(0, 200)
        .forEach((t, i) =>
          out.push({ key: `t-${t.id}`, kind: 'track', track: t, index: i }),
        );
    }
    return { rows: out, matchedTracks: songs.slice(0, 200) };
  }, [query, tracks, albums, artists]);

  const onPressTrack = useCallback(
    (index: number) => playTracks(matchedTracks, index),
    [matchedTracks],
  );
  const onMore = useCallback(
    (track: Track) => openTrackMenu(track),
    [openTrackMenu],
  );

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top }]}>
        <View style={styles.bar}>
          <Pressable onPress={onBack} hitSlop={8} style={styles.iconBtn}>
            <Icon name="back" />
          </Pressable>
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="Songs, artists, albums"
            placeholderTextColor={colors.textDim}
            style={styles.input}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={8}
              style={styles.iconBtn}>
              <Icon name="close" size={22} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={rows}
        keyExtractor={r => r.key}
        keyboardShouldPersistTaps="handled"
        extraData={activeId}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {query.trim() ? 'No results' : 'Type to search your music'}
          </Text>
        }
        renderItem={({ item }) => {
          switch (item.kind) {
            case 'header':
              return <Text style={styles.section}>{item.title}</Text>;
            case 'artist':
              return (
                <GroupRow
                  round
                  title={item.artist.name}
                  subtitle={pluralize(item.artist.tracks.length, 'song')}
                  artwork={item.artist.artwork}
                  onPress={() => nav.push({ kind: 'artist', id: item.artist.id })}
                />
              );
            case 'album':
              return (
                <GroupRow
                  title={item.album.title}
                  subtitle={item.album.artist}
                  artwork={item.album.artwork}
                  onPress={() => nav.push({ kind: 'album', id: item.album.id })}
                />
              );
            default:
              return (
                <TrackRow
                  track={item.track}
                  index={item.index}
                  active={item.track.id === activeId}
                  onPress={onPressTrack}
                  onMore={onMore}
                />
              );
          }
        }}
      />
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { backgroundColor: colors.bg },
  bar: {
    height: sizes.header,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    height: 44,
  },
  section: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 4,
  },
  empty: { color: colors.textDim, textAlign: 'center', padding: 40 },
});
