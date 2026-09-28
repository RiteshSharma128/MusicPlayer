
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigator } from './src/navigation/Navigator';
import {
  ErrorScreen,
  LoadingScreen,
  PermissionScreen,
} from './src/screens/GateScreens';
import { useColors } from './src/theme';
import { useThemeStore } from './src/store/themeStore';
import { useLibraryStore } from './src/store/libraryStore';
import { useUserStore } from './src/store/userStore';
import { initPlayer, restoreSession } from './src/services/player';
import { requestNotificationPermission } from './src/services/library';
import { useCrossfadeWatcher, useBrowseTreeSync } from './src/services/hooks';

export default function App() {
  const colors = useColors();
  const themeMode = useThemeStore(s => s.mode);
  const status = useLibraryStore(s => s.status);
  const error = useLibraryStore(s => s.error);
  const init = useLibraryStore(s => s.init);
  const hydrated = useUserStore(s => s.hydrated);
  const [playerReady, setPlayerReady] = useState(false);
  const restoredRef = useRef(false);
  useCrossfadeWatcher();
  useBrowseTreeSync();

  useEffect(() => {
    initPlayer();
    requestNotificationPermission();

    const id = setTimeout(() => setPlayerReady(true), 50);
    init();
    return () => clearTimeout(id);
  
  }, []);

  useEffect(() => {
    if (
      playerReady &&
      hydrated &&
      status === 'ready' &&
      !restoredRef.current
    ) {
      restoredRef.current = true;
      restoreSession();
    }
  }, [playerReady, hydrated, status]);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar
          barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'}
          backgroundColor={colors.bg}
        />
        {status === 'idle' || status === 'loading' ? (
          <LoadingScreen />
        ) : status === 'needs-permission' ? (
          <PermissionScreen blocked={false} />
        ) : status === 'blocked' ? (
          <PermissionScreen blocked />
        ) : status === 'error' ? (
          <ErrorScreen message={error} />
        ) : (
          <Navigator />
        )}
      </View>
    </SafeAreaProvider>
  );
}
