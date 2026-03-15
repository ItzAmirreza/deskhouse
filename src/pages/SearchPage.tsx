import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { SearchItem } from "../lib/types";
import * as api from "../lib/api";
import UserAvatar from "../components/UserAvatar";

export default function SearchPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setError(null);
      return;
    }

    let cancelled = false;

    async function search() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.searchUsers(debouncedQuery);
        if (!cancelled) {
          setResults(res.items ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Search failed");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    search();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // Auto-focus search input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h1 style={styles.title}>Search</h1>
      </div>

      {/* Search input */}
      <div style={styles.searchBar}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-tertiary)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search people and clubs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.searchInput}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            style={styles.clearBtn}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={styles.error}>
          <span>{error}</span>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={styles.resultList}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={styles.skeletonRow}>
              <div style={styles.skeletonAvatar} />
              <div style={styles.skeletonText}>
                <div style={{ ...styles.skeletonLine, width: "50%" }} />
                <div style={{ ...styles.skeletonLine, width: "30%", height: 10 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state — no query */}
      {!debouncedQuery && !loading && results.length === 0 && (
        <div style={styles.empty}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p style={styles.emptyText}>Search for people and clubs</p>
          <p style={styles.emptyHint}>Find friends, creators, and communities</p>
        </div>
      )}

      {/* No results */}
      {debouncedQuery && !loading && !error && results.length === 0 && (
        <div style={styles.empty}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="15" x2="16" y2="15" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <p style={styles.emptyText}>No results found</p>
          <p style={styles.emptyHint}>Try a different search term</p>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div style={styles.resultList}>
          {results.map((item, i) => {
            if (item.user_profile) {
              const u = item.user_profile;
              return (
                <button
                  key={`user-${u.user_id ?? i}`}
                  type="button"
                  style={styles.resultRow}
                  onClick={() => u.user_id && navigate(`/profile/${u.user_id}`)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-raised)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <UserAvatar photoUrl={u.photo_url ?? null} name={u.name ?? "?"} size="md" />
                  <div style={styles.resultInfo}>
                    <span style={styles.resultName}>{u.displayname ?? u.name ?? "Unknown"}</span>
                    {u.username && <span style={styles.resultSub}>@{u.username}</span>}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              );
            }

            if (item.social_club) {
              const c = item.social_club;
              return (
                <button
                  key={`club-${c.social_club_id ?? i}`}
                  type="button"
                  style={styles.resultRow}
                  onClick={() => c.social_club_id && navigate(`/club/${c.social_club_id}`)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-raised)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {c.photo_url ? (
                    <img
                      src={c.photo_url}
                      alt={c.name ?? ""}
                      style={styles.clubPhoto}
                      draggable={false}
                    />
                  ) : (
                    <div style={styles.clubPhotoPlaceholder}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                      </svg>
                    </div>
                  )}
                  <div style={styles.resultInfo}>
                    <span style={styles.resultName}>{c.name ?? "Unknown Club"}</span>
                    <span style={styles.resultSub}>
                      {c.num_members != null ? `${c.num_members.toLocaleString()} members` : "Club"}
                    </span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    maxWidth: 600,
    margin: "0 auto",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    marginBottom: 20,
    transition: "border-color 0.15s",
  },
  searchInput: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    fontSize: 15,
    color: "var(--text-primary)",
    fontFamily: "inherit",
  },
  clearBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-tertiary)",
    padding: 4,
    borderRadius: 4,
  },
  error: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 13,
    color: "var(--danger)",
  },
  resultList: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  resultRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "12px 14px",
    background: "transparent",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    textAlign: "left" as const,
    width: "100%",
    fontFamily: "inherit",
    color: "inherit",
    fontSize: "inherit",
    transition: "background 0.12s",
  },
  resultInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  resultName: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  resultSub: {
    fontSize: 13,
    color: "var(--text-tertiary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  clubPhoto: {
    width: 44,
    height: 44,
    minWidth: 44,
    borderRadius: 10,
    objectFit: "cover" as const,
  },
  clubPhotoPlaceholder: {
    width: 44,
    height: 44,
    minWidth: 44,
    borderRadius: 10,
    background: "var(--surface-raised)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-tertiary)",
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
  skeletonRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "12px 14px",
  },
  skeletonAvatar: {
    width: 44,
    height: 44,
    minWidth: 44,
    borderRadius: "50%",
    background: "var(--skeleton)",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  skeletonText: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    background: "var(--skeleton)",
    animation: "pulse 1.5s ease-in-out infinite",
  },
};
