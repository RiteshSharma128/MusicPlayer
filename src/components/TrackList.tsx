import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { TrackRow } from './TrackRow';
import { sizes, useColors, type Palette } from '../theme';
import type { Track } from '../types';
import { playTracks } from '../services/player';
import { useActiveTrackId } from '../services/hooks';
import { useUiStore } from '../store/uiStore';
import { useSelectionStore } from '../store/selectionStore';

interface Props {
  tracks: Track[];
  header?: React.ReactElement | null;
  emptyText?: string;
  playlistId?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
}

export function TrackList({
  tracks,
  header,
  emptyText = 'Nothing here yet',
  playlistId,
  refreshing,
  onRefresh,
  contentStyle,
}: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const activeId = useActiveTrackId();
  const openTrackMenu = useUiStore(s => s.openTrackMenu);
  const selectionActive = useSelectionStore(s => s.active);
  const selectedIds = useSelectionStore(s => s.ids);
  const startSelection = useSelectionStore(s => s.start);
  const toggleSelection = useSelectionStore(s => s.toggle);

  const onPress = useCallback(
    (index: number) => playTracks(tracks, index),
    [tracks],
  );
  const onMore = useCallback(
    (track: Track) => openTrackMenu(track, playlistId),
    [openTrackMenu, playlistId],
  );
  const onLongPress = useCallback(
    (track: Track) => startSelection(track.id),
    [startSelection],
  );
  const onToggleSelect = useCallback(
    (track: Track) => toggleSelection(track.id),
    [toggleSelection],
  );

  return (
    <FlatList
      data={tracks}
      keyExtractor={t => t.id}
      extraData={[activeId, selectionActive, selectedIds]}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <TrackRow
          track={item}
          index={index}
          active={item.id === activeId}
          onPress={onPress}
          onMore={onMore}
          selectionMode={selectionActive}
          selected={!!selectedIds[item.id]}
          onToggleSelect={onToggleSelect}
          onLongPress={onLongPress}
        />
      )}
      getItemLayout={(_, index) => ({
        length: sizes.row,
        offset: sizes.row * index,
        index,
      })}
      initialNumToRender={14}
      maxToRenderPerBatch={12}
      windowSize={9}
      removeClippedSubviews
      contentContainerStyle={contentStyle}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.surfaceHigh}
          />
        ) : undefined
      }
    />
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: colors.textDim, fontSize: 15, textAlign: 'center' },
});
