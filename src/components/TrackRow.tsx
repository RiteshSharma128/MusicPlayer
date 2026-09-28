import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Artwork } from './Artwork';
import { Icon } from './Icon';
import { sizes, useColors, type Palette } from '../theme';
import type { Track } from '../types';
import { formatTime } from '../utils/format';
import { applyOverride, artistOf } from '../utils/library';
import { useUserStore } from '../store/userStore';

interface Props {
  track: Track;
  index: number;
  active: boolean;
  onPress: (index: number) => void;
  onMore: (track: Track) => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (track: Track) => void;
  onLongPress?: (track: Track) => void;
}

function TrackRowBase({
  track,
  index,
  active,
  onPress,
  onMore,
  selectionMode,
  selected,
  onToggleSelect,
  onLongPress,
}: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const override = useUserStore(s => s.trackOverrides[track.id]);
  const shown = useMemo(
    () => (override ? applyOverride(track, override) : track),
    [track, override],
  );
  return (
    <Pressable
      onPress={() =>
        selectionMode ? onToggleSelect?.(track) : onPress(index)
      }
      onLongPress={() => onLongPress?.(track)}
      android_ripple={{ color: colors.surfaceHigh }}
      style={styles.row}>
      {selectionMode ? (
        <View style={styles.checkboxWrap}>
          <View
            style={[
              styles.checkbox,
              selected && {
                backgroundColor: colors.accent,
                borderColor: colors.accent,
              },
            ]}>
            {selected ? <Icon name="check" size={16} color={colors.bg} /> : null}
          </View>
        </View>
      ) : (
        <Artwork uri={track.artwork} size={46} radius={6} />
      )}
      <View style={styles.texts}>
        <Text
          numberOfLines={1}
          style={[styles.title, active && { color: colors.accent }]}>
          {shown.title}
        </Text>
        <Text numberOfLines={1} style={styles.sub}>
          {artistOf(shown)} · {formatTime(track.duration)}
        </Text>
      </View>
      {selectionMode ? null : (
        <Pressable
          hitSlop={10}
          onPress={() => onMore(track)}
          style={styles.more}>
          <Icon name="more" size={22} color={colors.textDim} />
        </Pressable>
      )}
    </Pressable>
  );
}

export const TrackRow = memo(TrackRowBase);

const makeStyles = (colors: Palette) => StyleSheet.create({
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
  more: { padding: 10 },
  checkboxWrap: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
