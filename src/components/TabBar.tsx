import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from './Icon';
import { sizes, useColors, type Palette } from '../theme';
import type { TabKey } from '../navigation/NavContext';

const TABS: { key: TabKey; label: string; icon: IconName }[] = [
  { key: 'songs', label: 'Songs', icon: 'music' },
  { key: 'albums', label: 'Albums', icon: 'album' },
  { key: 'artists', label: 'Artists', icon: 'person' },
  { key: 'playlists', label: 'Library', icon: 'queue' },
  { key: 'online', label: 'Online', icon: 'globe' },
];

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export function TabBar({ active, onChange }: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        { height: sizes.tabBar + insets.bottom, paddingBottom: insets.bottom },
      ]}>
      {TABS.map(t => {
        const on = t.key === active;
        const color = on ? colors.accent : colors.textDim;
        return (
          <Pressable
            key={t.key}
            style={styles.tab}
            onPress={() => onChange(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}>
            <Icon name={t.icon} size={22} color={color} />
            <Text style={[styles.label, { color }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { fontSize: 11, fontWeight: '600' },
});
