# TaskFlow — Modern Todo App

A fast, feature-rich todo application built with **React + TypeScript + Vite**, featuring P2P sync, PWA support, offline usage, and much more.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📱 **PWA** | Install as a native app, works fully offline |
| 🔄 **P2P Sync (WebRTC)** | Sync tasks directly between devices with no server |
| 🔗 **Share via Link / QR** | Share any task with a shareable URL or QR code |
| 😊 **Emoji Suggestions** | Insert emojis into task names with one click |
| 🔊 **Read Aloud (TTS)** | Have tasks read out loud via Web Speech API |
| 📤 **Import / Export** | Export tasks as JSON or CSV; import from JSON |
| 🎨 **6 Color Themes** | Violet, Ocean, Sunset, Forest, Rose, Midnight |
| 🌙 **Dark / Light Mode** | Full dark and light mode support |
| 🆕 **Update Prompt** | Custom PWA update notification banner |
| 💥 **Splash Screen** | Animated branded launch screen |
| 📌 **Pin Tasks** | Pin important tasks to the top |
| 🗂️ **Categories** | Organize tasks with colored emoji categories |
| 🔍 **Search + Sort** | Real-time search + sort by date/deadline/priority/name |
| 🗑️ **Purge Tasks** | Bulk-delete all tasks from settings |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

### Run Tests

```bash
npm test
```

---

## 🏗️ Tech Stack

- **React 18** + **TypeScript**
- **Vite 5** — lightning-fast dev server and bundler
- **Vitest** — unit testing
- **Material UI (MUI v5)** — component library
- **Zustand** — state management with `localStorage` persistence
- **vite-plugin-pwa** — PWA + service worker generation
- **WebRTC** — peer-to-peer task sync (no server required)
- **Web Speech API** — text-to-speech task reading
- **QRCode.react** — QR code generation for sharing
- **uuid** — unique task IDs

---

## 📁 Project Structure

```
src/
├── __tests__/         # Vitest unit tests
├── components/
│   ├── SplashScreen.tsx      # Animated splash screen
│   ├── AddTaskDialog.tsx     # Create / edit task modal
│   ├── TaskCard.tsx          # Individual task card with actions
│   ├── ShareDialog.tsx       # QR code + link sharing
│   ├── SettingsDrawer.tsx    # Theme, import/export, P2P sync
│   ├── CategoriesDialog.tsx  # Category management
│   └── UpdatePrompt.tsx      # PWA update banner
├── hooks/
│   ├── useWebRTC.ts          # WebRTC P2P sync logic
│   └── useTextToSpeech.ts    # TTS hook
├── store/
│   └── index.ts              # Zustand store (persisted)
├── types/
│   └── index.ts              # TypeScript interfaces
├── utils/
│   ├── themes.ts             # Theme definitions + color palettes
│   └── taskUtils.ts          # Share links, import/export helpers
├── App.tsx                   # Main app shell
├── main.tsx                  # React entry point
└── vite-env.d.ts             # Vite + PWA type declarations
```

---

## 🔗 P2P Sync (WebRTC) — How It Works

TaskFlow uses WebRTC DataChannels for direct device-to-device sync with **no server required**.

1. **Host** opens Settings → clicks "Start Sync (Host)"
2. An **offer code** is generated — copy and send to peer
3. **Peer** opens Settings → clicks "Join Sync (Peer)" → pastes offer → generates **answer code**
4. **Host** pastes the answer code → devices connect
5. Tasks sync automatically over the encrypted P2P channel

> Uses Google's public STUN server for NAT traversal.

---

## 📲 PWA Installation

After building and serving, visit the app in Chrome/Edge/Safari and click "Install" in the address bar (or "Add to Home Screen" on mobile). The app will work fully offline using the cached service worker.

---

## 🔗 Task Sharing

Each task can be shared via:
- **Copy Link** — generates a URL with the task encoded in the query string
- **QR Code** — scan with any device to import the task

When a recipient opens the link, a banner appears offering to import the shared task.

---

## 🎨 Themes

| Name | Accent | Vibe |
|---|---|---|
| Violet | `#7C3AED` | Default dark purple |
| Ocean | `#0EA5E9` | Cool blue |
| Sunset | `#F97316` | Warm orange |
| Forest | `#10B981` | Natural green |
| Rose | `#F43F5E` | Bold pink-red |
| Midnight | `#6366F1` | Deep indigo |

Each theme has both dark and light variants.

---

## 📝 License

MIT
