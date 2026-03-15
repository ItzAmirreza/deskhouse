import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "../lib/types";
import * as api from "../lib/api";
import RoomCard from "../components/RoomCard";
import UserAvatar from "../components/UserAvatar";
import { useAuthStore } from "../stores/auth";

export default function ExplorePage() {
  const navigate = useNavigate();
  const followingIds = useAuthStore((s) => s.followingIds);

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Suggested follows state
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(true);
  const [followLoadingIds, setFollowLoadingIds] = useState<Set<number>>(new Set());

  const fetchDiscovery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDiscoveryFeed();
      setItems(res.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load explore feed");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuggestedFollows = useCallback(async () => {
    setSuggestedLoading(true);
    try {
      const res = await api.getSuggestedFollows();
      setSuggestedUsers(res.users ?? []);
    } catch {
      // Silently fail — not critical
    } finally {
      setSuggestedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscovery();
    fetchSuggestedFollows();
  }, [fetchDiscovery, fetchSuggestedFollows]);

  async function handleFollow(userId: number) {
    setFollowLoadingIds((prev) => new Set(prev).add(userId));
    try {
      await api.followUser(userId);
      await useAuthStore.getState().checkAuth();
    } catch {
      // silently fail
    } finally {
      setFollowLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h1 style={styles.title}>Explore</h1>
        <button
          type="button"
          onClick={fetchDiscovery}
          disabled={loading}
          style={{
            ...styles.refreshBtn,
            opacity: loading ? 0.5 : 1,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={loading ? { animation: "spin 1s linear infinite" } : undefined}
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Suggested follows */}
      {!suggestedLoading && suggestedUsers.length > 0 && (
        <div style={styles.suggestedSection}>
          <h2 style={styles.sectionTitle}>People to follow</h2>
          <div style={styles.suggestedScroll}>
            {suggestedUsers.map((u) => {
              if (!u.user_id) return null;
              const isFollowing = followingIds.includes(u.user_id);
              const isLoading = followLoadingIds.has(u.user_id);
              return (
                <div key={u.user_id} style={styles.suggestedCard}>
                  <button
                    type="button"
                    style={styles.suggestedCardInner}
                    onClick={() => navigate(`/profile/${u.user_id}`)}
                  >
                    <UserAvatar photoUrl={u.photo_url ?? null} name={u.name ?? "?"} size="md" />
                    <span style={styles.suggestedName}>
                      {(u.displayname ?? u.name ?? "?").split(" ")[0]}
                    </span>
                    <span style={styles.suggestedUsername}>
                      {u.username ? `@${u.username}` : ""}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => u.user_id && handleFollow(u.user_id)}
                    disabled={isLoading}
                    style={{
                      ...styles.followBtn,
                      ...(isFollowing ? styles.followBtnFollowing : {}),
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  >
                    {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggested follows loading skeleton */}
      {suggestedLoading && (
        <div style={styles.suggestedSection}>
          <div style={{ ...styles.skeletonLine, width: 140, height: 14, marginBottom: 12 }} />
          <div style={styles.suggestedScroll}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={styles.suggestedCard}>
                <div style={styles.skeletonAvatarMd} />
                <div style={{ ...styles.skeletonLine, width: 70 }} />
                <div style={{ ...styles.skeletonLine, width: 50, height: 10 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.error}>
          <span>{error}</span>
          <button type="button" onClick={fetchDiscovery} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && items.length === 0 && (
        <div style={styles.grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={styles.skeleton}>
              <div style={{ ...styles.skeletonLine, width: "40%" }} />
              <div style={{ ...styles.skeletonLine, width: "80%", height: 18 }} />
              <div style={{ ...styles.skeletonLine, width: "60%" }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div style={styles.empty}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <p style={styles.emptyText}>Nothing to explore right now</p>
          <p style={styles.emptyHint}>Check back later for new rooms and content</p>
        </div>
      )}

      {/* Discovery items */}
      {items.length > 0 && (
        <div style={styles.grid}>
          {items.map((item, i) => {
            // Items with a channel key render as room cards
            if (item.channel) {
              const ch = item.channel;
              return <RoomCard key={ch.channel ?? ch.channel_id ?? i} channel={ch} />;
            }

            // Items with a social_club key render as club discovery cards
            if (item.social_club) {
              const club = item.social_club;
              return (
                <button
                  key={`club-${club.social_club_id ?? i}`}
                  type="button"
                  style={styles.discoveryCard}
                  onClick={() => club.social_club_id && navigate(`/club/${club.social_club_id}`)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  }}
                >
                  {club.photo_url && (
                    <img
                      src={club.photo_url}
                      alt=""
                      style={styles.discoveryImage}
                      draggable={false}
                    />
                  )}
                  <div style={styles.discoveryInfo}>
                    <span style={styles.discoveryTitle}>{club.name ?? "Unknown"}</span>
                    {club.num_members != null && (
                      <span style={styles.discoverySub}>
                        {club.num_members.toLocaleString()} members
                      </span>
                    )}
                  </div>
                </button>
              );
            }

            // Generic discovery card fallback
            return (
              <div key={i} style={styles.discoveryCard}>
                <div style={styles.discoveryInfo}>
                  <span style={styles.discoveryTitle}>
                    {item.title ?? item.name ?? "Discovery Item"}
                  </span>
                  {(item.subtitle ?? item.description) && (
                    <span style={styles.discoverySub}>
                      {item.subtitle ?? item.description}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    maxWidth: 680,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 500,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "opacity 0.15s",
    fontFamily: "inherit",
  },
  sectionTitle: {
    margin: "0 0 12px",
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  suggestedSection: {
    marginBottom: 28,
  },
  suggestedScroll: {
    display: "flex",
    gap: 12,
    overflowX: "auto" as const,
    paddingBottom: 8,
  },
  suggestedCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "16px 14px 14px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    minWidth: 120,
    maxWidth: 140,
  },
  suggestedCardInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "inherit",
    fontFamily: "inherit",
    padding: 0,
  },
  suggestedName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    maxWidth: 110,
    textAlign: "center" as const,
  },
  suggestedUsername: {
    fontSize: 11,
    color: "var(--text-tertiary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    maxWidth: 110,
  },
  followBtn: {
    padding: "5px 16px",
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 16,
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    cursor: "pointer",
    transition: "opacity 0.15s",
    fontFamily: "inherit",
    width: "100%",
  },
  followBtnFollowing: {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--text-secondary)",
  },
  error: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 13,
    color: "var(--danger)",
  },
  retryBtn: {
    background: "none",
    border: "1px solid var(--danger)",
    borderRadius: 6,
    padding: "4px 12px",
    color: "var(--danger)",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  discoveryCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "16px 18px",
    cursor: "pointer",
    textAlign: "left" as const,
    transition: "border-color 0.15s",
    width: "100%",
    fontFamily: "inherit",
    color: "inherit",
    fontSize: "inherit",
  },
  discoveryImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    objectFit: "cover" as const,
    flexShrink: 0,
  },
  discoveryInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 3,
    minWidth: 0,
  },
  discoveryTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  discoverySub: {
    fontSize: 13,
    color: "var(--text-tertiary)",
  },
  skeleton: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: "20px 22px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    background: "var(--skeleton)",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  skeletonAvatarMd: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "var(--skeleton)",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "64px 24px",
    textAlign: "center" as const,
  },
  emptyText: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  emptyHint: {
    margin: 0,
    fontSize: 13,
    color: "var(--text-tertiary)",
  },
};
