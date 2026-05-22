import React from "react";

function StatsCards({ stats, theme }) {
  // Add fallback empty object if stats is null
  const safeStats = stats || {};

  const cards = [
    { label: "Total Members", val: safeStats.total || "0", color: "#3b82f6" },
    { label: "Active", val: safeStats.active || "0", color: theme.success },
    { label: "Expired", val: safeStats.expired || "0", color: theme.danger },
    {
      label: "Today's Visits",
      val: safeStats.checkins || "0",
      color: "#f59e0b",
    },
    {
      label: "Revenue (Month)",
      val: `₱${parseFloat(safeStats.revenue || 0).toLocaleString()}`,
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
          backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
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
