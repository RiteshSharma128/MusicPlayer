import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Artwork } from '../components/Artwork';
import { Icon } from '../components/Icon';
import { ScreenHeader, type HeaderAction } from '../components/ScreenHeader';
import { TrackList } from '../components/TrackList';
import { useColors, type Palette } from '../theme';
import type { Track } from '../types';
import { playInOrder, playShuffled } from '../services/player';
import { pluralize, totalDuration } from '../utils/format';

interface Props {
  title: string;
  subtitle?: string;
  artwork?: string | null;
  tracks: Track[];
  playlistId?: string;
  emptyText?: string;
  actions?: HeaderAction[];
  onBack: () => void;
}

export function CollectionScreen({
  title,
  subtitle,
  artwork,
  tracks,
  playlistId,
  emptyText,
  actions,
  onBack,
}: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const seconds = tracks.reduce((sum, t) => sum + t.duration, 0);

  const hero = (
    <View style={styles.hero}>
      <Artwork uri={artwork} size={96} radius={12} />
      <View style={styles.heroRight}>
        <Text style={styles.meta} numberOfLines={2}>
          {[subtitle, pluralize(tracks.length, 'song'), totalDuration(seconds)]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        <View style={styles.buttons}>
          <Pressable
            disabled={tracks.length === 0}
            onPress={() => playInOrder(tracks)}
            style={[styles.btn, styles.btnPrimary]}>
            <Icon name="play" size={20} color={colors.bg} />
            <Text style={styles.btnPrimaryText}>Play</Text>
          </Pressable>
          <Pressable
            disabled={tracks.length === 0}
            onPress={() => playShuffled(tracks)}
            style={[styles.btn, styles.btnSecondary]}>
            <Icon name="shuffle" size={18} color={colors.text} />
            <Text style={styles.btnSecondaryText}>Shuffle</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <ScreenHeader title={title} onBack={onBack} actions={actions} />
      <TrackList
        tracks={tracks}
        header={hero}
        playlistId={playlistId}
        emptyText={emptyText}
      />
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  heroRight: { flex: 1, marginLeft: 16 },
  meta: { color: colors.textDim, fontSize: 13, marginBottom: 12 },
  buttons: { flexDirection: 'row', gap: 10 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
  },
  btnPrimary: { backgroundColor: colors.text },
  btnPrimaryText: { color: colors.bg, fontWeight: '800', fontSize: 14 },
  btnSecondary: { backgroundColor: colors.surfaceHigh },
  btnSecondaryText: { color: colors.text, fontWeight: '700', fontSize: 14 },
});
