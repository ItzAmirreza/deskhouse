import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import type { UserProfile } from "../lib/types";
import * as api from "../lib/api";
import { useAuthStore } from "../stores/auth";
import UserAvatar from "../components/UserAvatar";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FeedItem = any;

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const followingIds = useAuthStore((s) => s.followingIds);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);

  // Profile feed (replays)
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  const isOwnProfile = !userId || userId === "me" || userId === String(currentUser?.user_id);
  const isFollowing = profile?.user_id != null ? followingIds.includes(profile.user_id) : false;

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isOwnProfile) {
        const me = await api.getMe();
        setProfile(me.user_profile ?? null);
      } else {
        const res = await api.getProfile(Number(userId));
        setProfile(res.user_profile ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [userId, isOwnProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Fetch profile feed when profile is loaded
  useEffect(() => {
    if (!profile?.user_id) return;
    let cancelled = false;

    async function loadFeed() {
      setFeedLoading(true);
      try {
        const res = await api.getProfileFeed(profile!.user_id!);
        if (!cancelled) {
          setFeedItems(res.items ?? []);
        }
      } catch {
        // Silently fail — not critical
      } finally {
        if (!cancelled) setFeedLoading(false);
      }
    }

    loadFeed();
    return () => { cancelled = true; };
  }, [profile?.user_id]);

  async function handleFollow() {
    if (!profile?.user_id) return;
    setFollowLoading(true);
    try {
      await api.followUser(profile.user_id);
      // Re-check auth to update following_ids
      await useAuthStore.getState().checkAuth();
    } catch {
      // silently fail
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.skeletonAvatar} />
        <div style={{ ...styles.skeletonLine, width: 140, height: 18 }} />
        <div style={{ ...styles.skeletonLine, width: 100 }} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={styles.centered}>
        <p style={{ color: "var(--danger)", fontSize: 14, margin: 0 }}>
          {error ?? "Profile not found"}
        </p>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        {/* Avatar */}
        <UserAvatar photoUrl={profile.photo_url ?? null} name={profile.name ?? "?"} size="lg" />

        {/* Name & handle */}
        <h1 style={styles.name}>{profile.displayname ?? profile.name ?? "Unknown"}</h1>
        {profile.username && <p style={styles.handle}>@{profile.username}</p>}

        {/* Karma */}
        {profile.karma_band && (
          <div style={styles.karma}>
            {profile.karma_band.show_medal && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
            <span>
              {profile.karma_band.display_text ?? `${profile.karma_band.karma_score ?? 0} karma`}
            </span>
          </div>
        )}

        {/* Follow / stats */}
        <div style={styles.statsRow}>
          {profile.num_followers != null && (
            <div style={styles.statBlock}>
              <span style={styles.statNumber}>{formatCount(profile.num_followers)}</span>
              <span style={styles.statLabel}>followers</span>
            </div>
          )}
          {profile.num_following != null && (
            <div style={styles.statBlock}>
              <span style={styles.statNumber}>{formatCount(profile.num_following)}</span>
              <span style={styles.statLabel}>following</span>
            </div>
          )}
        </div>

        {/* Follow button */}
        {!isOwnProfile && (
          <button
            type="button"
            onClick={handleFollow}
            disabled={followLoading}
            style={{
              ...styles.followBtn,
              ...(isFollowing ? styles.followBtnFollowing : {}),
              opacity: followLoading ? 0.6 : 1,
            }}
          >
            {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
          </button>
        )}

        {/* Follows me badge */}
        {!isOwnProfile && profile.follows_me && (
          <span style={styles.followsMe}>Follows you</span>
        )}

        {/* Bio */}
        {profile.bio && <p style={styles.bio}>{profile.bio}</p>}

        {/* Social links */}
        {(profile.twitter || profile.instagram) && (
          <div style={styles.socials}>
            {profile.twitter && (
              <span style={styles.socialLink}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                {profile.twitter}
              </span>
            )}
            {profile.instagram && (
              <span style={styles.socialLink}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                {profile.instagram}
              </span>
            )}
          </div>
        )}

        {/* Share link */}
        {profile.url && (
          <a
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.shareLink}
          >
            View on Clubhouse
          </a>
        )}
      </div>

      {/* Replays section */}
      <div style={styles.replaysSection}>
        <h2 style={styles.replaysTitle}>Replays</h2>

        {feedLoading && (
          <div style={styles.replaysList}>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} style={styles.replayCard}>
                <div style={{ ...styles.skeletonLine, width: "70%", height: 14 }} />
                <div style={{ ...styles.skeletonLine, width: "40%" }} />
              </div>
            ))}
          </div>
        )}

        {!feedLoading && feedItems.length === 0 && (
          <div style={styles.replaysEmpty}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-tertiary)" }}>No replays yet</p>
          </div>
        )}

        {!feedLoading && feedItems.length > 0 && (
          <div style={styles.replaysList}>
            {feedItems.map((item: FeedItem, i: number) => (
              <div key={item?.id ?? i} style={styles.replayCard}>
                <span style={styles.replayCardTitle}>
                  {item?.title ?? item?.topic ?? item?.channel?.topic ?? "Replay"}
                </span>
                <span style={styles.replayCardDate}>
                  {item?.time_created ?? item?.date ?? ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "20px 0",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: "80px 0",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "36px 32px",
    textAlign: "center" as const,
  },
  name: {
    margin: "8px 0 0",
    fontSize: 24,
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  handle: {
    margin: 0,
    fontSize: 14,
    color: "var(--text-tertiary)",
  },
  karma: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 13,
    color: "var(--text-secondary)",
    marginTop: 4,
  },
  statsRow: {
    display: "flex",
    gap: 28,
    marginTop: 12,
  },
  statBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  statLabel: {
    fontSize: 12,
    color: "var(--text-tertiary)",
  },
  followBtn: {
    marginTop: 12,
    padding: "8px 32px",
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 20,
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    cursor: "pointer",
    transition: "opacity 0.15s",
    fontFamily: "inherit",
  },
  followBtnFollowing: {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--text-secondary)",
  },
  followsMe: {
    fontSize: 12,
    color: "var(--text-tertiary)",
    background: "var(--surface-raised)",
    padding: "2px 10px",
    borderRadius: 10,
    marginTop: 4,
  },
  bio: {
    margin: "16px 0 0",
    fontSize: 14,
    lineHeight: 1.6,
    color: "var(--text-secondary)",
    whiteSpace: "pre-wrap" as const,
    maxWidth: 360,
  },
  socials: {
    display: "flex",
    gap: 16,
    marginTop: 12,
    flexWrap: "wrap" as const,
    justifyContent: "center",
  },
  socialLink: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 13,
    color: "var(--text-tertiary)",
  },
  shareLink: {
    marginTop: 16,
    fontSize: 13,
    color: "var(--accent)",
    textDecoration: "none",
    fontWeight: 500,
  },
  skeletonAvatar: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "var(--skeleton)",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    background: "var(--skeleton)",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  replaysSection: {
    marginTop: 24,
  },
  replaysTitle: {
    margin: "0 0 12px",
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  replaysList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  replayCard: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "14px 18px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
  },
  replayCardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  replayCardDate: {
    fontSize: 12,
    color: "var(--text-tertiary)",
  },
  replaysEmpty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "32px 16px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    textAlign: "center" as const,
  },
};
