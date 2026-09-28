import { PermissionsAndroid, Platform, type Permission } from 'react-native';
import { getAllTracksAsync } from '@nodefinity/react-native-music-library';
import type { Track } from '../types';
import { isMusic } from '../utils/library';

export type PermissionResult = 'granted' | 'denied' | 'blocked';

function audioPermission(): Permission {
  const api = typeof Platform.Version === 'number' ? Platform.Version : 0;
  return api >= 33
    ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
    : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
}

export async function hasAudioPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  return PermissionsAndroid.check(audioPermission());
}

export async function requestAudioPermission(): Promise<PermissionResult> {
  if (Platform.OS !== 'android') {
    return 'granted';
  }
  const result = await PermissionsAndroid.request(audioPermission(), {
    title: 'Music access',
    message: 'Allow access to the audio files on your phone to play them.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });
  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    return 'granted';
  }
  return result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
    ? 'blocked'
    : 'denied';
}

export async function requestNotificationPermission(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  const api = typeof Platform.Version === 'number' ? Platform.Version : 0;
  if (api < 33) {
    return;
  }
  try {
    const perm = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
    const already = await PermissionsAndroid.check(perm);
    if (!already) {
      await PermissionsAndroid.request(perm);
    }
  } catch {
  }
}


export async function scanDeviceMusic(): Promise<Track[]> {
  const all = await getAllTracksAsync({ first: 1000, sortBy: ['title', true] });
  return all.filter(t => isMusic(t));
}
