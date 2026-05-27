import React from "react";

function TimeInConfirmModal({
  theme,
  member,
  getDaysRemaining,
  onConfirm,
  onClose,
}) {
  const daysLeft = getDaysRemaining(member.expiration_date);
  const isExpired = member.status === "Expired" || daysLeft === "Expired";

  const statusBg = isExpired
    ? "rgba(255,82,82,0.15)"
    : daysLeft === "Expires Today"
      ? "rgba(245,158,11,0.15)"
      : "rgba(0,230,118,0.12)";
  const statusColor = isExpired
    ? "#ff5252"
    : daysLeft === "Expires Today"
      ? "#f59e0b"
      : "#00c853";
  const statusLabel = isExpired
    ? "❌ EXPIRED"
    : daysLeft === "Expires Today"
      ? "⚠️ EXPIRES TODAY"
      : daysLeft === "No Expiration"
        ? "✅ NO EXPIRATION"
        : `✅ ${daysLeft}`;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.88)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1200,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: theme.surface,
          borderRadius: "16px",
          width: "380px",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: theme.sidebar,
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#fff", fontWeight: "bold", fontSize: "15px" }}>
            🔍 Verify Identity Before Time-In
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: "18px",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
          }}
        >
          {/* Photo */}
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt={member.full_name}
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                objectFit: "cover",
                border: `4px solid ${theme.primary}`,
                boxShadow: "0 0 0 4px rgba(0,191,255,0.15)",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "50%",
                  backgroundColor: theme.bg,
                  border: `3px dashed ${theme.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "64px",
                }}
              >
                👤
              </div>
              <div
                style={{
                  backgroundColor: "rgba(245,158,11,0.12)",
                  border: "1px solid rgba(245,158,11,0.4)",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  color: "#f59e0b",
                  fontSize: "12px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                ⚠️ No photo on file — verify ID manually
              </div>
            </div>
          )}

          {/* Name */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: theme.text,
              }}
            >
              {member.full_name}
            </div>
            <div
              style={{
                fontSize: "13px",
                color: theme.textMuted,
                marginTop: "4px",
              }}
            >
              {member.plan_name || "No Plan"}
            </div>
          </div>

          {/* Status */}
          <span
            style={{
              backgroundColor: statusBg,
              color: statusColor,
              padding: "6px 16px",
              borderRadius: "20px",
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            {statusLabel}
          </span>

          <div
            style={{
              width: "100%",
              height: "1px",
              backgroundColor: theme.border,
              margin: "4px 0",
            }}
          />

          {/* Confirm / Cancel */}
          <button
            onClick={onConfirm}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#00c853",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "15px",
              letterSpacing: "0.3px",
            }}
          >
            ✅ Confirm Time In
          </button>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "transparent",
              color: theme.textMuted,
              border: `1px solid ${theme.border}`,
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimeInConfirmModal;
