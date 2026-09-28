import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { useColors, type Palette } from '../theme';
import { formatTime } from '../utils/format';

interface Props {
  position: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

const THUMB = 14;

export function SeekBar({ position, duration, onSeek }: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [width, setWidth] = useState(0);
  const [dragRatio, setDragRatio] = useState<number | null>(null);

  const widthRef = useRef(0);
  const durationRef = useRef(duration);
  const startXRef = useRef(0);
  const onSeekRef = useRef(onSeek);
  durationRef.current = duration;
  onSeekRef.current = onSeek;

  const clamp = (x: number) =>
    widthRef.current > 0 ? Math.min(1, Math.max(0, x / widthRef.current)) : 0;

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: e => {
          startXRef.current = e.nativeEvent.locationX;
          setDragRatio(clamp(startXRef.current));
        },
        onPanResponderMove: (_, g) => {
          setDragRatio(clamp(startXRef.current + g.dx));
        },
        onPanResponderRelease: (_, g) => {
          const r = clamp(startXRef.current + g.dx);
          setDragRatio(null);
          if (durationRef.current > 0) {
            onSeekRef.current(r * durationRef.current);
          }
        },
        onPanResponderTerminate: () => setDragRatio(null),
      }),
    [],
  );

  const ratio =
    dragRatio ?? (duration > 0 ? Math.min(1, position / duration) : 0);
  const shownPosition = dragRatio != null ? dragRatio * duration : position;

  return (
    <View>
      <View
        style={styles.touch}
        onLayout={e => {
          widthRef.current = e.nativeEvent.layout.width;
          setWidth(e.nativeEvent.layout.width);
        }}
        {...pan.panHandlers}>
        <View style={styles.track} pointerEvents="none">
          <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
        </View>
        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            { left: Math.max(0, ratio * width - THUMB / 2) },
            dragRatio != null && styles.thumbActive,
          ]}
        />
      </View>
      <View style={styles.times}>
        <Text style={styles.time}>{formatTime(shownPosition)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  touch: { height: 36, justifyContent: 'center' },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceHigh,
    overflow: 'hidden',
  },
  fill: { height: 4, backgroundColor: colors.accent },
  thumb: {
    position: 'absolute',
    top: (36 - THUMB) / 2,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.text,
  },
  thumbActive: { transform: [{ scale: 1.35 }], backgroundColor: colors.accent },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { color: colors.textDim, fontSize: 12, fontVariant: ['tabular-nums'] },
});
