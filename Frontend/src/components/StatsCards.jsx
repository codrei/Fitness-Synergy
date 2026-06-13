import React from "react";

function StatsCards({ stats, theme, isDarkMode, onNavigate }) {
  const s = stats || {};

  const cards = [
    {
      label: "Total Members",
      val: s.total ?? "0",
      color: "#3b82f6",
      sub: "Registered members",
      nav: null,
    },
    {
      label: "Walk-in Guests",
      val: s.total_walkins ?? "0",
      color: "#a855f7",
      sub: "Unique guests",
      nav: "walkin",
    },
    {
      label: "Active",
      val: s.active ?? "0",
      color: "#22c55e",
      sub: "Click to filter",
      nav: "active",
    },
    {
      label: "Expired",
      val: s.expired ?? "0",
      color: "#ef4444",
      sub: "Click to filter",
      nav: "expired",
    },
    {
      label: "Today's Visits",
      val: s.checkins ?? "0",
      color: "#f59e0b",
      sub: "Check-ins today",
      nav: null,
    },
    {
      label: "Expiring Soon",
      val: s.expiring_soon?.length ?? "0",
      color: "#f97316",
      sub: "Click to filter",
      nav: "expiring",
    },
  ];

  const cardBase = {
    borderRadius: "10px",
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

  const expiringMembers = s.expiring_soon || [];

  const urgencyColor = (days) => {
    if (days === 0) return "#ef4444";
    if (days <= 2) return "#f97316";
    if (days <= 5) return "#f59e0b";
    return "#22c55e";
  };

  const urgencyLabel = (days) => {
    if (days === 0) return "Expires Today";
    if (days === 1) return "Tomorrow";
    return `${days} days left`;
  };

  return (
    <>
      <div
        className="stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            onClick={() => card.nav && onNavigate && onNavigate(card.nav)}
            style={{
              ...cardBase,
              cursor: card.nav && onNavigate ? "pointer" : "default",
              transition: "transform 0.1s ease, box-shadow 0.1s ease",
            }}
            onMouseEnter={(e) => {
              if (card.nav && onNavigate) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = isDarkMode
                  ? `0 8px 28px rgba(0,0,0,0.45)`
                  : `0 6px 18px rgba(0,0,0,0.13)`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = isDarkMode
                ? "0 4px 20px rgba(0,0,0,0.3)"
                : "0 4px 12px rgba(0,0,0,0.08)";
            }}
          >
            <div
              style={{
                height: "3px",
                background: `linear-gradient(90deg, ${card.color}, ${card.color}55)`,
              }}
            />
            <div style={{ padding: "18px 20px 20px" }}>
              <span
                style={{
                  fontSize: "11px",
                  color: theme.textMuted,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  display: "block",
                  marginBottom: "10px",
                }}
              >
                {card.label}
              </span>
              <div
                style={{
                  fontSize: "36px",
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
                  color: card.nav && onNavigate ? card.color : theme.textMuted,
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

      {expiringMembers.length > 0 && (
        <div
          style={{
            borderRadius: "10px",
            overflow: "hidden",
            background: isDarkMode
              ? "rgba(15,23,42,0.72)"
              : "rgba(255,255,255,0.78)",
            backdropFilter: "blur(14px)",
            border: `1px solid #f59e0b44`,
            boxShadow: isDarkMode
              ? "0 4px 20px rgba(0,0,0,0.3)"
              : "0 4px 12px rgba(0,0,0,0.08)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              height: "3px",
              background: "linear-gradient(90deg, #f59e0b, #ef444455)",
            }}
          />
          <div
            style={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            <div>
              <div style={{ fontWeight: "bold", fontSize: 14, color: theme.text }}>
                Membership Expiry Alert
              </div>
              <div style={{ fontSize: 11, color: theme.textMuted }}>
                {expiringMembers.length} member{expiringMembers.length !== 1 ? "s" : ""} expiring within 7 days
              </div>
            </div>
            <span
              style={{
                background: "#ef444422",
                color: "#ef4444",
                fontSize: 12,
                fontWeight: "bold",
                padding: "4px 12px",
                borderRadius: 20,
              }}
            >
              {expiringMembers.length} Expiring Soon
            </span>
          </div>

          <div
            style={{
              padding: "12px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {expiringMembers.map((m, i) => {
              const days = parseInt(m.days_left);
              const color = urgencyColor(days);
              const initial = m.full_name?.charAt(0)?.toUpperCase() || "?";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: isDarkMode ? `${color}11` : `${color}0d`,
                    border: `1px solid ${color}33`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: `${color}22`,
                        border: `1px solid ${color}44`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: "bold",
                        color: color,
                        flexShrink: 0,
                      }}
                    >
                      {initial}
                    </div>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: 14, color: theme.text }}>
                        {m.full_name}
                      </div>
                      <div style={{ fontSize: 11, color: theme.textMuted }}>
                        Expires:{" "}
                        {new Date(m.expiration_date + "T00:00:00").toLocaleDateString("en-PH", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      background: `${color}22`,
                      color: color,
                      fontSize: 12,
                      fontWeight: "bold",
                      padding: "4px 12px",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {urgencyLabel(days)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default StatsCards;
