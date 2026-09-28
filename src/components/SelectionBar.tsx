import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import { useColors, type Palette } from '../theme';
import { useSelectionStore } from '../store/selectionStore';
import { useLibraryStore } from '../store/libraryStore';
import { useUserStore } from '../store/userStore';
import { useUiStore } from '../store/uiStore';
import { addToQueue, toast } from '../services/player';
import { pluralize } from '../utils/format';

export function SelectionBar() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const active = useSelectionStore(s => s.active);
  const ids = useSelectionStore(s => s.ids);
  const clear = useSelectionStore(s => s.clear);
  const trackMap = useLibraryStore(s => s.trackMap);
  const toggleFavorite = useUserStore(s => s.toggleFavorite);
  const openPlaylistPicker = useUiStore(s => s.openPlaylistPicker);

  if (!active) {
    return null;
  }

  const selectedIds = Object.keys(ids);
  const tracks = selectedIds.map(id => trackMap[id]).filter(Boolean);

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.top}>
        <Pressable onPress={clear} hitSlop={8} style={styles.closeBtn}>
          <Icon name="close" size={22} />
        </Pressable>
        <Text style={styles.count}>{pluralize(selectedIds.length, 'selected')}</Text>
      </View>
      <View style={styles.actions}>
        <Action
          icon="queue"
          label="Queue"
          onPress={() => {
            tracks.forEach(addToQueue);
            clear();
          }}
        />
        <Action
          icon="playlistAdd"
          label="Playlist"
          onPress={() => {
            openPlaylistPicker(selectedIds);
            clear();
          }}
        />
        <Action
          icon="heart"
          label="Favorite"
          onPress={() => {
            selectedIds.forEach(id => toggleFavorite(id));
            toast('Updated favorites');
            clear();
          }}
        />
      </View>
    </View>
  );
}

function Action({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Icon>['name'];
  label: string;
  onPress: () => void;
}) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} style={styles.action}>
      <Icon name={icon} size={22} color={colors.accent} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    bar: {
      backgroundColor: colors.surfaceHigh,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingTop: 8,
    },
    top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    closeBtn: { padding: 8 },
    count: { color: colors.text, fontWeight: '700', fontSize: 15, marginLeft: 4 },
    actions: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 4 },
    action: { alignItems: 'center', gap: 3, padding: 8 },
    actionLabel: { color: colors.text, fontSize: 12, fontWeight: '600' },
  });
