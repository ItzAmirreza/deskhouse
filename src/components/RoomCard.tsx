import { useNavigate } from "react-router-dom";
import type { FeedChannel } from "../lib/types";
import UserAvatar from "./UserAvatar";

interface RoomCardProps {
  channel: FeedChannel;
}

export default function RoomCard({ channel }: RoomCardProps) {
  const navigate = useNavigate();

  const users = channel.users ?? [];
  const speakers = users.filter((u) => u.is_speaker === true);

  return (
    <button
      type="button"
      onClick={() => navigate(`/room/${channel.channel}`)}
      style={styles.card}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.transform = "none";
      }}
    >
      {/* Club badge */}
      {channel.social_club?.name && (
        <div
          style={styles.clubBadge}
          role="button"
          tabIndex={0}
          onClick={(e) => {
            if (channel.social_club?.social_club_id) {
              e.stopPropagation();
              navigate(`/club/${channel.social_club.social_club_id}`);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && channel.social_club?.social_club_id) {
              e.stopPropagation();
              navigate(`/club/${channel.social_club.social_club_id}`);
            }
          }}
        >
          {channel.social_club.photo_url && (
            <img
              src={channel.social_club.photo_url}
              alt=""
              style={{ width: 16, height: 16, borderRadius: 4, marginRight: 6 }}
              draggable={false}
            />
          )}
          <span style={styles.clubName}>{channel.social_club.name}</span>
        </div>
      )}

      {/* Title */}
      <h3 style={styles.title}>{channel.topic || "Untitled Room"}</h3>

      {/* Speakers */}
      <div style={styles.speakers}>
        <div style={styles.avatarStack}>
          {speakers.slice(0, 4).map((s, i) => (
            <div key={s.user_id} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i, position: "relative" }}>
              <UserAvatar photoUrl={s.photo_url ?? null} name={s.name ?? "?"} size="sm" />
            </div>
          ))}
        </div>
        <div style={styles.speakerNames}>
          {speakers
            .slice(0, 3)
            .map((s) => (s.name ?? "?").split(" ")[0])
            .join(", ")}
          {speakers.length > 3 && ` +${speakers.length - 3}`}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <span style={styles.stat}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
          {channel.num_all ?? 0}
        </span>
        <span style={styles.stat}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
          </svg>
          {channel.num_speakers ?? 0}
        </span>
        {channel.is_private && (
          <span style={styles.privateBadge}>Private</span>
        )}
      </div>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "18px 20px",
    cursor: "pointer",
    textAlign: "left",
    transition: "border-color 0.15s, transform 0.15s",
    width: "100%",
    fontFamily: "inherit",
    color: "inherit",
    fontSize: "inherit",
  },
  clubBadge: {
    display: "flex",
    alignItems: "center",
    fontSize: 12,
    color: "var(--text-tertiary)",
    fontWeight: 500,
    letterSpacing: 0.2,
    textTransform: "uppercase" as const,
    cursor: "pointer",
    transition: "color 0.15s",
  },
  clubName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.35,
    color: "var(--text-primary)",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  },
  speakers: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
  },
  avatarStack: {
    display: "flex",
    alignItems: "center",
  },
  speakerNames: {
    fontSize: 13,
    color: "var(--text-secondary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  stats: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginTop: 4,
    fontSize: 13,
    color: "var(--text-tertiary)",
  },
  stat: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  privateBadge: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: "uppercase" as const,
    color: "var(--accent)",
    background: "var(--accent-muted)",
    padding: "2px 8px",
    borderRadius: 6,
  },
};
