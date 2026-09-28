import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackPlayer, {
  RepeatMode,
  useActiveMediaItem,
  useIsPlaying,
  useProgress,
} from '@rntp/player';
import { Artwork } from '../components/Artwork';
import { Icon } from '../components/Icon';
import { SeekBar } from '../components/SeekBar';
import { Waveform } from '../components/Waveform';
import { useColors, type Palette } from '../theme';
import { cycleRepeat, togglePlay, toggleShuffle } from '../services/player';
import { useSleepTimer } from '../services/hooks';
import { usePlayerStore } from '../store/playerStore';
import { useUserStore } from '../store/userStore';
import { useUiStore } from '../store/uiStore';
import { useLibraryStore } from '../store/libraryStore';
import { formatTime } from '../utils/format';

interface Props {
  onClose: () => void;
}

export function NowPlayingScreen({ onClose }: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const y = useRef(new Animated.Value(height)).current;

  const item = useActiveMediaItem();
  const playing = useIsPlaying();
  const { position, duration } = useProgress(0.5);
  const shuffle = usePlayerStore(s => s.shuffle);
  const repeat = usePlayerStore(s => s.repeat);
  const speed = usePlayerStore(s => s.speed);
  const favorites = useUserStore(s => s.favorites);
  const toggleFavorite = useUserStore(s => s.toggleFavorite);
  const trackMap = useLibraryStore(s => s.trackMap);
  const patch = useUiStore(s => s.patch);
  const openPlaylistPicker = useUiStore(s => s.openPlaylistPicker);
  const sleep = useSleepTimer();

  useEffect(() => {
    Animated.timing(y, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [y]);

  const close = useCallback(() => {
    Animated.timing(y, {
      toValue: height,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  }, [y, height, onClose]);

  // Registered after the Navigator's handler, so it runs first on Back.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [close]);

  const trackId = item?.mediaId ?? null;
  const track = trackId ? trackMap[trackId] : undefined;
  const isFav = trackId ? favorites.includes(trackId) : false;
  const art =
    track?.artwork ??
    (item && typeof item.artworkUrl === 'string' ? item.artworkUrl : null);
  const total = duration > 0 ? duration : item?.duration ?? 0;
  const artSize = Math.min(width - 56, height * 0.4);

  const sleepLabel =
    sleep == null
      ? null
      : sleep.type === 'time'
      ? formatTime(sleep.remainingSeconds ?? 0)
      : 'End of song';

  return (
    <Animated.View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 12,
          transform: [{ translateY: y }],
        },
      ]}>
      <View style={styles.topBar}>
        <Pressable onPress={close} hitSlop={10} style={styles.topBtn}>
          <Icon name="chevronDown" size={30} />
        </Pressable>
        <Text style={styles.topTitle}>NOW PLAYING</Text>
        <Pressable
          hitSlop={10}
          onPress={() => patch({ queueSheet: true })}
          style={styles.topBtn}>
          <Icon name="queue" size={24} />
        </Pressable>
      </View>

      <View style={styles.artWrap}>
        <Artwork uri={art} size={artSize} radius={20} />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoTexts}>
          <Text numberOfLines={1} style={styles.title}>
            {item?.title ?? 'Nothing playing'}
          </Text>
          <Text numberOfLines={1} style={styles.artist}>
            {item?.artist ?? ''}
          </Text>
        </View>
        <Pressable
          hitSlop={10}
          disabled={!trackId}
          onPress={() => trackId && toggleFavorite(trackId)}
          style={styles.favBtn}>
          <Icon
            name={isFav ? 'heart' : 'heartOutline'}
            size={28}
            color={isFav ? colors.accent : colors.text}
          />
        </Pressable>
      </View>

      <View style={styles.seek}>
        {trackId ? (
          <View style={styles.waveform}>
            <Waveform
              seed={trackId}
              progress={total > 0 ? Math.min(1, position / total) : 0}
            />
          </View>
        ) : null}
        <SeekBar
          position={position}
          duration={total}
          onSeek={s => TrackPlayer.seekTo(s)}
        />
      </View>

      <View style={styles.controls}>
        <Pressable hitSlop={10} onPress={toggleShuffle} style={styles.ctrlSmall}>
          <Icon
            name="shuffle"
            size={26}
            color={shuffle ? colors.accent : colors.textDim}
          />
        </Pressable>
        <Pressable
          hitSlop={10}
          onPress={() => TrackPlayer.skipToPrevious()}
          style={styles.ctrl}>
          <Icon name="prev" size={38} />
        </Pressable>
        <Pressable onPress={togglePlay} style={styles.playBtn}>
          <Icon name={playing ? 'pause' : 'play'} size={40} color={colors.bg} />
        </Pressable>
        <Pressable
          hitSlop={10}
          onPress={() => TrackPlayer.skipToNext()}
          style={styles.ctrl}>
          <Icon name="next" size={38} />
        </Pressable>
        <Pressable hitSlop={10} onPress={cycleRepeat} style={styles.ctrlSmall}>
          <Icon
            name={repeat === RepeatMode.One ? 'repeatOne' : 'repeat'}
            size={26}
            color={repeat === RepeatMode.Off ? colors.textDim : colors.accent}
          />
        </Pressable>
      </View>

      <View style={styles.bottomRow}>
        <Pressable
          onPress={() => patch({ sleepSheet: true })}
          style={styles.chip}>
          <Icon
            name="timer"
            size={20}
            color={sleepLabel ? colors.accent : colors.textDim}
          />
          <Text style={[styles.chipText, sleepLabel && { color: colors.accent }]}>
            {sleepLabel ?? 'Sleep'}
          </Text>
        </Pressable>
        <Pressable onPress={() => patch({ speedSheet: true })} style={styles.chip}>
          <Icon
            name="speed"
            size={20}
            color={speed !== 1 ? colors.accent : colors.textDim}
          />
          <Text style={[styles.chipText, speed !== 1 && { color: colors.accent }]}>
            {speed}x
          </Text>
        </Pressable>
        <Pressable
          disabled={!trackId}
          onPress={() => trackId && openPlaylistPicker([trackId])}
          style={styles.chip}>
          <Icon name="playlistAdd" size={20} color={colors.textDim} />
          <Text style={styles.chipText}>Playlist</Text>
        </Pressable>
        <Pressable
          disabled={!trackId}
          onPress={() => patch({ lyricsSheet: true })}
          style={styles.chip}>
          <Icon name="edit" size={20} color={colors.textDim} />
          <Text style={styles.chipText}>Lyrics</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.bg,
    paddingHorizontal: 24,
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topTitle: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  artWrap: { alignItems: 'center', marginTop: 12, marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoTexts: { flex: 1 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  artist: { color: colors.textDim, fontSize: 16, marginTop: 4 },
  favBtn: { padding: 8, marginLeft: 8 },
  waveform: { marginBottom: 4 },
  seek: { marginTop: 14 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  ctrl: { padding: 6 },
  ctrlSmall: { padding: 8 },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 'auto',
    paddingTop: 12,
  },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 },
  chipText: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
});
