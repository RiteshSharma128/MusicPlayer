import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import TrackPlayer from '@rntp/player';
import { Artwork } from './Artwork';
import { Icon } from './Icon';
import { Sheet, SheetItem } from './Sheet';
import { useColors, type Palette } from '../theme';
import { useUiStore } from '../store/uiStore';
import { useUserStore } from '../store/userStore';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { useNav } from '../navigation/NavContext';
import {
  addToQueue,
  cancelSleep,
  playNext,
  setSpeed,
  sleepAfterThisSong,
  sleepInMinutes,
  toast,
} from '../services/player';
import { useQueue, useSleepTimer, useActiveTrackId } from '../services/hooks';
import { loadLyrics, activeLyricIndex, type ParsedLyrics } from '../services/lyrics';
import { useProgress } from '@rntp/player';
import { albumIdOf, artistIdOf, artistOf } from '../utils/library';
import { pluralize } from '../utils/format';
import type { SongSort } from '../types';

export function Sheets() {
  return (
    <>
      <TrackMenuSheet />
      <PlaylistPickerSheet />
      <NamePromptModal />
      <EditTrackSheet />
      <LyricsSheet />
      <SleepSheet />
      <SpeedSheet />
      <QueueSheet />
      <SortSheet />
    </>
  );
}

function TrackMenuSheet() {
  const colors = useColors();
  const menu = useUiStore(s => s.trackMenu);
  const patch = useUiStore(s => s.patch);
  const favorites = useUserStore(s => s.favorites);
  const toggleFavorite = useUserStore(s => s.toggleFavorite);
  const removeFromPlaylist = useUserStore(s => s.removeFromPlaylist);
  const nav = useNav();

  const close = () => patch({ trackMenu: null });
  const track = menu?.track;
  const isFav = track ? favorites.includes(track.id) : false;

  return (
    <Sheet visible={!!menu} title={track?.title} onClose={close}>
      {track ? (
        <>
          <SheetItem
            label="Play next"
            icon={<Icon name="next" size={22} />}
            onPress={() => {
              close();
              playNext(track);
            }}
          />
          <SheetItem
            label="Add to queue"
            icon={<Icon name="queue" size={22} />}
            onPress={() => {
              close();
              addToQueue(track);
            }}
          />
          <SheetItem
            label="Add to playlist"
            icon={<Icon name="playlistAdd" size={22} />}
            onPress={() =>
              patch({ trackMenu: null, playlistPicker: { trackIds: [track.id] } })
            }
          />
          <SheetItem
            label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            icon={
              <Icon
                name={isFav ? 'heart' : 'heartOutline'}
                size={22}
                color={isFav ? colors.accent : colors.text}
              />
            }
            onPress={() => {
              toggleFavorite(track.id);
              close();
            }}
          />
          <SheetItem
            label={`Go to album`}
            icon={<Icon name="album" size={22} />}
            onPress={() => {
              close();
              nav.push({ kind: 'album', id: albumIdOf(track) });
            }}
          />
          <SheetItem
            label={`More from ${artistOf(track)}`}
            icon={<Icon name="person" size={22} />}
            onPress={() => {
              close();
              nav.push({ kind: 'artist', id: artistIdOf(track) });
            }}
          />
          <SheetItem
            label="Edit song info"
            icon={<Icon name="edit" size={22} />}
            onPress={() => {
              close();
              patch({ editTrackSheet: track });
            }}
          />
          {menu?.playlistId ? (
            <SheetItem
              label="Remove from this playlist"
              danger
              icon={<Icon name="delete" size={22} color={colors.danger} />}
              onPress={() => {
                removeFromPlaylist(menu.playlistId!, track.id);
                close();
              }}
            />
          ) : null}
        </>
      ) : null}
    </Sheet>
  );
}



function PlaylistPickerSheet() {
  const colors = useColors();
  const picker = useUiStore(s => s.playlistPicker);
  const patch = useUiStore(s => s.patch);
  const openNamePrompt = useUiStore(s => s.openNamePrompt);
  const playlists = useUserStore(s => s.playlists);
  const addToPlaylist = useUserStore(s => s.addToPlaylist);
  const createPlaylist = useUserStore(s => s.createPlaylist);

  const close = () => patch({ playlistPicker: null });

  return (
    <Sheet visible={!!picker} title="Add to playlist" onClose={close}>
      <SheetItem
        label="New playlist"
        icon={<Icon name="add" size={22} color={colors.accent} />}
        onPress={() => {
          const ids = picker?.trackIds ?? [];
          close();
          openNamePrompt({
            title: 'New playlist',
            initial: '',
            confirmLabel: 'Create',
            onSubmit: name => {
              createPlaylist(name, ids);
              toast('Playlist created');
            },
          });
        }}
      />
      {playlists.map(p => (
        <SheetItem
          key={p.id}
          label={`${p.name}  ·  ${pluralize(p.trackIds.length, 'song')}`}
          icon={<Icon name="queue" size={22} />}
          onPress={() => {
            const added = addToPlaylist(p.id, picker?.trackIds ?? []);
            toast(added > 0 ? `Added to ${p.name}` : 'Already in playlist');
            close();
          }}
        />
      ))}
    </Sheet>
  );
}

function NamePromptModal() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const prompt = useUiStore(s => s.namePrompt);
  const patch = useUiStore(s => s.patch);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (prompt) {
      setValue(prompt.initial);
    }
  }, [prompt]);

  const close = () => patch({ namePrompt: null });
  const submit = () => {
    if (!prompt) {
      return;
    }
    const name = value.trim();
    if (!name) {
      return;
    }
    close();
    prompt.onSubmit(name);
  };

  return (
    <Modal
      visible={!!prompt}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={close}>
      <View style={styles.dialogRoot}>
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>{prompt?.title}</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            autoFocus
            placeholder="Playlist name"
            placeholderTextColor={colors.textDim}
            style={styles.input}
            onSubmitEditing={submit}
            returnKeyType="done"
            maxLength={60}
          />
          <View style={styles.dialogButtons}>
            <Pressable onPress={close} style={styles.dialogBtn}>
              <Text style={styles.dialogBtnText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={submit} style={styles.dialogBtn}>
              <Text style={[styles.dialogBtnText, { color: colors.accent }]}>
                {prompt?.confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}


function EditTrackSheet() {
  const track = useUiStore(s => s.editTrackSheet);
  const patch = useUiStore(s => s.patch);
  const override = useUserStore(s =>
    track ? s.trackOverrides[track.id] : undefined,
  );
  const setTrackOverride = useUserStore(s => s.setTrackOverride);
  const clearTrackOverride = useUserStore(s => s.clearTrackOverride);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');

  useEffect(() => {
    if (track) {
      setTitle(override?.title ?? track.title);
      setArtist(override?.artist ?? artistOf(track));
      setAlbum(override?.album ?? track.album ?? '');
    }
  }, [track, override]);

  const close = () => patch({ editTrackSheet: null });

  const save = () => {
    if (!track) {
      return;
    }
    setTrackOverride(track.id, {
      title: title.trim(),
      artist: artist.trim(),
      album: album.trim(),
    });
    toast('Saved');
    close();
  };

  const reset = () => {
    if (track) {
      clearTrackOverride(track.id);
    }
    close();
  };

  return (
    <Modal
      visible={!!track}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={close}>
      <View style={styles.dialogRoot}>
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>Edit song info</Text>
          <Text style={styles.dialogHint}>
            Changes only apply inside the app — the actual file is not
            modified.
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={colors.textDim}
            style={styles.input}
            maxLength={200}
          />
          <TextInput
            value={artist}
            onChangeText={setArtist}
            placeholder="Artist"
            placeholderTextColor={colors.textDim}
            style={[styles.input, styles.inputGap]}
            maxLength={200}
          />
          <TextInput
            value={album}
            onChangeText={setAlbum}
            placeholder="Album"
            placeholderTextColor={colors.textDim}
            style={[styles.input, styles.inputGap]}
            maxLength={200}
          />
          <View style={styles.dialogButtons}>
            {override ? (
              <Pressable onPress={reset} style={styles.dialogBtn}>
                <Text style={[styles.dialogBtnText, { color: colors.danger }]}>
                  Reset
                </Text>
              </Pressable>
            ) : null}
            <View style={{ flex: 1 }} />
            <Pressable onPress={close} style={styles.dialogBtn}>
              <Text style={styles.dialogBtnText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={save} style={styles.dialogBtn}>
              <Text style={[styles.dialogBtnText, { color: colors.accent }]}>
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
function LyricsSheet() {
  const visible = useUiStore(s => s.lyricsSheet);
  const patch = useUiStore(s => s.patch);
  const activeId = useActiveTrackId();
  const trackMap = useLibraryStore(s => s.trackMap);
  const { position } = useProgress(0.5);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [lyrics, setLyrics] = useState<ParsedLyrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  const track = activeId ? trackMap[activeId] : undefined;

  useEffect(() => {
    if (!visible || !track) {
      return;
    }
    if (loadedFor === track.id) {
      return;
    }
    setLoading(true);
    loadLyrics(track.url)
      .then(result => {
        setLyrics(result);
        setLoadedFor(track.id);
      })
      .finally(() => setLoading(false));
  }, [visible, track, loadedFor]);

  const activeIndex = lyrics ? activeLyricIndex(lyrics.lines, position) : -1;

  return (
    <Sheet
      visible={visible}
      tall
      title={track?.title ?? 'Lyrics'}
      onClose={() => patch({ lyricsSheet: false })}>
      {loading ? (
        <Text style={styles.lyricsMuted}>Looking for lyrics…</Text>
      ) : !track ? (
        <Text style={styles.lyricsMuted}>Nothing playing</Text>
      ) : !lyrics ? (
        <Text style={styles.lyricsMuted}>
          No lyrics found. Place a matching .lrc file next to this song (same
          name, same folder) to see synced lyrics here. On Android 11+,
          scoped storage can block reading files outside the music library
          scan — if a .lrc file exists but doesn't show up, that's likely why.
        </Text>
      ) : (
        <View>
          {lyrics.lines.map((line, i) => (
            <Text
              key={i}
              style={[
                styles.lyricLine,
                i === activeIndex && { color: colors.accent, fontWeight: '800' },
              ]}>
              {line.text}
            </Text>
          ))}
        </View>
      )}
    </Sheet>
  );
}

const SLEEP_MINUTES = [5, 10, 15, 30, 45, 60];

function SleepSheet() {
  const colors = useColors();
  const visible = useUiStore(s => s.sleepSheet);
  const patch = useUiStore(s => s.patch);
  const timer = useSleepTimer();
  const close = () => patch({ sleepSheet: false });

  return (
    <Sheet visible={visible} title="Sleep timer" onClose={close}>
      {SLEEP_MINUTES.map(m => (
        <SheetItem
          key={m}
          label={`${m} minutes`}
          icon={<Icon name="timer" size={22} />}
          onPress={() => {
            sleepInMinutes(m);
            close();
          }}
        />
      ))}
      <SheetItem
        label="End of this song"
        icon={<Icon name="timer" size={22} />}
        onPress={() => {
          sleepAfterThisSong();
          close();
        }}
      />
      {timer ? (
        <SheetItem
          label="Turn off timer"
          danger
          icon={<Icon name="close" size={22} color={colors.danger} />}
          onPress={() => {
            cancelSleep();
            close();
          }}
        />
      ) : null}
    </Sheet>
  );
}


const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function SpeedSheet() {
  const colors = useColors();
  const visible = useUiStore(s => s.speedSheet);
  const patch = useUiStore(s => s.patch);
  const speed = usePlayerStore(s => s.speed);
  const close = () => patch({ speedSheet: false });

  return (
    <Sheet visible={visible} title="Playback speed" onClose={close}>
      {SPEEDS.map(v => (
        <SheetItem
          key={v}
          label={v === 1 ? 'Normal (1x)' : `${v}x`}
          selected={v === speed}
          icon={
            v === speed ? (
              <Icon name="check" size={22} color={colors.accent} />
            ) : null
          }
          onPress={() => {
            setSpeed(v);
            close();
          }}
        />
      ))}
    </Sheet>
  );
}

const SORTS: { key: SongSort; label: string }[] = [
  { key: 'title', label: 'Title (A–Z)' },
  { key: 'artist', label: 'Artist' },
  { key: 'album', label: 'Album' },
  { key: 'added', label: 'Recently added' },
];

function SortSheet() {
  const colors = useColors();
  const visible = useUiStore(s => s.sortSheet);
  const patch = useUiStore(s => s.patch);
  const sort = useUserStore(s => s.songSort);
  const setSongSort = useUserStore(s => s.setSongSort);
  const close = () => patch({ sortSheet: false });

  return (
    <Sheet visible={visible} title="Sort songs by" onClose={close}>
      {SORTS.map(s => (
        <SheetItem
          key={s.key}
          label={s.label}
          selected={s.key === sort}
          icon={
            s.key === sort ? (
              <Icon name="check" size={22} color={colors.accent} />
            ) : null
          }
          onPress={() => {
            setSongSort(s.key);
            close();
          }}
        />
      ))}
    </Sheet>
  );
}



function QueueSheet() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const visible = useUiStore(s => s.queueSheet);
  const patch = useUiStore(s => s.patch);
  const { queue, activeIndex } = useQueue();
  const trackMap = useLibraryStore(s => s.trackMap);

  return (
    <Sheet
      visible={visible}
      tall
      scroll={false}
      title={`Queue · ${pluralize(queue.length, 'song')}`}
      onClose={() => patch({ queueSheet: false })}>
      <FlatList
        data={queue}
        keyExtractor={(item, i) => `${item.mediaId ?? 'q'}-${i}`}
        extraData={activeIndex}
        initialScrollIndex={
          activeIndex != null && activeIndex > 3 && activeIndex < queue.length
            ? activeIndex - 2
            : undefined
        }
        getItemLayout={(_, index) => ({ length: 60, offset: 60 * index, index })}
        ListEmptyComponent={
          <Text style={styles.emptyQueue}>Queue is empty</Text>
        }
        renderItem={({ item, index }) => {
          const track = item.mediaId ? trackMap[item.mediaId] : undefined;
          const art =
            track?.artwork ??
            (typeof item.artworkUrl === 'string' ? item.artworkUrl : null);
          const active = index === activeIndex;
          return (
            <Pressable
              onPress={() => TrackPlayer.skipToIndex(index)}
              android_ripple={{ color: colors.surfaceHigh }}
              style={styles.queueRow}>
              <Artwork uri={art} size={40} radius={6} />
              <View style={styles.queueTexts}>
                <Text
                  numberOfLines={1}
                  style={[styles.queueTitle, active && { color: colors.accent }]}>
                  {item.title ?? 'Unknown'}
                </Text>
                <Text numberOfLines={1} style={styles.queueArtist}>
                  {item.artist ?? ''}
                </Text>
              </View>
              {!active ? (
                <Pressable
                  hitSlop={10}
                  onPress={() => TrackPlayer.removeMediaItem(index)}
                  style={styles.queueRemove}>
                  <Icon name="close" size={20} color={colors.textDim} />
                </Pressable>
              ) : (
                <View style={styles.queueRemove}>
                  <Icon name="play" size={20} color={colors.accent} />
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </Sheet>
  );
}

export function confirmDelete(title: string, message: string, onConfirm: () => void) {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  dialogRoot: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: 28,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  dialogTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  dialogHint: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 14,
    lineHeight: 17,
  },
  input: {
    color: colors.text,
    fontSize: 16,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputGap: { marginTop: 10 },
  dialogButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  dialogBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  dialogBtnText: { color: colors.textDim, fontSize: 15, fontWeight: '700' },
  lyricsMuted: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 21,
    padding: 20,
  },
  lyricLine: {
    color: colors.textDim,
    fontSize: 17,
    lineHeight: 30,
    fontWeight: '600',
    paddingHorizontal: 20,
  },
  emptyQueue: { color: colors.textDim, textAlign: 'center', padding: 30 },
  queueRow: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  queueTexts: { flex: 1, marginLeft: 12 },
  queueTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  queueArtist: { color: colors.textDim, fontSize: 12, marginTop: 1 },
  queueRemove: { padding: 8 },
});
