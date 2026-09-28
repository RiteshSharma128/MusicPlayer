# 🎵 Music Player

An offline-first music player built with **React Native 0.86** (New Architecture). Scans and plays music straight from your phone's local storage — no internet required for local playback — plus a bunch of extras: online preview search, themes, lyrics, Android Auto, and more.

> Built as a learning/portfolio project. Not published to the Play Store.

---

## ✨ Features

### Local playback
- Full device music library scan (MediaStore) — Songs, Albums, Artists, Library tabs + search
- Play, pause, next, previous, seek, shuffle, repeat (off/all/one), playback speed (0.5x–2x)
- Crossfade between tracks (toggle + duration, in Settings)
- Gapless queue playback
- Sleep timer (fixed minutes or "end of this song", with fade-out)
- Stylized waveform seek bar
- Synced lyrics via matching `.lrc` files placed next to a song
- In-app song info editing (title / artist / album — doesn't touch the actual file)
- Background playback: notification, lock-screen, and Bluetooth controls
- Session restore after an app restart
- Android Auto / CarPlay browsable tree (Albums, Artists, Playlists, Favorites)

### Library management
- Favorites, Recently Played, Recently Added, and a Folders browser
- Custom playlists (create / rename / delete / add / remove songs)
- Multi-select mode (long-press a song) for bulk actions
- Backup & restore playlists + favorites via a share-sheet JSON snippet

### Online
- **Online** tab: search and stream free 30-second previews via the public iTunes Search API (no signup, no API key)
- ⚠️ Preview-only by design — there is no free, legal way to stream full commercial tracks; that requires a licensed provider (Spotify/JioSaavn/etc.) and a paid API key

### Appearance
- Dark / Light mode with 5 selectable accent colors, persisted across launches

### Sound (beta, device-dependent)
- Bass boost & equalizer presets — attaches to Android's system-wide audio session since the playback engine doesn't expose its exact session id, so results vary by device

---

## 📱 Screenshots

_Add a few screenshots here before publishing — drag images into this section on GitHub, e.g.:_

| Now Playing | Library | Online Search |
|---|---|---|
| _screenshot_ | _screenshot_ | _screenshot_ |<img width="258" height="472" alt="Screenshot 2026-09-28 224046" src="https://github.com/user-attachments/assets/66b69155-0a75-4085-a72d-6c43338674c1" />


---

## 🛠 Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native 0.86 (CLI, New Architecture) + TypeScript |
| Playback | [`@rntp/player`](https://rntp.dev) — background audio engine, Android Auto/CarPlay support |
| Library scan | [`@nodefinity/react-native-music-library`](https://www.npmjs.com/package/@nodefinity/react-native-music-library) |
| State | [`zustand`](https://github.com/pmndrs/zustand) + `persist` middleware |
| Local storage | `@react-native-async-storage/async-storage` |
| Icons | `react-native-svg` (custom icon set) |
| Online search | Public [iTunes Search API](https://performance-partners.apple.com/search-api) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- JDK 17
- Android Studio (SDK + platform tools), or a physical Android device with USB debugging
- (iOS) Xcode + CocoaPods, on macOS

### Setup

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd MusicPlayer
npm install
```

**Android:**
```bash
npx react-native run-android
```

**iOS:**
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

First launch asks for audio-file permission — allow it and the library scans automatically.

### Metro (if you need it in a separate terminal)
```bash
npx react-native start
```

### Release build
```bash
cd android
./gradlew assembleRelease
# output: android/app/build/outputs/apk/release/app-release.apk
```

---

## ⚠️ Known Limitations

- **Equalizer / bass boost** — attaches to Android's global audio session (the playback engine doesn't expose its own session id to JS), so it works on many phones but isn't guaranteed on every device/Android version.
- **Home-screen widget** — ships as a basic play/pause/next/previous widget; not extensively tested across launchers.
- **`.lrc` lyrics on Android 11+** — scoped storage can block reading a `.lrc` file that sits outside the music scan; if lyrics don't show up even though the file exists, that's usually why.
- **Online tab** — 30-second previews only (see [Online](#online) above). Not a bug.
- **[`@rntp/player`](https://rntp.dev/pricing)** — free for personal/hobby use as configured here; commercial use requires its own license from Double Symmetry GmbH.

---

## 🤝 Contributing

This started as a personal project, but issues and PRs are welcome — especially around the equalizer/widget limitations above.

## 📄 License

No license has been added yet. Until one is, all rights are reserved by default. If you want others to freely use/modify this, consider adding an [MIT License](https://choosealicense.com/licenses/mit/) (`LICENSE` file at the repo root).
