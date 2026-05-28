import React from "react";

function StatsCards({ stats, theme, isDarkMode }) {
  const s = stats || {};

  const cards = [
    {
      label: "Total Clients",
      val: s.total_clients ?? "—",
      color: "#6366f1",
      icon: "",
      sub: "Members + Walk-ins",
    },
    {
      label: "Total Members",
      val: s.total ?? "0",
      color: "#3b82f6",
      icon: "",
      sub: "Registered members",
    },
    {
      label: "Walk-in Guests",
      val: s.total_walkins ?? "0",
      color: "#a855f7",
      icon: "",
      sub: "Unique guests",
    },
    {
      label: "Active",
      val: s.active ?? "0",
      color: "#22c55e",
      icon: "",
      sub: "Valid memberships",
    },
    {
      label: "Expired",
      val: s.expired ?? "0",
      color: "#ef4444",
      icon: "",
      sub: "Needs renewal",
    },
    {
      label: "Today's Visits",
      val: s.checkins ?? "0",
      color: "#f59e0b",
      icon: "",
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

  const expiringMembers = s.expiring_soon || [];

  const urgencyColor = (days) => {
    if (days === 0) return "#ef4444";
    if (days <= 2) return "#f97316";
    if (days <= 5) return "#f59e0b";
    return "#22c55e";
  };

  const urgencyLabel = (days) => {
    if (days === 0) return "Expires Today!";
    if (days === 1) return "Tomorrow";
    return `${days} days left`;
  };

  return (
    <>
      {/* Stats Cards Grid */}
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

      {/* Expiry Notifications Panel */}
      {expiringMembers.length > 0 && (
        <div
          style={{
            borderRadius: "12px",
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
          {/* Header */}
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
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 14,
                    color: theme.text,
                  }}
                >
                  Membership Expiry Alert
                </div>
                <div style={{ fontSize: 11, color: theme.textMuted }}>
                  {expiringMembers.length} member
                  {expiringMembers.length !== 1 ? "s" : ""} expiring within 7
                  days
                </div>
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

          {/* Member List */}
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
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: `${color}22`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                      }}
                    >
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: 14,
                          color: theme.text,
                        }}
                      >
                        {m.full_name}
                      </div>
                      <div style={{ fontSize: 11, color: theme.textMuted }}>
                        Expires:{" "}
                        {new Date(
                          m.expiration_date + "T00:00:00",
                        ).toLocaleDateString("en-PH", {
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
