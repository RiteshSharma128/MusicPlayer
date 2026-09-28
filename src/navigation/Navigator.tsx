import React, { useCallback, useState, useMemo } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '../utils/useFocusEffect';
import { MiniPlayer } from '../components/MiniPlayer';
import { SelectionBar } from '../components/SelectionBar';
import { Sheets } from '../components/Sheets';
import { TabBar } from '../components/TabBar';
import { NowPlayingScreen } from '../screens/NowPlayingScreen';
import { SongsScreen } from '../screens/SongsScreen';
import { AlbumsScreen } from '../screens/AlbumsScreen';
import { ArtistsScreen } from '../screens/ArtistsScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { OnlineScreen } from '../screens/OnlineScreen';
import { FoldersScreen } from '../screens/FoldersScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { CollectionRouter } from '../screens/CollectionRouter';
import { useColors, type Palette } from '../theme';
import { NavContext, type StackRoute, type TabKey } from './NavContext';
import { useActiveMediaItem } from '@rntp/player';
import { useSelectionStore } from '../store/selectionStore';

const TAB_SCREENS: Record<TabKey, React.ComponentType> = {
  songs: SongsScreen,
  albums: AlbumsScreen,
  artists: ArtistsScreen,
  playlists: LibraryScreen,
  online: OnlineScreen,
};

export function Navigator() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [tab, setTab] = useState<TabKey>('songs');
  const [stack, setStack] = useState<StackRoute[]>([]);
  const [playerOpen, setPlayerOpen] = useState(false);
  const activeItem = useActiveMediaItem();
  const selectionActive = useSelectionStore(st => st.active);
  const clearSelection = useSelectionStore(st => st.clear);

  const push = useCallback((route: StackRoute) => setStack(s => [...s, route]), []);
  const pop = useCallback(() => setStack(s => s.slice(0, -1)), []);
  const openPlayer = useCallback(() => setPlayerOpen(true), []);

  useHardwareBack(
    useCallback(() => {
      if (playerOpen) {
        return false; 
      }
      if (selectionActive) {
        clearSelection();
        return true;
      }
      if (stack.length > 0) {
        pop();
        return true;
      }
      return false;
    }, [playerOpen, selectionActive, clearSelection, stack.length, pop]),
  );

  const Tab = TAB_SCREENS[tab];

  return (
    <NavContext.Provider value={{ tab, setTab, push, pop, openPlayer }}>
      <View style={styles.root}>
        <View style={styles.body}>
          <Tab />
          {stack.map((route, i) => {
            const onBack = i === stack.length - 1 ? pop : () => {};
            return (
              <View key={i} style={StyleSheet.absoluteFill}>
                {route.kind === 'search' ? (
                  <SearchScreen onBack={onBack} />
                ) : route.kind === 'folders' ? (
                  <FoldersScreen onBack={onBack} />
                ) : route.kind === 'settings' ? (
                  <SettingsScreen onBack={onBack} />
                ) : (
                  <CollectionRouter route={route} onBack={onBack} />
                )}
              </View>
            );
          })}
        </View>

        {selectionActive ? (
          <SelectionBar />
        ) : activeItem ? (
          <MiniPlayer onOpen={openPlayer} />
        ) : null}
        <TabBar active={tab} onChange={setTab} />

        {playerOpen ? (
          <NowPlayingScreen onClose={() => setPlayerOpen(false)} />
        ) : null}

        <Sheets />
      </View>
    </NavContext.Provider>
  );
}

function useHardwareBack(handler: () => boolean) {
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', handler);
      return () => sub.remove();
    }, [handler]),
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1 },
});
