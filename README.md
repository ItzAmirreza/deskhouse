# Deskhouse

An unofficial Clubhouse desktop client built with [Tauri](https://tauri.app/) (Rust + React). This is a **hobby project** — not affiliated with or endorsed by Clubhouse/Alpha Exploration Co.

> **Disclaimer:** This is an experimental project for personal use. Features may break at any time. Use at your own risk.

## What Should Work

- **Login** — Phone number + password authentication
- **Persistent sessions** — Stay logged in between app restarts
- **Feed / Hallway** — Browse active rooms with speaker info, listener counts, and club badges
- **Join rooms & listen** — Live audio via Agora (listen-only)
- **Speaking indicators** — Visual indicator around speakers who are actively talking
- **Persistent room connection** — Navigate the app without leaving the room; mini "Now Playing" bar at the bottom
- **Room chat & reactions** — View chat messages and send emoji reactions
- **User profiles** — View profiles, bio, social links, follower counts
- **Follow users**
- **Search** — Find users and clubs
- **Explore** — Discovery feed
- **Club / House pages** — View club details and member counts
- **Settings** — View account info

## What Doesn't Work (Yet)

- Speaking (listen-only for now)
- Creating rooms
- DMs / Conversations
- Notifications
- Editing profile
- Room moderation (hand-raise, invite-to-speak)
- Sending chat messages

## Tech Stack

- **Tauri v2** — Desktop app framework
- **Rust** — Backend API client
- **React 19 + TypeScript** — Frontend
- **Zustand** — State management
- **Agora Web SDK** — Real-time audio
- **Vite + Bun** — Build tooling

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Bun](https://bun.sh/) (or npm/pnpm)
- A Clubhouse account

### Setup

```bash
git clone https://github.com/youruser/deskhouse.git
cd deskhouse
bun install
bun run tauri dev
```

First build takes ~3 minutes (compiling Rust crates). Subsequent builds are fast.

### Building

```bash
bun run tauri build
```

Produces platform-specific builds in `src-tauri/target/release/bundle/`.

## Contributing

Hobby project — contributions welcome. Areas that need work:

- [ ] Speaking capability
- [ ] Real-time updates (PubNub) instead of polling
- [ ] DM / conversation UI
- [ ] Room creation
- [ ] Profile editing
- [ ] Better error handling
- [ ] Tests

## License

MIT
