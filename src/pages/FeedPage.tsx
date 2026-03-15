import { useEffect, useState, useCallback } from "react";
import type { FeedItem } from "../lib/types";
import * as api from "../lib/api";
import RoomCard from "../components/RoomCard";

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getFeed();
      setItems(res.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h1 style={styles.title}>Hallway</h1>
        <button
          type="button"
          onClick={fetchFeed}
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

      {/* Error */}
      {error && (
        <div style={styles.error}>
          <span>{error}</span>
          <button type="button" onClick={fetchFeed} style={styles.retryBtn}>
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
            <path d="M3 18v-6a9 9 0 0118 0v6" />
            <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
          </svg>
          <p style={styles.emptyText}>No rooms open right now</p>
          <p style={styles.emptyHint}>Check back later or start your own room</p>
        </div>
      )}

      {/* Room cards */}
      {items.length > 0 && (
        <div style={styles.grid}>
          {items.map((item) => {
            const ch = item.channel;
            if (!ch) return null;
            return <RoomCard key={ch.channel ?? ch.channel_id} channel={ch} />;
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
