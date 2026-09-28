import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import TrackPlayer, { useActiveMediaItem, useIsPlaying, useProgress } from '@rntp/player';
import { Artwork } from './Artwork';
import { Icon } from './Icon';
import { sizes, useColors, type Palette } from '../theme';
import { togglePlay } from '../services/player';

interface Props {
  onOpen: () => void;
}

export function MiniPlayer({ onOpen }: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const item = useActiveMediaItem();
  const playing = useIsPlaying();
  const { position, duration } = useProgress(1);

  if (!item) {
    return null;
  }
  const art = typeof item.artworkUrl === 'string' ? item.artworkUrl : null;
  const total = duration > 0 ? duration : item.duration ?? 0;
  const ratio = total > 0 ? Math.min(1, position / total) : 0;

  return (
    <Pressable onPress={onOpen} style={styles.wrap}>
      <View style={styles.progressTrack}>
        <View style={[styles.progress, { width: `${ratio * 100}%` }]} />
      </View>
      <View style={styles.row}>
        <Artwork uri={art} size={44} radius={6} />
        <View style={styles.texts}>
          <Text numberOfLines={1} style={styles.title}>
            {item.title ?? 'Unknown'}
          </Text>
          <Text numberOfLines={1} style={styles.artist}>
            {item.artist ?? ''}
          </Text>
        </View>
        <Pressable hitSlop={8} onPress={togglePlay} style={styles.btn}>
          <Icon name={playing ? 'pause' : 'play'} size={30} />
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={() => TrackPlayer.skipToNext()}
          style={styles.btn}>
          <Icon name="next" size={28} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  wrap: {
    height: sizes.miniPlayer,
    backgroundColor: colors.surfaceHigh,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  progressTrack: { height: 2, backgroundColor: colors.border },
  progress: { height: 2, backgroundColor: colors.accent },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  texts: { flex: 1, marginHorizontal: 12 },
  title: { color: colors.text, fontSize: 14, fontWeight: '700' },
  artist: { color: colors.textDim, fontSize: 12, marginTop: 1 },
  btn: { padding: 8 },
});
