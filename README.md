# 🎵 Vinyl Wave — Music Player

A retro-styled web music player with a spinning vinyl visual, playlist management, and a disco lighting mode.

## Features

- **Vinyl Animation** — Spinning record rotates while music plays, pauses when paused.
- **Playlist Management** — Add, remove, reorder, and clear tracks. Tracks persist until the page is refreshed.
- **Two Built-in Tracks** — Pre-loaded presets (song1.mp3, song2.mp3) ready to play.
- **Upload Custom Audio** — Drag-and-drop or browse to add your own MP3, WAV, FLAC, or other audio files.
- **Seek & Volume Controls** — Sliders for seeking through a track and adjusting volume.
- **Mute Toggle** — One-click mute with volume memory.
- **Dark / Light Mode** — Toggle between a dark theme (default) and a light theme.
- **Disco Mode** 🪩 — Rotating coloured beams sweep across the screen while music plays. Automatically deactivates when playback stops.
- **Keyboard Shortcuts** — Full keyboard control (see below).
- **Responsive Design** — Works on desktop and mobile browsers.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `→` | Seek forward 5 seconds |
| `←` | Seek backward 5 seconds |
| `↑` | Volume up |
| `↓` | Volume down |
| `M` | Mute / Unmute |
| `N` | Next track |
| `P` | Previous track |
| `D` | Toggle Disco mode |

## How to Use

1. **Open** `index.html` in any modern browser — no build tools or server required.
2. **Click** *Song 1* or *Song 2* to play the built-in tracks.
3. **Upload** your own files with the *Upload Tracks* button.
4. **Click** any track in the playlist to jump to it.
5. **Control** playback with the on-screen buttons or keyboard shortcuts.

## File Structure

```
├── index.html        # Main HTML page
├── styles.css        # All styling (brutalist / retro design)
├── script.js         # Application logic (vanilla JS)
├── favicon.ico       # SVG-based favicon
├── song1.mp3         # Built-in track 1
├── song2.mp3         # Built-in track 2
└── README.md         # This file
```

## Tech Stack

- **HTML5** — Semantic structure
- **CSS3** — Custom properties, flexbox, animations, conic gradients, responsive media queries
- **Vanilla JavaScript** — No frameworks or libraries
- **Web Audio API** — Browser-native `<audio>` element with blob URLs for uploaded files

## Design

The UI follows a **cartoon brutalist** aesthetic:
- Bold black outlines (`4px solid #000`)
- Chunky drop shadows (`8px 8px 0px #000`)
- Flat solid colours
- Expressive, chunky typography
- Zero gradients on UI elements (except the vinyl record and disco beams)

## To run 
open /Users/anshuverma/Documents/CodeAlpha/Music\ Player/index.html