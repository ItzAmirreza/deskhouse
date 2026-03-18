import AgoraRTC, {
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";

AgoraRTC.setLogLevel(2); // warnings + errors for debugging

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
 * Parse an Agora AccessToken007 to extract the App ID, channel, and UID.
 * Token format: "007" + base64(zlib(binary_payload))
 * The binary payload contains the App ID (32 hex chars), channel name, and UID as strings.
 */
async function parseAgoraToken(token: string): Promise<{ appId: string; channel: string; uid: string } | null> {
  try {
    if (!token.startsWith("007")) return null;

    // Decode base64 (handle URL-safe base64)
    const b64 = token.slice(3).replace(/-/g, "+").replace(/_/g, "/");
    const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

    // Decompress zlib using browser's DecompressionStream
    const ds = new DecompressionStream("deflate");
    const writer = ds.writable.getWriter();
    const reader = ds.readable.getReader();

    writer.write(raw);
    writer.close();

    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const total = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      total.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to string for pattern matching
    const text = new TextDecoder("ascii", { fatal: false }).decode(total);

    // Extract App ID: 32 hex chars
    const appIdMatch = text.match(/([0-9a-f]{32})/);
    if (!appIdMatch) return null;
    const appId = appIdMatch[1];

    // After the App ID, extract channel and UID as length-prefixed strings
    const afterAppId = text.slice(text.indexOf(appId) + 32);

    // Scan for readable strings (channel names and UIDs)
    const strings: string[] = [];
    let current = "";
    for (const ch of afterAppId) {
      if ((ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || (ch >= "0" && ch <= "9")) {
        current += ch;
      } else {
        if (current.length >= 3) strings.push(current);
        current = "";
      }
    }
    if (current.length >= 3) strings.push(current);

    // Channel: first alphanumeric string with letters, UID: first long numeric string
    const channel = strings.find((s) => /[a-zA-Z]/.test(s)) ?? "";
    const uid = strings.find((s) => /^\d{5,}$/.test(s)) ?? "";

    return { appId, channel, uid };
  } catch (e) {
    console.warn("Failed to parse Agora token:", e);
    return null;
  }
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

  // Extract App ID from the token itself — never hardcode
  const parsed = await parseAgoraToken(token);
  const appId = parsed?.appId;

  if (!appId) {
    console.error("Could not extract Agora App ID from token. Token starts with:", token.slice(0, 20));
    return;
  }

  // Verify the UID in the token matches what we're passing
  if (parsed?.uid && parsed.uid !== String(uid)) {
    console.warn(`Token UID (${parsed.uid}) differs from passed UID (${uid}). Using token UID.`);
    uid = Number(parsed.uid);
  }

  // Verify channel name matches
  if (parsed?.channel && parsed.channel !== channelName) {
    console.warn(`Token channel (${parsed.channel}) differs from passed channel (${channelName}). Using token channel.`);
    channelName = parsed.channel;
  }

  console.log(`Agora: joining channel="${channelName}" uid=${uid} appId=${appId.slice(0, 8)}...`);

  client = AgoraRTC.createClient({ mode: "live", codec: "h264" });
  client.setClientRole("audience");

  // Subscribe to audio when remote users (speakers) publish
  client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType) => {
    if (mediaType === "audio" && client) {
      console.log(`Agora: subscribing to audio from user ${user.uid}`);
      await client.subscribe(user, "audio");
      user.audioTrack?.play();
    }
  });

  client.on("user-unpublished", (user: IAgoraRTCRemoteUser, mediaType) => {
    if (mediaType === "audio") {
      user.audioTrack?.stop();
    }
  });

  client.on("connection-state-change", (cur, prev) => {
    console.log(`Agora: connection ${prev} -> ${cur}`);
  });

  try {
    await client.join(appId, channelName, token, uid);
    console.log(`Agora: joined successfully. Remote users: ${client.remoteUsers.length}`);
  } catch (err) {
    console.error("Agora join failed:", err);
    return;
  }

  // Enable volume indicator — fires every 500ms with volume levels per user
  client.enableAudioVolumeIndicator();
  client.on("volume-indicator", (volumes) => {
    const newSpeaking = new Set<number>();
    for (const v of volumes) {
      if (v.level > 5) {
        newSpeaking.add(Number(v.uid));
      }
    }
    if (
      newSpeaking.size !== speakingUids.size ||
      [...newSpeaking].some((u) => !speakingUids.has(u))
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
