import { NativeModules, Platform } from 'react-native';

interface WidgetNative {
  updateNowPlaying(title: string, artist: string): Promise<void>;
}

const native: WidgetNative | undefined = NativeModules.WidgetModule;

export function updateWidgetNowPlaying(title: string, artist: string) {
  if (Platform.OS !== 'android' || !native) {
    return;
  }
  native.updateNowPlaying(title, artist).catch(() => {
    
  });
}
