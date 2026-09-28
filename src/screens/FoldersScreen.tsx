import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { GroupRow } from '../components/GroupRow';
import { ScreenHeader } from '../components/ScreenHeader';
import { useColors, sizes, type Palette } from '../theme';
import { useLibraryStore } from '../store/libraryStore';
import { useNav } from '../navigation/NavContext';
import { pluralize } from '../utils/format';

interface Props {
  onBack: () => void;
}

export function FoldersScreen({ onBack }: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const folders = useLibraryStore(s => s.folders);
  const nav = useNav();

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Folders"
        subtitle={pluralize(folders.length, 'folder')}
        onBack={onBack}
      />
      <FlatList
        data={folders}
        keyExtractor={f => f.path}
        getItemLayout={(_, i) => ({
          length: sizes.row,
          offset: sizes.row * i,
          index: i,
        })}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No folders found (only on-device files have folders).
          </Text>
        }
        renderItem={({ item }) => (
          <GroupRow
            icon="folder"
            title={item.name}
            subtitle={pluralize(item.tracks.length, 'song')}
            onPress={() => nav.push({ kind: 'folder', path: item.path })}
          />
        )}
      />
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    empty: { color: colors.textDim, textAlign: 'center', padding: 40 },
  });
