import React from "react";

function StatsCards({ stats, theme, isDarkMode }) {
  const s = stats || {};

  const cards = [
    {
      label: "Total Clients",
      val: s.total_clients ?? "—",
      color: "#6366f1",
      icon: "👥",
      sub: "Members + Walk-ins",
    },
    {
      label: "Total Members",
      val: s.total ?? "0",
      color: "#3b82f6",
      icon: "🏋️",
      sub: "Registered members",
    },
    {
      label: "Walk-in Guests",
      val: s.total_walkins ?? "0",
      color: "#a855f7",
      icon: "🚶",
      sub: "Unique guests",
    },
    {
      label: "Active",
      val: s.active ?? "0",
      color: "#22c55e",
      icon: "✅",
      sub: "Valid memberships",
    },
    {
      label: "Expired",
      val: s.expired ?? "0",
      color: "#ef4444",
      icon: "⚠️",
      sub: "Needs renewal",
    },
    {
      label: "Today's Visits",
      val: s.checkins ?? "0",
      color: "#f59e0b",
      icon: "📍",
      sub: "Check-ins today",
    },
  ];

  const cardBase = {
    borderRadius: "12px",
    overflow: "hidden",
    background: isDarkMode
      ? "rgba(15, 23, 42, 0.72)"
      : "rgba(255, 255, 255, 0.78)",
    backdropFilter: "blur(14px)",
    border: isDarkMode
      ? "1px solid rgba(255,255,255,0.08)"
      : "1px solid rgba(0,0,0,0.08)",
    boxShadow: isDarkMode
      ? "0 4px 20px rgba(0,0,0,0.3)"
      : "0 4px 12px rgba(0,0,0,0.08)",
  };

  return (
    <div
      className="stats-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px",
        marginBottom: "30px",
      }}
    >
      {cards.map((card, i) => (
        <div key={i} style={cardBase}>
          <div
            style={{
              height: "3px",
              background: `linear-gradient(90deg, ${card.color}, ${card.color}55)`,
            }}
          />
          <div style={{ padding: "16px 20px 18px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: theme.textMuted,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                }}
              >
                {card.label}
              </span>
              <span
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  backgroundColor: `${card.color}22`,
                }}
              >
                {card.icon}
              </span>
            </div>
            <div
              style={{
                fontSize: "34px",
                fontWeight: "900",
                color: card.color,
                lineHeight: 1,
              }}
            >
              {card.val}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: theme.textMuted,
                marginTop: "6px",
                opacity: 0.8,
              }}
            >
              {card.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;
