
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Artwork } from '../components/Artwork';
import { Icon } from '../components/Icon';
import { ScreenHeader } from '../components/ScreenHeader';
import { useColors, sizes, type Palette } from '../theme';
import type { OnlineTrack } from '../types';
import { searchOnlineTracks } from '../services/onlineMusic';
import { playOnlineTracks, toOnlineMediaItem } from '../services/player';
import { useOnlineCacheStore } from '../store/onlineCacheStore';
import { useUserStore } from '../store/userStore';
import TrackPlayer, { useActiveMediaItem } from '@rntp/player';

let debounceHandle: ReturnType<typeof setTimeout> | null = null;

export function OnlineScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OnlineTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeItem = useActiveMediaItem();
  const favorites = useUserStore(s => s.favorites);
  const toggleFavorite = useUserStore(s => s.toggleFavorite);

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    searchOnlineTracks(q)
      .then(found => {
        setResults(found);
        useOnlineCacheStore.getState().cache(found);
      })
      .catch(() => setError('Search failed. Check your internet connection.'))
      .finally(() => setLoading(false));
  }, []);

  const onChangeText = (text: string) => {
    setQuery(text);
    if (debounceHandle) {
      clearTimeout(debounceHandle);
    }
    debounceHandle = setTimeout(() => runSearch(text), 400);
  };

  const onPressTrack = (index: number) => playOnlineTracks(results, index);
  const onAddQueue = (track: OnlineTrack) => {
    if (TrackPlayer.getQueue().length === 0) {
      playOnlineTracks([track], 0);
      return;
    }
    TrackPlayer.addMediaItem(toOnlineMediaItem(track));
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Online" subtitle="Free previews · iTunes" />
      <View style={styles.searchRow}>
        <Icon name="search" size={20} color={colors.textDim} />
        <TextInput
          value={query}
          onChangeText={onChangeText}
          placeholder="Search songs or artists online"
          placeholderTextColor={colors.textDim}
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 ? (
          <Pressable onPress={() => onChangeText('')} hitSlop={8}>
            <Icon name="close" size={20} color={colors.textDim} />
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.accent} />
      ) : error ? (
        <Text style={styles.message}>{error}</Text>
      ) : results.length === 0 ? (
        <Text style={styles.message}>
          {query.trim()
            ? 'No results'
            : 'Search for a song or artist to stream a free 30-second preview.\n\nFull-length streaming needs a licensed music service — this uses the free public iTunes preview API.'}
        </Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={t => t.id}
          extraData={[activeItem?.mediaId, favorites]}
          initialNumToRender={12}
          renderItem={({ item, index }) => {
            const isFav = favorites.includes(item.id);
            return (
              <Pressable
                onPress={() => onPressTrack(index)}
                android_ripple={{ color: colors.surfaceHigh }}
                style={styles.row}>
                <Artwork uri={item.artwork} size={46} radius={6} />
                <View style={styles.texts}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.title,
                      item.id === activeItem?.mediaId && { color: colors.accent },
                    ]}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.sub}>
                    {item.artist} {item.album ? `· ${item.album}` : ''}
                  </Text>
                </View>
                <Pressable
                  hitSlop={10}
                  onPress={() => toggleFavorite(item.id)}
                  style={styles.addBtn}>
                  <Icon
                    name={isFav ? 'heart' : 'heartOutline'}
                    size={20}
                    color={isFav ? colors.accent : colors.textDim}
                  />
                </Pressable>
                <Pressable
                  hitSlop={10}
                  onPress={() => onAddQueue(item)}
                  style={styles.addBtn}>
                  <Icon name="add" size={22} color={colors.textDim} />
                </Pressable>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.surfaceHigh,
      borderRadius: 12,
      marginHorizontal: 16,
      paddingHorizontal: 14,
      height: 44,
      marginBottom: 8,
    },
    input: { flex: 1, color: colors.text, fontSize: 15 },
    message: {
      color: colors.textDim,
      fontSize: 14,
      lineHeight: 21,
      textAlign: 'center',
      padding: 30,
    },
    row: {
      height: sizes.row,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 16,
      paddingRight: 4,
    },
    texts: { flex: 1, marginLeft: 12, marginRight: 8 },
    title: { color: colors.text, fontSize: 15, fontWeight: '600' },
    sub: { color: colors.textDim, fontSize: 13, marginTop: 2 },
    addBtn: { padding: 10 },
  });
