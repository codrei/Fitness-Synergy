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
  const isDarkMode = theme.bg === "#081018";

  return (
    <div
      style={{
        flex: 3,
        background: isDarkMode
          ? "rgba(15, 23, 42, 0.72)"
          : "rgba(255,255,255,0.78)",
        backdropFilter: "blur(14px)",
        border: isDarkMode
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(0,0,0,0.08)",
        borderRadius: "20px",
        boxShadow: isDarkMode
          ? "0 10px 30px rgba(0,0,0,0.35)"
          : "0 10px 30px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderBottom: isDarkMode
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",
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
            border: isDarkMode
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(0,0,0,0.08)",
            background: isDarkMode
              ? "rgba(0,0,0,0.25)"
              : "rgba(255,255,255,0.7)",
            color: theme.text,
            width: "250px",
            outline: "none",
            backdropFilter: "blur(10px)",
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

            // --- CHECK IF TIMED IN ---
            const activeSession = attendanceLogs.find(
              (log) => log.member_id === member.member_id && !log.time_out,
            );

            const isTimedIn = !!activeSession;

            // --- STATUS COLORS ---
            let statusBg = "";
            let statusColor = "";
            let statusLabel = "";

            if (isExpired) {
              statusBg = isDarkMode ? "rgba(239,68,68,0.18)" : "#fee2e2";

              statusColor = isDarkMode ? "#f87171" : "#991b1b";

              statusLabel = "❌ EXPIRED";
            } else if (daysLeft === "Expires Today") {
              statusBg = isDarkMode ? "rgba(245,158,11,0.18)" : "#fef3c7";

              statusColor = isDarkMode ? "#fbbf24" : "#92400e";

              statusLabel = "⚠️ EXPIRES TODAY";
            } else if (daysLeft === "No Expiration") {
              statusBg = isDarkMode ? "rgba(34,197,94,0.18)" : "#dcfce7";

              statusColor = isDarkMode ? "#4ade80" : "#166534";

              statusLabel = "✅ NO EXPIRATION";
            } else {
              statusBg = isDarkMode ? "rgba(34,197,94,0.18)" : "#dcfce7";

              statusColor = isDarkMode ? "#4ade80" : "#166534";

              statusLabel = `✅ ${daysLeft}`;
            }

            return (
              <tr
                key={member.member_id}
                style={{
                  borderBottom: isDarkMode
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "1px solid rgba(0,0,0,0.05)",
                  transition: "0.2s",
                }}
              >
                {/* MEMBER NAME */}
                <td
                  style={{
                    padding: "15px 20px",
                    fontWeight: "bold",
                  }}
                >
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
                      padding: "7px 14px",
                      borderRadius: "999px",
                      fontWeight: "bold",
                      fontSize: "12px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {statusLabel}
                  </span>
                </td>

                {/* ACTIONS */}
                <td
                  style={{
                    padding: "15px 20px",
                    textAlign: "right",
                  }}
                >
                  {/* TIME BUTTON */}
                  <button
                    onClick={() => {
                      if (isExpired) alert("⛔ Please renew plan to time in.");
                      else if (isTimedIn) handleTimeOut(member.member_id);
                      else handleTimeIn(member.member_id);
                    }}
                    style={{
                      padding: "8px 14px",
                      backgroundColor: isExpired
                        ? "#555"
                        : isTimedIn
                          ? "#ef4444"
                          : "#00bfff",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: isExpired ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      marginRight: "8px",
                      boxShadow: "0 0 12px rgba(0,191,255,0.25)",
                    }}
                  >
                    {isTimedIn ? "TIME OUT" : "TIME IN"}
                  </button>

                  {/* PROFILE */}
                  <button
                    onClick={() => viewProfile(member)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#7c3aed",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      marginRight: "8px",
                    }}
                  >
                    👤
                  </button>

                  {/* EDIT */}
                  <button
                    onClick={() => startEditing(member)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#f59e0b",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      marginRight: "8px",
                    }}
                  >
                    ✏️
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() =>
                      handleDelete(member.member_id, member.full_name)
                    }
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
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
