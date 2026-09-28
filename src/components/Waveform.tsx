import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useColors } from '../theme';

interface Props {
  seed: string;
  progress: number; // 0..1
  barCount?: number;
  height?: number;
}
function hashSeed(seed: string): number {
  /* eslint-disable no-bitwise */
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
  /* eslint-enable no-bitwise */
}

function makeBars(seed: string, count: number): number[] {
  let x = hashSeed(seed) || 1;
  const rand = () => {
     /* eslint-disable no-bitwise */
    // xorshift32
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    /* eslint-enable no-bitwise */
    return x / 0xffffffff;
  };
  const bars: number[] = [];
  let level = 0.5;
  for (let i = 0; i < count; i++) {
    level = level * 0.7 + rand() * 0.3;
    bars.push(0.18 + level * 0.82);
  }
  return bars;
}

export function Waveform({ seed, progress, barCount = 46, height = 36 }: Props) {
  const colors = useColors();
  const bars = useMemo(() => makeBars(seed, barCount), [seed, barCount]);
  const playedCount = Math.round(progress * barCount);

  return (
    <View style={[styles.row, { height }]}>
      {bars.map((h, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            {
              height: `${Math.round(h * 100)}%`,
              backgroundColor: i < playedCount ? colors.accent : colors.surfaceHigh,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bar: { width: 3, borderRadius: 1.5, minHeight: 3 },
});
