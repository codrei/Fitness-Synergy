import React from "react";

function StatsCards({ stats, theme }) {
  if (!stats) return null;

  const cards = [
    { label: "Total Members", val: stats.total, color: "#3b82f6" },
    { label: "Active", val: stats.active, color: theme.success },
    { label: "Expired", val: stats.expired, color: theme.danger },
    { label: "Today's Visits", val: stats.checkins, color: "#f59e0b" },
    {
      label: "Revenue (Month)",
      val: `₱${parseFloat(stats.revenue || 0).toLocaleString()}`,
      color: "#8b5cf6",
    },
  ];

  return (
    <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
      {cards.map((s, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            backgroundColor: theme.surface,
            padding: "20px",
            borderRadius: "12px",
            border: `1px solid ${theme.border}`,
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: theme.textMuted,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {s.label}
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "900",
              color: s.color,
              marginTop: "8px",
            }}
          >
            {s.val}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;
