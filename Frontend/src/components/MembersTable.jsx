import React from "react";

// Added handleTimeOut and attendanceLogs to the props
function MembersTable({
  theme,
  searchQuery,
  setSearchQuery,
  filteredMembers,
  getDaysRemaining,
  handleTimeIn,
  handleTimeOut,
  attendanceLogs,
  viewProfile,
  startEditing,
  handleDelete,
}) {
  return (
    <div
      style={{
        flex: 3,
        backgroundColor: theme.surface,
        borderRadius: "12px",
        border: `1px solid ${theme.border}`,
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderBottom: `1px solid ${theme.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px" }}>Member Roster</h2>
        <input
          type="text"
          placeholder="🔍 Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "10px 15px",
            borderRadius: "20px",
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.bg,
            color: theme.text,
            width: "250px",
            outline: "none",
          }}
        />
      </div>
      <table
        style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
      >
        <thead>
          <tr>
            <th style={{ padding: "15px 20px" }}>Member Name</th>
            <th style={{ padding: "15px 20px" }}>Plan</th>
            <th style={{ padding: "15px 20px" }}>Status</th>
            <th style={{ padding: "15px 20px", textAlign: "right" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map((member) => {
            const daysLeft = getDaysRemaining(member.expiration_date);
            const isDark = theme.bg === "#121212";

            const isExpired =
              member.status === "Expired" || daysLeft === "Expired";

            // --- CHECK IF TIMED IN ---
            // Checks if there's a log for this member today that doesn't have a time_out yet
            const activeSession = attendanceLogs.find(
              (log) => log.member_id === member.member_id && !log.time_out,
            );
            const isTimedIn = !!activeSession;

            const statusBg = isExpired
              ? isDark
                ? "#4a0f0f"
                : "#ffebee"
              : daysLeft === "Expires Today"
                ? isDark
                  ? "#4a3500"
                  : "#fff8e1"
                : isDark
                  ? "#0d3318"
                  : "#e8f5e9";
            const statusColor = isExpired
              ? theme.danger
              : daysLeft === "Expires Today"
                ? "#f59e0b"
                : theme.success;
            const statusLabel = isExpired
              ? "❌ EXPIRED"
              : daysLeft === "Expires Today"
                ? "⚠️ EXPIRES TODAY"
                : daysLeft === "No Expiration"
                  ? "✅ NO EXPIRATION"
                  : `✅ ${daysLeft}`;

            return (
              <tr
                key={member.member_id}
                style={{ borderBottom: `1px solid ${theme.border}` }}
              >
                {/* MEMBER NAME */}
                <td style={{ padding: "15px 20px", fontWeight: "bold" }}>
                  {member.full_name}
                </td>

                {/* PLAN */}
                <td style={{ padding: "15px 20px" }}>
                  {member.plan_name || "No Plan"}
                </td>

                {/* STATUS */}
                <td style={{ padding: "15px 20px" }}>
                  <span
                    style={{
                      backgroundColor: statusBg,
                      color: statusColor,
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                  >
                    {statusLabel}
                  </span>
                </td>

                {/* ACTION BUTTONS */}
                <td style={{ padding: "15px 20px", textAlign: "right" }}>
                  {/* --- UPDATED BUTTON LOGIC --- */}
                  <button
                    onClick={() => {
                      if (isExpired) alert("⛔ Please renew plan to time in.");
                      else if (isTimedIn) handleTimeOut(member.member_id);
                      else handleTimeIn(member.member_id);
                    }}
                    style={{
                      padding: "8px 12px",
                      // Red if timed in, Green if timed out, Grey if expired
                      backgroundColor: isExpired
                        ? theme.border
                        : isTimedIn
                          ? theme.danger
                          : theme.success,
                      color: isExpired ? theme.textMuted : "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: isExpired ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      marginRight: "8px",
                    }}
                  >
                    {isTimedIn ? "TIME OUT" : "TIME IN"}
                  </button>

                  <button
                    onClick={() => viewProfile(member)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: theme.sidebar,
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      marginRight: "8px",
                    }}
                  >
                    👤
                  </button>
                  <button
                    onClick={() => startEditing(member)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#f59e0b",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      marginRight: "8px",
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(member.member_id, member.full_name)
                    }
                    style={{
                      padding: "8px 12px",
                      backgroundColor: theme.danger,
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default MembersTable;
