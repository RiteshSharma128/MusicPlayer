import { useEffect, useRef, useState } from 'react';
import TrackPlayer, {
  Event,
  useActiveMediaItem,
  useProgress,
  type MediaItem,
} from '@rntp/player';
import { useSettingsStore } from '../store/settingsStore';
import { useLibraryStore } from '../store/libraryStore';
import { useUserStore } from '../store/userStore';
import { publishBrowseTree } from './androidAuto';
import { FULL_VOLUME } from './player';

export function useActiveTrackId(): string | null {
  const item = useActiveMediaItem();
  return item?.mediaId ?? null;
}
export function useQueue(): { queue: MediaItem[]; activeIndex: number | null } {
  const [state, setState] = useState(() => ({
    queue: TrackPlayer.getQueue(),
    activeIndex: TrackPlayer.getActiveMediaItemIndex(),
  }));

  useEffect(() => {
    const refresh = () =>
      setState({
        queue: TrackPlayer.getQueue(),
        activeIndex: TrackPlayer.getActiveMediaItemIndex(),
      });
    const a = TrackPlayer.addEventListener(Event.QueueChanged, refresh);
    const b = TrackPlayer.addEventListener(Event.MediaItemTransition, refresh);
    refresh();
    return () => {
      a.remove();
      b.remove();
    };
  }, []);

  return state;
}
export function useSleepTimer(): {
  type: 'time' | 'mediaItem';
  remainingSeconds?: number;
} | null {
  const [timer, setTimer] = useState(() => read());

  useEffect(() => {
    const id = setInterval(() => setTimer(read()), 1000);
    const sub = TrackPlayer.addEventListener(Event.SleepTimerTriggered, () =>
      setTimer(null),
    );
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, []);

  return timer;
}

function read() {
  const t = TrackPlayer.getSleepTimer();
  if (!t) {
    return null;
  }
  return t.type === 'time'
    ? { type: 'time' as const, remainingSeconds: t.remainingSeconds }
    : { type: 'mediaItem' as const };
}

export function useCrossfadeWatcher() {
  const enabled = useSettingsStore(s => s.crossfadeEnabled);
  const seconds = useSettingsStore(s => s.crossfadeSeconds);
  const { position, duration } = useProgress(0.2);
  const lastVolumeRef = useRef(FULL_VOLUME);

  useEffect(() => {
    if (!enabled) {
      if (lastVolumeRef.current !== FULL_VOLUME) {
        lastVolumeRef.current = FULL_VOLUME;
        TrackPlayer.setVolume(FULL_VOLUME);
      }
      return;
    }
    if (duration <= 0 || seconds <= 0) {
      return;
    }
    const fadeIn = position < seconds ? position / seconds : 1;
    const remaining = duration - position;
    const fadeOut = remaining < seconds ? Math.max(remaining, 0) / seconds : 1;
    const target = Math.min(fadeIn, fadeOut);
    const clamped = Math.min(1, Math.max(0.05, target));
    if (Math.abs(clamped - lastVolumeRef.current) > 0.02) {
      lastVolumeRef.current = clamped;
      TrackPlayer.setVolume(clamped);
    }
  }, [enabled, seconds, position, duration]);

  const activeId = useActiveTrackId();
  useEffect(() => {
    lastVolumeRef.current = FULL_VOLUME;
    TrackPlayer.setVolume(FULL_VOLUME);
  }, [activeId]);
}


export function useBrowseTreeSync() {
  const status = useLibraryStore(s => s.status);
  const albums = useLibraryStore(s => s.albums);
  const artists = useLibraryStore(s => s.artists);
  const trackMap = useLibraryStore(s => s.trackMap);
  const playlists = useUserStore(s => s.playlists);
  const favoriteIds = useUserStore(s => s.favorites);

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }
    const favorites = favoriteIds
      .map(id => trackMap[id])
      .filter((t): t is NonNullable<typeof t> => !!t);
    publishBrowseTree({ favorites, albums, artists, playlists, trackMap });
  }, [status, albums, artists, trackMap, playlists, favoriteIds]);
}
