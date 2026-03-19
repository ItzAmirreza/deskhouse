import { create } from "zustand";
import type { JoinChannelResponse, ChannelMessage } from "../lib/types";
import * as api from "../lib/api";
import { joinAudioChannel, leaveAudioChannel, onSpeakingChange, setRemoteVolume } from "../lib/agora";

interface RoomState {
  // Connection state
  channel: JoinChannelResponse | null;
  channelId: string | null;
  messages: ChannelMessage[];
  speakingUids: Set<number>;
  volume: number;
  isJoining: boolean;
  error: string | null;

  // Actions
  join: (channelId: string) => Promise<void>;
  leave: () => Promise<void>;
  sendReaction: (emoji: string) => Promise<void>;
  setVolume: (volume: number) => void;
}

// Polling intervals — stored outside React so they persist across navigations
let messagePoll: ReturnType<typeof setInterval> | null = null;
let audiencePoll: ReturnType<typeof setInterval> | null = null;
let pingPoll: ReturnType<typeof setInterval> | null = null;
let speakingUnsub: (() => void) | null = null;

function clearPolls() {
  if (messagePoll) { clearInterval(messagePoll); messagePoll = null; }
  if (audiencePoll) { clearInterval(audiencePoll); audiencePoll = null; }
  if (pingPoll) { clearInterval(pingPoll); pingPoll = null; }
  if (speakingUnsub) { speakingUnsub(); speakingUnsub = null; }
}

export const useRoomStore = create<RoomState>((set, get) => ({
  channel: null,
  channelId: null,
  messages: [],
  speakingUids: new Set(),
  volume: 100,
  isJoining: false,
  error: null,

  join: async (channelId: string) => {
    const current = get().channelId;
    // Already in this room
    if (current === channelId && get().channel) return;

    // If in a different room, leave it first
    if (current && current !== channelId) {
      await get().leave();
    }

    set({ isJoining: true, error: null, channelId });

    try {
      const res = await api.joinChannel(channelId);
      set({ channel: res, isJoining: false });

      // Connect Agora audio
      if (res.token && res.channel && res.user_profile_id) {
        joinAudioChannel(res.channel, res.token, res.user_profile_id).catch(
          (err) => console.warn("Agora connect failed:", err)
        );
      }

      // Subscribe to speaking indicators
      speakingUnsub = onSpeakingChange((uids) => {
        set({ speakingUids: new Set(uids) });
      });

      // Fetch initial messages
      api.getChannelMessages(channelId)
        .then((r) => set({ messages: r.messages ?? [] }))
        .catch(() => {});

      // Start polling
      messagePoll = setInterval(() => {
        const cid = get().channelId;
        if (!cid) return;
        api.getChannelMessages(cid)
          .then((r) => set({ messages: r.messages ?? [] }))
          .catch(() => {});
      }, 5000);

      audiencePoll = setInterval(() => {
        const cid = get().channelId;
        if (!cid) return;
        api.getChannelAudience(cid)
          .then((r) => {
            if (!r.users) return;
            set((state) => {
              if (!state.channel) return state;
              const speakers = (state.channel.users ?? []).filter((u) => u.is_speaker);
              const listeners = r.users!.filter((u) => !u.is_speaker);
              return {
                channel: { ...state.channel, users: [...speakers, ...listeners] },
              };
            });
          })
          .catch(() => {});
      }, 15000);

      pingPoll = setInterval(() => {
        const cid = get().channelId;
        if (cid) api.activePing(cid).catch(() => {});
      }, 30000);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to join room",
        isJoining: false,
        channelId: null,
      });
    }
  },

  leave: async () => {
    const cid = get().channelId;
    clearPolls();
    await leaveAudioChannel();
    if (cid) {
      api.leaveChannel(cid).catch(() => {});
    }
    set({
      channel: null,
      channelId: null,
      messages: [],
      speakingUids: new Set(),
      isJoining: false,
      error: null,
    });
  },

  sendReaction: async (emoji: string) => {
    const cid = get().channelId;
    if (cid) {
      api.sendReaction(cid, emoji).catch(() => {});
    }
  },

  setVolume: (volume: number) => {
    set({ volume });
    setRemoteVolume(volume);
  },
}));
