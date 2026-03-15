import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import type { SocialClubDetail } from "../lib/types";
import * as api from "../lib/api";

export default function ClubPage() {
  const { clubId } = useParams<{ clubId: string }>();

  const [club, setClub] = useState<SocialClubDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClub = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSocialClub(Number(clubId));
      setClub(res.social_club ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load club");
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchClub();
  }, [fetchClub]);

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.skeletonPhoto} />
        <div style={{ ...styles.skeletonLine, width: 180, height: 20 }} />
        <div style={{ ...styles.skeletonLine, width: 120 }} />
        <div style={{ ...styles.skeletonLine, width: 240, marginTop: 12 }} />
      </div>
    );
  }

  if (error || !club) {
    return (
      <div style={styles.centered}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p style={{ color: "var(--danger)", fontSize: 14, margin: 0 }}>
          {error ?? "Club not found"}
        </p>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        {/* Club photo */}
        {club.photo_url ? (
          <img
            src={club.photo_url}
            alt={club.name ?? ""}
            style={styles.photo}
            draggable={false}
          />
        ) : (
          <div style={styles.photoPlaceholder}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
        )}

        {/* Name */}
        <h1 style={styles.name}>{club.name ?? "Unknown Club"}</h1>

        {/* Slug */}
        {club.slug && (
          <p style={styles.slug}>/{club.slug}</p>
        )}

        {/* Membership badge */}
        <div style={styles.membershipBadge}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {club.is_membership_open ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </>
            )}
          </svg>
          <span>{club.is_membership_open ? "Open membership" : "Closed membership"}</span>
        </div>

        {/* Stats row */}
        <div style={styles.statsRow}>
          {club.num_members != null && (
            <div style={styles.statBlock}>
              <span style={styles.statNumber}>{formatCount(club.num_members)}</span>
              <span style={styles.statLabel}>members</span>
            </div>
          )}
          {club.num_followers != null && (
            <div style={styles.statBlock}>
              <span style={styles.statNumber}>{formatCount(club.num_followers)}</span>
              <span style={styles.statLabel}>followers</span>
            </div>
          )}
        </div>

        {/* Description */}
        {club.description && (
          <p style={styles.description}>{club.description}</p>
        )}

        {/* Topics */}
        {club.topics && club.topics.length > 0 && (
          <div style={styles.topicsRow}>
            {club.topics.map((topic: any, i: number) => (
              <span key={i} style={styles.topicTag}>
                {typeof topic === "string" ? topic : topic.title ?? topic.name ?? "Topic"}
              </span>
            ))}
          </div>
        )}

        {/* Rules */}
        {club.rules && club.rules.length > 0 && (
          <div style={styles.rulesSection}>
            <h3 style={styles.rulesTitle}>Rules</h3>
            <div style={styles.rulesList}>
              {club.rules.map((rule: any, i: number) => (
                <div key={i} style={styles.ruleItem}>
                  <span style={styles.ruleNumber}>{i + 1}</span>
                  <span style={styles.ruleText}>
                    {typeof rule === "string" ? rule : rule.title ?? rule.desc ?? "Rule"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share link */}
        {(club.share_url ?? club.url) && (
          <a
            href={club.share_url ?? club.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.shareLink}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View on Clubhouse
          </a>
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
    maxWidth: 520,
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
  photo: {
    width: 88,
    height: 88,
    borderRadius: 18,
    objectFit: "cover" as const,
    border: "2px solid var(--border)",
  },
  photoPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 18,
    background: "var(--surface-raised)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-tertiary)",
    border: "2px solid var(--border)",
  },
  name: {
    margin: "10px 0 0",
    fontSize: 24,
    fontWeight: 700,
    color: "var(--text-primary)",
    lineHeight: 1.3,
  },
  slug: {
    margin: 0,
    fontSize: 13,
    color: "var(--text-tertiary)",
  },
  membershipBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 500,
    color: "var(--accent)",
    background: "var(--accent-muted)",
    padding: "4px 12px",
    borderRadius: 12,
    marginTop: 4,
  },
  statsRow: {
    display: "flex",
    gap: 32,
    marginTop: 16,
  },
  statBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  statLabel: {
    fontSize: 12,
    color: "var(--text-tertiary)",
  },
  description: {
    margin: "16px 0 0",
    fontSize: 14,
    lineHeight: 1.6,
    color: "var(--text-secondary)",
    whiteSpace: "pre-wrap" as const,
    maxWidth: 400,
  },
  topicsRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 6,
    marginTop: 14,
    justifyContent: "center",
  },
  topicTag: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--text-secondary)",
    background: "var(--surface-raised)",
    padding: "4px 10px",
    borderRadius: 8,
  },
  rulesSection: {
    width: "100%",
    marginTop: 20,
    textAlign: "left" as const,
  },
  rulesTitle: {
    margin: "0 0 10px",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-tertiary)",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  rulesList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  ruleItem: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
  },
  ruleNumber: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--accent)",
    background: "var(--accent-muted)",
    width: 22,
    height: 22,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  ruleText: {
    fontSize: 13,
    lineHeight: 1.5,
    color: "var(--text-secondary)",
  },
  shareLink: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    fontSize: 13,
    color: "var(--accent)",
    textDecoration: "none",
    fontWeight: 500,
    transition: "opacity 0.15s",
  },
  skeletonPhoto: {
    width: 88,
    height: 88,
    borderRadius: 18,
    background: "var(--skeleton)",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    background: "var(--skeleton)",
    animation: "pulse 1.5s ease-in-out infinite",
  },
};
