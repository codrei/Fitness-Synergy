import { useNavigate } from "react-router-dom";

// Counts a member as "needing outreach" only if not contacted in the last 14 days.
const needsOutreach = (m) => {
  if (!m.renewal_contacted_at) return true;
  const contactedTs = new Date(m.renewal_contacted_at.replace(" ", "T")).getTime();
  if (isNaN(contactedTs)) return true;
  return Date.now() - contactedTs > 14 * 24 * 3600 * 1000;
};

function ExpiringBanner({ theme, expiringSoon }) {
  const navigate = useNavigate();

  if (!Array.isArray(expiringSoon) || expiringSoon.length === 0) return null;

  const actionable = expiringSoon.filter(needsOutreach);
  if (actionable.length === 0) return null;

  const todayOrTomorrow = actionable.filter((m) => Number(m.days_left) <= 1);
  const threeDays      = actionable.filter((m) => {
    const d = Number(m.days_left);
    return d >= 2 && d <= 3;
  });

  // Color + tone derive from the most urgent bucket that has anything in it.
  let tone, message;
  if (todayOrTomorrow.length > 0) {
    tone = {
      bg: "rgba(239, 68, 68, 0.10)",
      border: "rgba(239, 68, 68, 0.55)",
      accent: "#FCA5A5",
      icon: "⚠",
    };
    const todayCount = todayOrTomorrow.filter((m) => Number(m.days_left) === 0).length;
    const tomorrowCount = todayOrTomorrow.length - todayCount;
    const parts = [];
    if (todayCount)    parts.push(`${todayCount} expir${todayCount === 1 ? "es" : "e"} today`);
    if (tomorrowCount) parts.push(`${tomorrowCount} tomorrow`);
    if (threeDays.length) parts.push(`${threeDays.length} in the next 3 days`);
    message = parts.join(" · ");
  } else if (threeDays.length > 0) {
    tone = {
      bg: "rgba(245, 158, 11, 0.10)",
      border: "rgba(245, 158, 11, 0.55)",
      accent: "#FCD34D",
      icon: "📅",
    };
    message = `${threeDays.length} member${threeDays.length === 1 ? "" : "s"} expiring in the next 3 days`;
  } else {
    tone = {
      bg: "rgba(59, 130, 246, 0.08)",
      border: "rgba(59, 130, 246, 0.45)",
      accent: "#93C5FD",
      icon: "📅",
    };
    message = `${actionable.length} member${actionable.length === 1 ? "" : "s"} expiring in the next 7 days`;
  }

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px",
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        borderRadius: 12,
        marginBottom: 20,
      }}
    >
      <span style={{ fontSize: 20, color: tone.accent, flexShrink: 0 }}>{tone.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, lineHeight: 1.4 }}>
          {message}
        </div>
        <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
          Reach out before they lapse.
        </div>
      </div>
      <button
        onClick={() => navigate("/expiring")}
        style={{
          padding: "8px 14px",
          background: tone.accent,
          color: "#0a0a0a",
          border: "none",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        View all →
      </button>
    </div>
  );
}

export default ExpiringBanner;
