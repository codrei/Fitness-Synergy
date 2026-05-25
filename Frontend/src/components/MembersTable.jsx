import React from "react";

function MembersTable({
  theme,
  isDarkMode,
  searchQuery,
  setSearchQuery,
  filteredMembers,
  getDaysRemaining,
  handleTimeIn,
  attendanceLogs,
  viewProfile,
  startEditing,
  handleDelete,
}) {

  return (
    <div
      style={{
        flex: 3,
        backgroundColor: isDarkMode
          ? "rgba(10, 15, 25, 0.78)"
          : "rgba(255,255,255,0.82)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: "20px",
        border: isDarkMode
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(0,0,0,0.08)",
        boxShadow: isDarkMode
          ? "0 8px 32px rgba(0,0,0,0.45)"
          : "0 8px 24px rgba(0,0,0,0.08)",
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
            backgroundColor: isDarkMode
              ? "rgba(0,0,0,0.35)"
              : "rgba(255,255,255,0.7)",
            color: theme.text,
            width: "250px",
            outline: "none",
          }}
        />
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
        }}
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

            const isExpired =
              member.status === "Expired" || daysLeft === "Expired";

            const isTimedIn = attendanceLogs.some(
              (log) => log.member_id === member.member_id,
            );

            const statusBg = isExpired
              ? isDarkMode
                ? "rgba(255,82,82,0.14)"
                : "#ffebee"
              : daysLeft === "Expires Today"
                ? isDarkMode
                  ? "rgba(245,158,11,0.16)"
                  : "#fff8e1"
                : isDarkMode
                  ? "rgba(0,230,118,0.12)"
                  : "#e8f5e9";

            const statusColor = isExpired
              ? "#ff5252"
              : daysLeft === "Expires Today"
                ? "#f59e0b"
                : "#00e676";

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
                style={{
                  borderBottom: `1px solid ${theme.border}`,
                }}
              >
                <td
                  style={{
                    padding: "15px 20px",
                    fontWeight: "bold",
                  }}
                >
                  {member.full_name}
                </td>

                <td style={{ padding: "15px 20px" }}>
                  {member.plan_name || "No Plan"}
                </td>

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

                <td
                  style={{
                    padding: "15px 20px",
                    textAlign: "right",
                  }}
                >
                  <button
                    onClick={() => {
                      if (isExpired) alert("⛔ Please renew plan to time in.");
                      else if (!isTimedIn) handleTimeIn(member.member_id);
                    }}
                    disabled={isTimedIn}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: isExpired
                        ? theme.border
                        : isTimedIn
                          ? isDarkMode ? "rgba(0,230,118,0.18)" : "#e8f5e9"
                          : theme.success,
                      color: isExpired
                        ? theme.textMuted
                        : isTimedIn
                          ? theme.success
                          : "#fff",
                      border: isTimedIn ? `1px solid ${theme.success}` : "none",
                      borderRadius: "6px",
                      cursor: isExpired || isTimedIn ? "default" : "pointer",
                      fontWeight: "bold",
                      marginRight: "8px",
                      opacity: isTimedIn ? 0.85 : 1,
                    }}
                  >
                    {isTimedIn ? "✅ CHECKED IN" : "TIME IN"}
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
