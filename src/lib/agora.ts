import AgoraRTC, {
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";

// Clubhouse's Agora App ID — extracted from the Agora token
const AGORA_APP_ID = "938de3e8055e42b281bb8c6f69c21f78";

// Show warnings + errors during development, reduce in prod
AgoraRTC.setLogLevel(3);

let client: IAgoraRTCClient | null = null;

// Track which UIDs are currently speaking (volume above threshold)
let speakingUids: Set<number> = new Set();
let speakingListeners: Array<(uids: Set<number>) => void> = [];

/** Subscribe to speaking state changes. Returns unsubscribe function. */
export function onSpeakingChange(
  listener: (uids: Set<number>) => void
): () => void {
  speakingListeners.push(listener);
  return () => {
    speakingListeners = speakingListeners.filter((l) => l !== listener);
  };
}

function notifySpeaking(uids: Set<number>) {
  speakingListeners.forEach((l) => l(uids));
}

/**
 * Join an Agora audio channel as audience (listen-only).
 */
export async function joinAudioChannel(
  channelName: string,
  token: string,
  uid: number
): Promise<void> {
  await leaveAudioChannel();

  client = AgoraRTC.createClient({ mode: "live", codec: "h264" });
  client.setClientRole("audience");

  // Subscribe to audio when remote users (speakers) publish
  client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType) => {
    if (mediaType === "audio" && client) {
      await client.subscribe(user, "audio");
      user.audioTrack?.play();
    }
  });

  client.on("user-unpublished", (user: IAgoraRTCRemoteUser, mediaType) => {
    if (mediaType === "audio") {
      user.audioTrack?.stop();
    }
  });

  // UID must match the user_profile_id — the token is bound to it
  await client.join(AGORA_APP_ID, channelName, token, uid);

  // Enable volume indicator — fires every 500ms with volume levels per user
  client.enableAudioVolumeIndicator();
  client.on("volume-indicator", (volumes) => {
    const newSpeaking = new Set<number>();
    for (const v of volumes) {
      // level > 5 means the user is audibly speaking
      if (v.level > 5) {
        newSpeaking.add(Number(v.uid));
      }
    }
    // Only notify if the set actually changed
    if (
      newSpeaking.size !== speakingUids.size ||
      [...newSpeaking].some((uid) => !speakingUids.has(uid))
    ) {
      speakingUids = newSpeaking;
      notifySpeaking(speakingUids);
    }
  });
}

export async function leaveAudioChannel(): Promise<void> {
  if (client) {
    try {
      client.remoteUsers.forEach((user) => {
        user.audioTrack?.stop();
      });
      await client.leave();
    } catch {
      // Ignore leave errors
    }
    client = null;
  }
  speakingUids = new Set();
  notifySpeaking(speakingUids);
}
