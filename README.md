# Deskhouse

An unofficial Clubhouse desktop client built with [Tauri](https://tauri.app/) (Rust + React). This is a **hobby project** for educational and reverse-engineering purposes. It is not affiliated with or endorsed by Clubhouse/Alpha Exploration Co.

> **Disclaimer:** This project exists purely for learning. Most features are experimental and may break at any time if Clubhouse changes their API. Use at your own risk and respect Clubhouse's Terms of Service.

## What This Is

Deskhouse is a desktop app (Windows, macOS, Linux) that connects to Clubhouse's API to let you browse rooms, listen to live audio, and interact — all from your computer. The API was reverse-engineered by intercepting traffic from the official iOS app using mitmproxy.

## What Should Work

- **Login** — Phone number + password authentication (same flow as the official app)
- **Persistent sessions** — Your login is saved locally so you don't have to re-authenticate every time
- **Feed / Hallway** — Browse currently active rooms with speaker info, listener counts, and club badges
- **Join rooms & listen** — Join any room and hear live audio via Agora (listen-only, as audience)
- **Speaking indicators** — Green glowing ring around speakers who are actively talking
- **Persistent room connection** — Navigate anywhere in the app without leaving the room. A mini "Now Playing" bar stays at the bottom showing what you're listening to
- **Room chat** — See chat messages and reactions in real-time (read-only)
- **Reactions** — Send emoji reactions in rooms
- **User profiles** — View any user's profile, bio, social links, follower counts, karma
- **Follow users** — Follow people from their profile page
- **Search** — Search for users and clubs
- **Explore** — Browse the discovery feed
- **Club / House pages** — View club details, description, member counts
- **Settings** — View account info and notification preferences

## What Doesn't Work (Yet)

- **Speaking** — You can only listen, not speak (we join as audience via Agora)
- **Creating rooms** — No room creation flow
- **DMs / Conversations** — The API endpoints are captured but not implemented in the UI
- **Push notifications** — No real-time notifications (badge polling only)
- **Editing profile** — Profile is read-only
- **Room moderation** — No hand-raise, invite-to-speak, or moderation controls
- **Sending chat messages** — Chat is read-only (send endpoint wasn't captured)
- **Audio might not work** — Agora connection depends on a valid token and correct UID. If Clubhouse changes their Agora setup, audio will break

## Architecture

```
deskhouse/
├── src-tauri/           # Rust backend (Tauri v2)
│   └── src/
│       ├── api/         # Clubhouse API client
│       │   ├── client.rs    # HTTP client with auto-injected headers
│       │   ├── models.rs    # All request/response types
│       │   ├── auth.rs      # Login, logout, me
│       │   ├── feed.rs      # Feed, discovery
│       │   ├── channel.rs   # Join/leave rooms, messages, reactions
│       │   ├── profile.rs   # Profiles, search, follow, suggested follows
│       │   ├── social.rs    # Social clubs
│       │   ├── settings.rs  # User badges, settings
│       │   └── error.rs     # Error types
│       ├── commands/    # Tauri command layer (IPC bridge)
│       └── state.rs     # App state with credential persistence
├── src/                 # React frontend
│   ├── lib/
│   │   ├── api.ts       # Tauri invoke wrappers
│   │   ├── types.ts     # TypeScript types matching Rust models
│   │   └── agora.ts     # Agora Web SDK integration
│   ├── stores/
│   │   ├── auth.ts      # Auth state (zustand)
│   │   └── room.ts      # Room connection state (zustand)
│   ├── pages/           # Login, Feed, Room, Profile, Search, Explore, Club, Settings
│   └── components/      # Layout, RoomCard, UserAvatar, MessageBubble
└── src/styles/
    └── global.css       # Dark theme with CSS variables
```

### Key Design Decisions

- **All API calls go through Rust** — The React frontend never makes HTTP requests directly. Everything goes through Tauri's IPC (`invoke`) to the Rust backend, which handles auth headers, token management, and credential persistence.
- **Agora runs in the webview** — Audio is handled by the Agora Web SDK in the frontend, not in Rust. The join_channel API returns an Agora token that's passed directly to the SDK.
- **Room state is global** — The room connection (Agora audio, polling, active ping) lives in a zustand store, not in the RoomPage component. This allows navigating the app without disconnecting.
- **Credentials stored locally** — Auth token, user ID, and device ID are saved to `%LOCALAPPDATA%/deskhouse/credentials.json` (Windows) or equivalent on other platforms.

## Tech Stack

- **Tauri v2** — Desktop app framework (Rust backend + web frontend)
- **Rust** — API client, credential management, command layer
- **React 19** — Frontend UI
- **TypeScript** — Type-safe frontend
- **Zustand** — Lightweight state management
- **Agora Web SDK** — Real-time audio
- **Vite** — Frontend build tool
- **Bun** — Package manager and script runner

## Clubhouse API Details

All endpoints hit `https://www.clubhouseapi.com/api/`. The client spoofs the iOS app headers:

```
User-Agent: clubhouse/4321 (iPhone; iOS 26.2; Scale/3.00)
CH-AppBuild: 4321
CH-AppVersion: 26.03.05
CH-AppId: clubhouse
Authorization: Token <auth_token>
CH-UserID: <user_id>
CH-DeviceId: <uuid>
```

### Implemented Endpoints (21)

| Endpoint | Purpose |
|----------|---------|
| `POST /api/start_phone_number_auth` | Start login flow |
| `POST /api/complete_password_auth` | Complete login with password |
| `POST /api/me` | Get current user profile |
| `POST /api/logout` | Logout |
| `POST /api/get_feed_v3` | Main hallway feed |
| `POST /api/get_discovery_feed` | Explore/discover content |
| `POST /api/join_channel` | Join a room (returns Agora token) |
| `POST /api/leave_channel` | Leave a room |
| `GET /api/get_channel_messages` | Room chat messages |
| `POST /api/get_channel_audience` | Room participants |
| `POST /api/send_channel_reaction` | Send emoji reaction |
| `POST /api/active_ping` | Room keepalive |
| `POST /api/surfer_join_channel` | Silent listener join |
| `POST /api/preview_join_channel` | Preview room |
| `POST /api/get_profile` | User profile |
| `POST /api/search` | Search users/clubs |
| `POST /api/follow` | Follow user |
| `GET /api/get_suggested_follows_all` | Suggested follows |
| `POST /api/get_profile_feed` | User's replays |
| `POST /api/get_social_club` | Club details |
| `POST /api/get_user_badges` | Notification badges |
| `POST /api/get_settings` | User settings |

### Real-Time Services

- **Agora** (App ID: `938de3e8055e42b281bb8c6f69c21f78`) — Live audio. We join as audience and subscribe to speaker audio streams.
- **PubNub** (Sub Key: `sub-c-a4abea84-9ca3-11ea-8e71-f2b83ac9263d`) — Real-time events (not implemented — we poll instead).

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Bun](https://bun.sh/) (or npm/pnpm)
- A Clubhouse account with password auth enabled

### Setup

```bash
# Clone the repo
git clone https://github.com/youruser/deskhouse.git
cd deskhouse

# Install frontend dependencies
bun install

# Run in development mode
bun run tauri dev
```

First build takes ~3 minutes (compiling 450+ Rust crates). Subsequent builds are fast.

### Building for Production

```bash
bun run tauri build
```

This produces platform-specific installers in `src-tauri/target/release/bundle/`.

## How the API Was Reverse-Engineered

1. Set up [mitmproxy](https://mitmproxy.org/) on a PC
2. Connected an iPhone to the same Wi-Fi and configured it to use the PC as an HTTP proxy
3. Installed mitmproxy's CA certificate on the iPhone
4. Clubhouse does **not** use certificate pinning, so all HTTPS traffic was visible
5. Used the Clubhouse app normally — browsing rooms, joining, chatting, searching, viewing profiles
6. Logged out and back in to capture the full auth flow
7. Extracted all API endpoints, headers, request/response bodies from the captured `.mitm` file
8. Built typed Rust structs and TypeScript interfaces matching the real API shapes

## Contributing

This is a hobby project and contributions are welcome. Some areas that need work:

- [ ] Speaking capability (join as host/speaker via Agora)
- [ ] PubNub integration for real-time updates instead of polling
- [ ] DM / conversation UI
- [ ] Room creation
- [ ] Profile editing
- [ ] Hand-raise and moderation flows
- [ ] Better error handling and retry logic
- [ ] Tests

## License

MIT
