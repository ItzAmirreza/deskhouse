import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { ChannelUser } from "../lib/types";
import { useRoomStore } from "../stores/room";
import UserAvatar from "../components/UserAvatar";
import MessageBubble from "../components/MessageBubble";

const REACTIONS = [
  { emoji: "\u{1F44F}", label: "clap" },
  { emoji: "\u{1F525}", label: "fire" },
  { emoji: "\u{2764}\u{FE0F}", label: "heart" },
  { emoji: "\u{1F602}", label: "laughing" },
  { emoji: "\u{1F480}", label: "skull" },
  { emoji: "\u{1F4AF}", label: "100" },
];

export default function RoomPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();

  const channel = useRoomStore((s) => s.channel);
  const messages = useRoomStore((s) => s.messages);
  const speakingUids = useRoomStore((s) => s.speakingUids);
  const isJoining = useRoomStore((s) => s.isJoining);
  const error = useRoomStore((s) => s.error);
  const join = useRoomStore((s) => s.join);
  const leave = useRoomStore((s) => s.leave);
  const sendReaction = useRoomStore((s) => s.sendReaction);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Join the room if not already in it
  useEffect(() => {
    if (channelId) {
      join(channelId);
    }
  }, [channelId, join]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleLeave() {
    await leave();
    navigate("/");
  }

  // Partition users
  const users = channel?.users ?? [];
  const speakers = users.filter((u) => u.is_speaker === true);
  const listeners = users.filter((u) => !u.is_speaker);

  if (isJoining) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={{ color: "var(--text-tertiary)", fontSize: 14, margin: 0 }}>Joining room...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centered}>
        <p style={{ color: "var(--danger)", fontSize: 14, margin: 0 }}>{error}</p>
        <button type="button" onClick={() => navigate("/")} style={styles.backBtn}>
          Back to Hallway
        </button>
      </div>
    );
  }

  if (!channel) {
    return (
      <div style={styles.centered}>
        <p style={{ color: "var(--text-tertiary)", fontSize: 14, margin: 0 }}>No active room</p>
        <button type="button" onClick={() => navigate("/")} style={styles.backBtn}>
          Back to Hallway
        </button>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <button type="button" onClick={handleLeave} style={styles.leaveBtn}>
          Leave quietly
        </button>
      </div>

      {/* Room header */}
      <div style={styles.roomHeader}>
        {channel.social_club?.name && (
          <span
            style={styles.clubLabel}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (channel.social_club?.social_club_id) {
                navigate(`/club/${channel.social_club.social_club_id}`);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && channel.social_club?.social_club_id) {
                navigate(`/club/${channel.social_club.social_club_id}`);
              }
            }}
          >
            {channel.social_club.name}
          </span>
        )}
        <h1 style={styles.title}>{channel.topic || "Untitled Room"}</h1>
      </div>

      <div style={styles.layout}>
        {/* Participants panel */}
        <div style={styles.participants}>
          {/* Speakers */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Speakers</h3>
            <div style={styles.userGrid}>
              {speakers.map((u) => (
                <ParticipantTile key={u.user_id} user={u} isSpeaking={speakingUids.has(u.user_id ?? 0)} />
              ))}
              {speakers.length === 0 && (
                <p style={styles.emptySection}>No speakers yet</p>
              )}
            </div>
          </div>

          {/* Listeners */}
          {listeners.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                Listeners ({listeners.length})
              </h3>
              <div style={styles.userGrid}>
                {listeners.map((u) => (
                  <ParticipantTile key={u.user_id} user={u} isSpeaking={false} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat panel */}
        {channel.is_room_chat_available !== false && (
          <div style={styles.chatPanel}>
            <div style={styles.chatHeader}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                Chat
              </h3>
            </div>

            <div style={styles.chatMessages}>
              {messages.length === 0 && (
                <p style={styles.chatEmpty}>No messages yet</p>
              )}
              {messages.map((m) => (
                <MessageBubble key={m.message_id} message={m} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reactions bar */}
            <div style={styles.reactions}>
              {REACTIONS.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  style={styles.reactionBtn}
                  title={r.label}
                  onClick={() => sendReaction(r.emoji)}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ParticipantTile({ user, isSpeaking }: { user: ChannelUser; isSpeaking: boolean }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => user.user_id && navigate(`/profile/${user.user_id}`)}
      style={styles.tile}
    >
      <div style={{
        position: "relative",
        borderRadius: "50%",
        padding: 3,
        border: isSpeaking ? "2.5px solid var(--accent)" : "2.5px solid transparent",
        boxShadow: isSpeaking ? "0 0 8px rgba(92, 176, 133, 0.5)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}>
        <UserAvatar photoUrl={user.photo_url ?? null} name={user.name ?? "?"} size="md" />
        {user.is_moderator && (
          <div style={styles.modBadge} title="Moderator">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        )}
      </div>
      <span style={{
        ...styles.tileName,
        color: isSpeaking ? "var(--accent)" : "var(--text-secondary)",
        fontWeight: isSpeaking ? 600 : 500,
      }}>{(user.first_name ?? user.name ?? "?").split(" ")[0]}</span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    maxWidth: 960,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 56px)",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    height: "calc(100vh - 56px)",
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid var(--border)",
    borderTopColor: "var(--accent)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  topBar: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "0 0 16px",
  },
  leaveBtn: {
    padding: "8px 18px",
    fontSize: 13,
    fontWeight: 600,
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: 20,
    color: "var(--danger)",
    cursor: "pointer",
    transition: "background 0.15s",
    fontFamily: "inherit",
  },
  backBtn: {
    padding: "8px 18px",
    fontSize: 13,
    fontWeight: 500,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text-secondary)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  roomHeader: {
    marginBottom: 20,
  },
  clubLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--accent)",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 4,
    display: "block",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "var(--text-primary)",
    lineHeight: 1.3,
  },
  layout: {
    display: "flex",
    gap: 20,
    flex: 1,
    minHeight: 0,
  },
  participants: {
    flex: 1,
    overflow: "auto",
    paddingRight: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    margin: "0 0 12px",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-tertiary)",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  userGrid: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 8,
  },
  tile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 12,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "inherit",
    fontFamily: "inherit",
    width: 80,
    transition: "background 0.12s",
  },
  tileName: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--text-secondary)",
    textAlign: "center" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    maxWidth: "100%",
  },
  modBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "var(--accent)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid var(--bg)",
  },
  emptySection: {
    fontSize: 13,
    color: "var(--text-tertiary)",
    margin: 0,
    fontStyle: "italic",
  },
  chatPanel: {
    width: 320,
    minWidth: 280,
    display: "flex",
    flexDirection: "column",
    background: "var(--surface)",
    borderRadius: 16,
    border: "1px solid var(--border)",
    overflow: "hidden",
  },
  chatHeader: {
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
  },
  chatMessages: {
    flex: 1,
    overflow: "auto",
    padding: "8px 16px",
  },
  chatEmpty: {
    fontSize: 13,
    color: "var(--text-tertiary)",
    textAlign: "center" as const,
    padding: "32px 0",
    margin: 0,
  },
  reactions: {
    display: "flex",
    gap: 4,
    padding: "8px 12px",
    borderTop: "1px solid var(--border)",
    justifyContent: "center",
  },
  reactionBtn: {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    background: "none",
    border: "1px solid transparent",
    borderRadius: 8,
    cursor: "pointer",
    transition: "background 0.12s, border-color 0.12s",
    fontFamily: "inherit",
  },
};
