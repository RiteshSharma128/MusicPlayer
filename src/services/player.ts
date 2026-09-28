import { AppState, Platform, ToastAndroid } from 'react-native';
import TrackPlayer, {
  Event,
  PlaybackState,
  PlayerCommand,
  RepeatMode,
  type MediaItem,
} from '@rntp/player';
import type { Track, OnlineTrack } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { useUserStore } from '../store/userStore';
import { useLibraryStore } from '../store/libraryStore';
import { artistOf, applyOverride } from '../utils/library';
import { updateWidgetNowPlaying } from './widget';

let initialised = false;
let consecutiveErrors = 0;
export const FULL_VOLUME = 1;

export function toast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
}

export function toMediaItem(track: Track): MediaItem {
  const override = useUserStore.getState().trackOverrides[track.id];
  const t = override ? applyOverride(track, override) : track;
  return {
    mediaId: t.id,
    url: t.url,
    title: t.title,
    artist: artistOf(t),
    albumTitle: t.album ?? undefined,
    artworkUrl: t.artwork ?? undefined,
    duration: t.duration,
  };
}

export function toOnlineMediaItem(track: OnlineTrack): MediaItem {
  return {
    mediaId: track.id,
    url: track.previewUrl,
    title: track.title,
    artist: track.artist,
    albumTitle: track.album ?? undefined,
    artworkUrl: track.artwork ?? undefined,
    duration: track.durationMs / 1000,
  };
}


export function playOnlineTracks(tracks: OnlineTrack[], startIndex = 0) {
  if (tracks.length === 0) {
    return;
  }
  consecutiveErrors = 0;
  TrackPlayer.setMediaItems(tracks.map(toOnlineMediaItem), startIndex);
  TrackPlayer.play();
}

export function initPlayer() {
  if (initialised) {
    return;
  }
  initialised = true;

  TrackPlayer.setupPlayer({
    contentType: 'music',
    handleAudioBecomingNoisy: true, // pause when headphones are unplugged
    android: { wakeMode: 'local', taskRemovedBehavior: 'continue' },
  });


  TrackPlayer.setCommands({
    capabilities: [
      PlayerCommand.PlayPause,
      PlayerCommand.Next,
      PlayerCommand.Previous,
      PlayerCommand.Seek,
    ],
  });

  usePlayerStore.getState().set({
    shuffle: TrackPlayer.isShuffleEnabled(),
    repeat: TrackPlayer.getRepeatMode(),
    speed: TrackPlayer.getPlaybackSpeed(),
  });

  TrackPlayer.addEventListener(Event.MediaItemTransition, ({ item }) => {
    consecutiveErrors = 0;
    if (item?.mediaId) {
      useUserStore.getState().addRecent(item.mediaId);
    }
    updateWidgetNowPlaying(item?.title ?? 'Not playing', item?.artist ?? '');
    saveSession();
  });

  TrackPlayer.addEventListener(Event.IsPlayingChanged, ({ playing }) => {
    if (!playing) {
      saveSession();
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackError, () => {
    consecutiveErrors += 1;
    const queueLength = TrackPlayer.getQueue().length;
    if (queueLength > 1 && consecutiveErrors < Math.min(queueLength, 5)) {
      toast("Can't play this file, skipping");
      TrackPlayer.skipToNext();
    } else {
      toast("Can't play this file");
    }
  });

  AppState.addEventListener('change', status => {
    if (status !== 'active') {
      saveSession();
    }
  });
}

export function saveSession() {
  try {
    const queue = TrackPlayer.getQueue();
    if (queue.length === 0) {
      return;
    }
    const ids = queue.map(q => q.mediaId ?? '').filter(Boolean);
    useUserStore.getState().setSession({
      ids,
      index: TrackPlayer.getActiveMediaItemIndex() ?? 0,
      position: TrackPlayer.getProgress().position,
      shuffle: usePlayerStore.getState().shuffle,
      repeat: usePlayerStore.getState().repeat,
    });
  } catch {

  }
}


export function restoreSession() {
  if (TrackPlayer.getQueue().length > 0) {
    return; // player is already alive and has a queue
  }
  const session = useUserStore.getState().session;
  if (!session) {
    return;
  }
  const { trackMap } = useLibraryStore.getState();
  const tracks: Track[] = [];
  let startIndex = 0;
  session.ids.forEach((id, i) => {
    const track = trackMap[id];
    if (track) {
      if (i === session.index) {
        startIndex = tracks.length;
      }
      tracks.push(track);
    }
  });
  if (tracks.length === 0) {
    return;
  }
  TrackPlayer.setMediaItems(tracks.map(toMediaItem), startIndex);
  applyModes(session.shuffle, session.repeat as RepeatMode);
  if (session.position > 1) {
    TrackPlayer.seekTo(session.position);
  }
}

function applyModes(shuffle: boolean, repeat: RepeatMode) {
  TrackPlayer.setShuffleEnabled(shuffle);
  TrackPlayer.setRepeatMode(repeat);
  usePlayerStore.getState().set({ shuffle, repeat });
}


export function playTracks(tracks: Track[], startIndex = 0) {
  if (tracks.length === 0) {
    return;
  }
  consecutiveErrors = 0;
  TrackPlayer.setMediaItems(tracks.map(toMediaItem), startIndex);
  TrackPlayer.play();
}

export function playInOrder(tracks: Track[]) {
  setShuffle(false);
  playTracks(tracks, 0);
}

export function playShuffled(tracks: Track[]) {
  if (tracks.length === 0) {
    return;
  }
  setShuffle(true);
  playTracks(tracks, Math.floor(Math.random() * tracks.length));
}

export function playNext(track: Track) {
  const queue = TrackPlayer.getQueue();
  if (queue.length === 0) {
    playTracks([track], 0);
    return;
  }
  const active = TrackPlayer.getActiveMediaItemIndex() ?? -1;
  TrackPlayer.insertMediaItem(active + 1, toMediaItem(track));
  toast('Will play next');
}

export function addToQueue(track: Track) {
  if (TrackPlayer.getQueue().length === 0) {
    playTracks([track], 0);
    return;
  }
  TrackPlayer.addMediaItem(toMediaItem(track));
  toast('Added to queue');
}

export function togglePlay() {
  if (TrackPlayer.isPlaying()) {
    TrackPlayer.pause();
    return;
  }
  if (TrackPlayer.getPlaybackState() === PlaybackState.Ended) {
    TrackPlayer.skipToIndex(0);
  }
  TrackPlayer.play();
}

export function setShuffle(enabled: boolean) {
  TrackPlayer.setShuffleEnabled(enabled);
  usePlayerStore.getState().set({ shuffle: enabled });
  saveSession();
}

export function toggleShuffle() {
  setShuffle(!usePlayerStore.getState().shuffle);
}

export function cycleRepeat() {
  const current = usePlayerStore.getState().repeat;
  const next =
    current === RepeatMode.Off
      ? RepeatMode.All
      : current === RepeatMode.All
      ? RepeatMode.One
      : RepeatMode.Off;
  TrackPlayer.setRepeatMode(next);
  usePlayerStore.getState().set({ repeat: next });
  saveSession();
}

export function setSpeed(speed: number) {
  TrackPlayer.setPlaybackSpeed(speed);
  usePlayerStore.getState().set({ speed });
}

export function sleepInMinutes(minutes: number) {
  TrackPlayer.sleepAfterTime(minutes * 60, { fadeOutSeconds: 10 });
  toast(`Sleep timer: ${minutes} min`);
}

export function sleepAfterThisSong() {
  TrackPlayer.sleepAfterMediaItemAtIndex();
  toast('Will stop after this song');
}

export function cancelSleep() {
  TrackPlayer.cancelSleepTimer();
  toast('Sleep timer off');
}
