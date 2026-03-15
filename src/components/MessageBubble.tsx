import type { ChannelMessage } from "../lib/types";
import UserAvatar from "./UserAvatar";

interface MessageBubbleProps {
  message: ChannelMessage;
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

const emojiMap: Record<string, string> = {
  skull_emoji: "\u{1F480}",
  fire_emoji: "\u{1F525}",
  heart_emoji: "\u{2764}\u{FE0F}",
  laughing_emoji: "\u{1F602}",
  clap_emoji: "\u{1F44F}",
  "100_emoji": "\u{1F4AF}",
  thinking_emoji: "\u{1F914}",
  raised_hands_emoji: "\u{1F64C}",
  party_emoji: "\u{1F389}",
  wave_emoji: "\u{1F44B}",
};

function resolveEmoji(key: string): string {
  return emojiMap[key] ?? key;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  // message_type is a number; 6 = reaction
  const isReaction = message.message_type === 6 && message.reaction != null;

  const senderName = message.user_profile?.name ?? "Unknown";
  const senderPhoto = message.user_profile?.photo_url ?? null;

  return (
    <div style={styles.root}>
      <UserAvatar
        photoUrl={senderPhoto}
        name={senderName}
        size="sm"
      />

      <div style={styles.body}>
        <div style={styles.header}>
          <span style={styles.name}>{senderName}</span>
          <span style={styles.time}>{formatTime(message.time_created)}</span>
        </div>

        {isReaction ? (
          <div style={styles.reaction}>
            <span style={styles.reactionEmoji}>
              {resolveEmoji(message.reaction!.emoji)}
            </span>
            {message.target_user_profile && (
              <span style={styles.reactionTarget}>
                reacted to {message.target_user_profile.name ?? "someone"}
              </span>
            )}
          </div>
        ) : (
          <p style={styles.text}>{message.message}</p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    gap: 10,
    padding: "8px 0",
    alignItems: "flex-start",
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  time: {
    fontSize: 11,
    color: "var(--text-tertiary)",
  },
  text: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.5,
    color: "var(--text-secondary)",
    wordBreak: "break-word",
  },
  reaction: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  reactionEmoji: {
    fontSize: 20,
  },
  reactionTarget: {
    fontSize: 13,
    color: "var(--text-tertiary)",
    fontStyle: "italic",
  },
};
