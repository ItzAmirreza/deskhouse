import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { UserProfile, SettingsResponse } from "../lib/types";
import * as api from "../lib/api";
import { useAuthStore } from "../stores/auth";
import UserAvatar from "../components/UserAvatar";

export default function SettingsPage() {
  const navigate = useNavigate();
  const logoutAction = useAuthStore((s) => s.logout);

  const [me, setMe] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [meRes, settingsRes] = await Promise.all([
        api.getMe(),
        api.getSettings().catch(() => null),
      ]);
      setMe(meRes.user_profile ?? null);
      setSettings(settingsRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutAction();
      navigate("/login");
    } catch {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.root}>
        <h1 style={styles.pageTitle}>Settings</h1>
        <div style={styles.skeletonSection}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={styles.skeletonRow}>
              <div style={{ ...styles.skeletonLine, width: "30%" }} />
              <div style={{ ...styles.skeletonLine, width: "50%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.root}>
        <h1 style={styles.pageTitle}>Settings</h1>
        <div style={styles.error}>
          <span>{error}</span>
          <button type="button" onClick={fetchData} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <h1 style={styles.pageTitle}>Settings</h1>

      {/* Profile summary */}
      {me && (
        <div style={styles.profileSummary}>
          <UserAvatar photoUrl={me.photo_url ?? null} name={me.name ?? "?"} size="lg" />
          <div style={styles.profileInfo}>
            <span style={styles.profileName}>{me.displayname ?? me.name ?? "Unknown"}</span>
            {me.username && <span style={styles.profileHandle}>@{me.username}</span>}
          </div>
        </div>
      )}

      {/* Account section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Account</h2>
        <div style={styles.settingsList}>
          <div style={styles.settingsRow}>
            <span style={styles.settingsLabel}>Username</span>
            <span style={styles.settingsValue}>
              {me?.username ? `@${me.username}` : "Not set"}
            </span>
          </div>
          <div style={styles.settingsRow}>
            <span style={styles.settingsLabel}>Display Name</span>
            <span style={styles.settingsValue}>
              {me?.displayname ?? me?.name ?? "Not set"}
            </span>
          </div>
          {me?.url && (
            <div style={styles.settingsRow}>
              <span style={styles.settingsLabel}>Profile URL</span>
              <a
                href={me.url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.settingsLink}
              >
                {me.url}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Notifications section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Notifications</h2>
        <div style={styles.settingsList}>
          <div style={styles.settingsRow}>
            <span style={styles.settingsLabel}>Notifications</span>
            <span style={{
              ...styles.settingsValue,
              color: settings?.notifications_enabled ? "var(--accent)" : "var(--text-tertiary)",
            }}>
              {settings?.notifications_enabled == null
                ? "Unknown"
                : settings.notifications_enabled
                  ? "Enabled"
                  : "Disabled"}
            </span>
          </div>
        </div>
      </div>

      {/* Social section */}
      {(me?.twitter || me?.instagram) && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Connected Accounts</h2>
          <div style={styles.settingsList}>
            {me?.twitter && (
              <div style={styles.settingsRow}>
                <span style={styles.settingsLabel}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }}>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X / Twitter
                </span>
                <span style={styles.settingsValue}>@{me.twitter}</span>
              </div>
            )}
            {me?.instagram && (
              <div style={styles.settingsRow}>
                <span style={styles.settingsLabel}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }}>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  Instagram
                </span>
                <span style={styles.settingsValue}>@{me.instagram}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* App info section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>App</h2>
        <div style={styles.settingsList}>
          <div style={styles.settingsRow}>
            <span style={styles.settingsLabel}>App</span>
            <span style={styles.settingsValue}>deskhouse</span>
          </div>
          <div style={styles.settingsRow}>
            <span style={styles.settingsLabel}>Version</span>
            <span style={styles.settingsValue}>1.0.0</span>
          </div>
          <div style={styles.settingsRow}>
            <span style={styles.settingsLabel}>Platform</span>
            <span style={styles.settingsValue}>Desktop (Tauri)</span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div style={styles.logoutSection}>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            ...styles.logoutBtn,
            opacity: loggingOut ? 0.6 : 1,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          {loggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    maxWidth: 560,
    margin: "0 auto",
    padding: "0 0 40px",
  },
  pageTitle: {
    margin: "0 0 24px",
    fontSize: 24,
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  profileSummary: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "20px 22px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    marginBottom: 24,
  },
  profileInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  profileHandle: {
    fontSize: 14,
    color: "var(--text-tertiary)",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    margin: "0 0 8px",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-tertiary)",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    padding: "0 4px",
  },
  settingsList: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    overflow: "hidden",
  },
  settingsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 18px",
    borderBottom: "1px solid var(--border)",
    gap: 16,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text-secondary)",
    flexShrink: 0,
  },
  settingsValue: {
    fontSize: 14,
    color: "var(--text-primary)",
    textAlign: "right" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    minWidth: 0,
  },
  settingsLink: {
    fontSize: 14,
    color: "var(--accent)",
    textDecoration: "none",
    textAlign: "right" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    minWidth: 0,
  },
  logoutSection: {
    marginTop: 28,
    display: "flex",
    justifyContent: "center",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 32px",
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 12,
    border: "1px solid rgba(239, 68, 68, 0.25)",
    background: "rgba(239, 68, 68, 0.08)",
    color: "var(--danger)",
    cursor: "pointer",
    transition: "opacity 0.15s, background 0.15s",
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
  skeletonSection: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "8px 0",
  },
  skeletonRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "13px 18px",
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    background: "var(--skeleton)",
    animation: "pulse 1.5s ease-in-out infinite",
  },
};
