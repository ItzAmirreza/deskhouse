import { useState } from "react";
import { useAuthStore } from "../stores/auth";

type Step = "phone" | "password";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);

  const { login, startAuth, isLoading, error, clearError } = useAuthStore();

  async function handleSendPhone(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setSending(true);
    try {
      await startAuth(phone.trim());
      setStep("password");
    } catch {
      // error is set in store
    } finally {
      setSending(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    try {
      await login(phone.trim(), password.trim());
    } catch {
      // error is set in store
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0118 0v6" />
            <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
          </svg>
          <h1 style={styles.title}>deskhouse</h1>
          <p style={styles.subtitle}>
            {step === "phone"
              ? "Enter your phone number to get started"
              : "Enter your password to log in"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.error}>
            <span>{error}</span>
            <button type="button" onClick={clearError} style={styles.errorDismiss}>
              &times;
            </button>
          </div>
        )}

        {/* Phone step */}
        {step === "phone" && (
          <form onSubmit={handleSendPhone} style={styles.form}>
            <label style={styles.label} htmlFor="phone">Phone number</label>
            <input
              id="phone"
              type="tel"
              placeholder="+1 555 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
              autoFocus
              autoComplete="tel"
            />
            <button
              type="submit"
              disabled={sending || !phone.trim()}
              style={{
                ...styles.button,
                opacity: sending || !phone.trim() ? 0.5 : 1,
              }}
            >
              {sending ? "Continue" : "Continue"}
            </button>
          </form>
        )}

        {/* Password step */}
        {step === "password" && (
          <form onSubmit={handleLogin} style={styles.form}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              style={{
                ...styles.button,
                opacity: isLoading || !password.trim() ? 0.5 : 1,
              }}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setPassword("");
                clearError();
              }}
              style={styles.backLink}
            >
              Use a different number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: -0.5,
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-tertiary)",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  input: {
    padding: "12px 14px",
    fontSize: 16,
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text-primary)",
    outline: "none",
    transition: "border-color 0.15s",
    fontFamily: "inherit",
  },
  button: {
    padding: "12px 20px",
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 10,
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    cursor: "pointer",
    transition: "opacity 0.15s",
    fontFamily: "inherit",
    marginTop: 4,
  },
  backLink: {
    background: "none",
    border: "none",
    color: "var(--text-tertiary)",
    fontSize: 13,
    cursor: "pointer",
    textDecoration: "underline",
    fontFamily: "inherit",
    padding: 4,
    textAlign: "center" as const,
  },
  error: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "10px 14px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    borderRadius: 10,
    fontSize: 13,
    color: "var(--danger)",
  },
  errorDismiss: {
    background: "none",
    border: "none",
    color: "var(--danger)",
    cursor: "pointer",
    fontSize: 18,
    lineHeight: 1,
    padding: 0,
    fontFamily: "inherit",
  },
};
