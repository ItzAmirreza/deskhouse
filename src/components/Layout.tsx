import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import { useRoomStore } from "../stores/room";
import * as api from "../lib/api";
import UserAvatar from "./UserAvatar";

function NavItem({ to, label, badge, children }: { to: string; label: string; badge?: number; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      style={({ isActive }) => ({
        ...navStyles.link,
        color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
        background: isActive ? "var(--surface-raised)" : "transparent",
      })}
    >
      <div style={{ position: "relative", display: "flex" }}>
        {children}
        {badge != null && badge > 0 && (
          <div style={navStyles.badge} />
        )}
      </div>
      <span>{label}</span>
    </NavLink>
  );
}

export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [activityBadge, setActivityBadge] = useState(0);

  // Poll user badges every 60s
  useEffect(() => {
    function fetchBadges() {
      api.getUserBadges()
        .then((res) => {
          setActivityBadge(res.activity_badge ?? 0);
        })
        .catch(() => {});
    }

    fetchBadges();
    const interval = setInterval(fetchBadges, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={layoutStyles.shell}>
      {/* Sidebar */}
      <aside style={layoutStyles.sidebar}>
        <div style={layoutStyles.logo}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0118 0v6" />
            <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
          </svg>
          <span style={layoutStyles.logoText}>deskhouse</span>
        </div>

        <nav style={layoutStyles.nav}>
          <NavItem to="/" label="Hallway" badge={activityBadge}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </NavItem>
          <NavItem to="/explore" label="Explore">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </NavItem>
          <NavItem to="/search" label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </NavItem>
          <NavItem to={`/profile/${user?.user_id ?? "me"}`} label="Profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </NavItem>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Settings */}
          <NavItem to="/settings" label="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </NavItem>
        </nav>

        <div style={layoutStyles.sidebarFooter}>
          {user && (
            <div style={layoutStyles.userInfo}>
              <UserAvatar photoUrl={user.photo_url ?? null} name={user.name ?? "?"} size="sm" />
              <div style={layoutStyles.userMeta}>
                <span style={layoutStyles.userName}>{user.name ?? "Unknown"}</span>
                <span style={layoutStyles.userHandle}>@{user.username ?? ""}</span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={logout}
            style={layoutStyles.logoutBtn}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--danger)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={layoutStyles.mainWrapper}>
        <main style={layoutStyles.main}>
          <Outlet />
        </main>
        <NowPlayingBar />
      </div>
    </div>
  );
}

function NowPlayingBar() {
  const navigate = useNavigate();
  const channel = useRoomStore((s) => s.channel);
  const channelId = useRoomStore((s) => s.channelId);
  const leave = useRoomStore((s) => s.leave);
  const speakingUids = useRoomStore((s) => s.speakingUids);
  const volume = useRoomStore((s) => s.volume);
  const setVolume = useRoomStore((s) => s.setVolume);

  if (!channel || !channelId) return null;

  const speakers = (channel.users ?? []).filter((u) => u.is_speaker);
  const activeSpeakers = speakers.filter((u) => speakingUids.has(u.user_id ?? 0));

  return (
    <div style={npStyles.bar}>
      <button
        type="button"
        onClick={() => navigate(`/room/${channelId}`)}
        style={npStyles.info}
      >
        {/* Pulsing audio indicator */}
        <div style={npStyles.audioIndicator}>
          <div style={npStyles.audioBar} />
          <div style={{ ...npStyles.audioBar, animationDelay: "0.15s", height: 14 }} />
          <div style={{ ...npStyles.audioBar, animationDelay: "0.3s" }} />
        </div>

        <div style={npStyles.textGroup}>
          <span style={npStyles.title}>
            {channel.topic || "Untitled Room"}
          </span>
          <span style={npStyles.subtitle}>
            {activeSpeakers.length > 0
              ? `${activeSpeakers.map((u) => (u.first_name ?? u.name ?? "").split(" ")[0]).join(", ")} speaking`
              : `${speakers.length} speaker${speakers.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      </button>

      <div style={npStyles.volumeControl}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: volume === 0 ? "var(--text-tertiary)" : "var(--text-secondary)", flexShrink: 0 }}>
          {volume === 0 ? (
            <>
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </>
          ) : (
            <>
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              {volume > 0 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />}
              {volume > 50 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />}
            </>
          )}
        </svg>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={npStyles.volumeSlider}
          title={`Volume: ${volume}%`}
        />
      </div>

      <button
        type="button"
        onClick={async () => { await leave(); }}
        style={npStyles.leaveBtn}
        title="Leave room"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18.36 5.64l-12.72 12.72M5.64 5.64l12.72 12.72" />
        </svg>
      </button>
    </div>
  );
}

const layoutStyles: Record<string, React.CSSProperties> = {
  shell: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    background: "var(--bg)",
  },
  sidebar: {
    width: 220,
    minWidth: 220,
    display: "flex",
    flexDirection: "column",
    background: "var(--surface)",
    borderRight: "1px solid var(--border)",
    padding: "20px 12px 16px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 8px 24px",
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: -0.3,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
  },
  sidebarFooter: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "14px 8px 0",
    borderTop: "1px solid var(--border)",
    marginTop: 12,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  userMeta: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  userHandle: {
    fontSize: 11,
    color: "var(--text-tertiary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  logoutBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 6,
    color: "var(--text-tertiary)",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.15s",
  },
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  main: {
    flex: 1,
    overflow: "auto",
    padding: "28px 32px",
  },
};

const npStyles: Record<string, React.CSSProperties> = {
  bar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 20px",
    background: "var(--surface)",
    borderTop: "1px solid var(--border)",
  },
  info: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "inherit",
    fontFamily: "inherit",
    textAlign: "left" as const,
    padding: 0,
  },
  audioIndicator: {
    display: "flex",
    alignItems: "flex-end",
    gap: 2,
    height: 18,
    flexShrink: 0,
  },
  audioBar: {
    width: 3,
    height: 10,
    borderRadius: 2,
    background: "var(--accent)",
    animation: "audioWave 0.6s ease-in-out infinite alternate",
  },
  textGroup: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  subtitle: {
    fontSize: 11,
    color: "var(--accent)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  volumeControl: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  volumeSlider: {
    width: 80,
    height: 4,
    cursor: "pointer",
    accentColor: "var(--accent)",
  },
  leaveBtn: {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "50%",
    color: "var(--danger)",
    cursor: "pointer",
    transition: "background 0.15s",
    flexShrink: 0,
    fontFamily: "inherit",
  },
};

const navStyles: Record<string, React.CSSProperties> = {
  link: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
    transition: "background 0.15s, color 0.15s",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--accent)",
    border: "2px solid var(--surface)",
  },
};
