<img width="258" height="472" alt="Screenshot 2026-09-28 224046" src="https://github.com/user-attachments/assets/041f902c-d661-437b-b4eb-09ac605fa781" />
<img width="229" height="464" alt="Screenshot 2026-09-28 224059" src="https://github.com/user-attachments/assets/4edb2055-f801-4f40-bf03-ea456929caa4" />
<img width="238" height="508" alt="Screenshot 2026-09-28 224121" src="https://github.com/user-attachments/assets/a6287a55-6c47-4cea-97d4-9bde06f02326" />
<img width="244" height="465" alt="Screenshot 2026-09-28 224138" src="https://github.com/user-attachments/assets/369cca38-f866-4b32-a485-61e1bdb4fd5a" />
<img width="238" height="476" alt="Screenshot 2026-09-28 224200" src="https://github.com/user-attachments/assets/abc13be1-1750-4bfc-87fa-2d72631ef3ca" />
<img width="245" height="470" alt="Screenshot 2026-09-28 224223" src="https://github.com/user-attachments/assets/8e53f8a6-be38-4ed4-a818-75ee27934a2d" />
<img width="250" height="505" alt="Screenshot 2026-09-28 224234" src="https://github.com/user-attachments/assets/05c99af2-83e7-45ba-b20b-1e3973ebc3b7" />
<img width="251" height="499" alt="Screenshot 2026-09-28 224252" src="https://github.com/user-attachments/assets/a7ce11b4-592a-4128-9cc6-004b4d02b665" />
<img width="251" height="455" alt="Screenshot 2026-09-28 224307" src="https://github.com/user-attachments/assets/2f41dfaa-db2e-4f83-9603-c76c559f83ec" />
<img width="235" height="469" alt="Screenshot 2026-09-28 224318" src="https://github.com/user-attachments/assets/559c596e-bd05-4523-8faa-9867b3f4423a" />
<img width="232" height="472" alt="Screenshot 2026-09-28 224413" src="https://github.com/user-attachments/assets/a412f14c-93f9-49a7-b249-aedeafda2936" />
<img width="239" height="483" alt="Screenshot 2026-09-28 224427" src="https://github.com/user-attachments/assets/3d19f667-764f-4145-b587-e6cadafe9266" />
<img width="242" height="469" alt="Screenshot 2026-09-28 224451" src="https://github.com/user-attachments/assets/83177af3-fea0-4c85-bce4-656547c0deb4" />


# Music Player (React Native CLI 0.86)

Offline-first music player — phone ke local storage se scan karke gaane
play karta hai. Ab isme online preview streaming (free API), theming,
multi-select, folders, backup/restore, lyrics, Android Auto aur bahut
kuch bhi add ho chuka hai.

## Features

**Local playback**
- Device ka poora music library scan (MediaStore)
- Songs / Albums / Artists / Library / Online tabs + full search
- Play, pause, next, prev, seek, shuffle, repeat, speed control (0.5x–2x)
- Crossfade (fade-out/fade-in between tracks — toggle + duration in Settings)
- Gapless queue playback (default engine behavior, nothing to switch on)
- Sleep timer (fixed minutes or "end of this song", with fade-out)
- Waveform-style seek bar (stylized, deterministic per song)
- Synced lyrics via matching `.lrc` files next to a song
- In-app song info editing (title/artist/album — doesn't touch the file)
- Background playback: notification, lock-screen, Bluetooth controls
- Session restore after app restart
- Android Auto / CarPlay browse tree (Albums, Artists, Playlists, Favorites)

**Library management**
- Favorites, recently played, recently added, folders view
- Custom playlists (create/rename/delete/add/remove)
- Multi-select mode (long-press a song) with bulk add-to-queue /
  add-to-playlist / favorite
- Backup & restore playlists+favorites via a share-sheet JSON snippet
  (merges on restore, never deletes existing data)

**Online**
- "Online" tab: search and stream free 30-second previews via the public
  iTunes Search API (no signup, no API key). Not full-length streaming —
  that needs a licensed music service.

**Appearance**
- Dark/Light mode + 5 accent colors, persisted

## Known limitations (by design, not bugs)
- **Equalizer / bass boost**: not included. A real parametric EQ needs a
  dedicated native Android audio-effects module wired to the player's
  audio session — that's a separate native build/test step this drop
  doesn't cover. The Settings screen explains this.
- **Home-screen widget**: not included, for the same reason (needs native
  Kotlin + a way to bind into RNTP's MediaSession that can't be verified
  without a real device build).
- **`.lrc` lyrics on Android 11+**: scoped storage can block raw
  filesystem reads outside the music scan; if a `.lrc` file exists next
  to a song but doesn't load, that's the likely cause.
- **`@rntp/player`**: commercial use requires its own license — see
  https://rntp.dev/pricing. Fine for personal/hobby use as shipped here.

## Tech stack
- React Native **0.86.3** (CLI, New Architecture enabled), TypeScript
- `@rntp/player` — background audio + Android Auto/CarPlay browse tree
- `@nodefinity/react-native-music-library` — device audio scan
- `react-native-fs` — reading `.lrc` lyric files
- `zustand` (+ `persist`) — state management & local storage
- `react-native-svg` — icons

## Setup

Prerequisites: Node.js 20+, JDK 17, Android Studio (SDK + platform tools).

```bash
cd MusicPlayer
npm install
npx react-native run-android
```

First launch will prompt for audio permission — allow it and the library
scans automatically.

### Metro in a separate terminal (if needed)
```bash
npx react-native start
```

### Release APK
```bash
cd android
./gradlew assembleRelease
# output: android/app/build/outputs/apk/release/app-release.apk
```

## iOS
Native config (manifest permissions, foreground service, automotive
descriptor) is Android-only in this build. For iOS:
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```
You'll additionally need to add a music-library usage string and
background-audio mode to `Info.plist`.

## Project structure
```
App.tsx                       – root: permission gate → library load → Navigator
index.js                      – entry point + TrackPlayer background service registration
src/PlaybackService.ts        – headless task: notification/lock-screen button handlers
src/services/
  library.ts                  – permissions + MediaStore scan
  player.ts                   – playback actions (play, queue, shuffle, sleep timer, crossfade…)
  onlineMusic.ts               – iTunes Search API client
  lyrics.ts                   – .lrc parsing
  androidAuto.ts              – browse-tree builder for Android Auto/CarPlay
  backup.ts                   – export/import JSON for playlists & favorites
  hooks.ts                    – small hooks (active track, live queue, crossfade watcher, browse-tree sync…)
src/store/                    – zustand stores: library, user data, theme, settings, selection, player UI, sheets
src/screens/                  – Songs, Albums, Artists, Library, Online, Folders, Search, Settings, Now Playing…
src/components/               – TrackRow, TrackList, MiniPlayer, TabBar, Sheet(s), Icon, Waveform, SelectionBar…
src/navigation/                – tiny custom stack (no external nav library)
src/utils/                    – sorting/grouping/formatting helpers
```

## Notes
- Ringtones, notification sounds, call recordings and clips under 30s are
  filtered out of the scanned library automatically (`utils/library.ts`
  → `isMusic`).
- If a file is deleted/moved, the player skips it instead of crashing.
- Tag edits (title/artist/album) are stored locally and shown everywhere
  in the app (list rows, notification, Now Playing) — the actual file is
  never modified.
