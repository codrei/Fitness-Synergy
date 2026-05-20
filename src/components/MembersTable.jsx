import React from "react";

// Catching all the required parameters for the Table and its buttons
function MembersTable({
  theme,
  searchQuery,
  setSearchQuery,
  filteredMembers,
  getDaysRemaining,
  handleTimeIn,
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
          <tr
            style={{
              backgroundColor: theme.bg === "#121212" ? "#1a1a1a" : "#f8f9fa",
              borderBottom: `2px solid ${theme.border}`,
            }}
          >
            <th
              style={{
                padding: "15px 20px",
                color: theme.textMuted,
                fontSize: "12px",
                textTransform: "uppercase",
              }}
            >
              Name / Plan
            </th>
            <th
              style={{
                padding: "15px 20px",
                color: theme.textMuted,
                fontSize: "12px",
                textTransform: "uppercase",
              }}
            >
              Status
            </th>
            <th
              style={{
                padding: "15px 20px",
                color: theme.textMuted,
                fontSize: "12px",
                textTransform: "uppercase",
                textAlign: "right",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map((member) => {
            const daysLeft = getDaysRemaining(member.expiration_date);
            const isExpired = member.status === "Expired";
            const isDark = theme.bg === "#121212";
            return (
              <tr
                key={member.member_id}
                style={{ borderBottom: `1px solid ${theme.border}` }}
              >
                <td style={{ padding: "15px 20px" }}>
                  <div style={{ fontWeight: "bold", fontSize: "15px" }}>
                    {member.full_name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: theme.primary,
                      marginTop: "4px",
                    }}
                  >
                    {member.plan_name || "No Plan"}
                  </div>
                </td>
                <td style={{ padding: "15px 20px" }}>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      backgroundColor: isExpired
                        ? isDark
                          ? "#4a0f0f"
                          : "#ffebee"
                        : isDark
                          ? "#0d3318"
                          : "#e8f5e9",
                      color: isExpired ? theme.danger : theme.success,
                    }}
                  >
                    {isExpired
                      ? "❌ EXPIRED"
                      : daysLeft === 0
                        ? "⚠️ EXPIRES TODAY"
                        : `✅ ${daysLeft} DAYS LEFT`}
                  </span>
                  <div
                    style={{
                      fontSize: "11px",
                      color: theme.textMuted,
                      marginTop: "6px",
                    }}
                  >
                    Ends: {member.expiration_date}
                  </div>
                </td>
                <td style={{ padding: "15px 20px", textAlign: "right" }}>
                  <button
                    onClick={() =>
                      isExpired
                        ? alert("⛔ Please renew plan to time in.")
                        : handleTimeIn(member.member_id)
                    }
                    style={{
                      padding: "8px 12px",
                      backgroundColor: isExpired ? theme.border : theme.success,
                      color: isExpired ? theme.textMuted : "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: isExpired ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      marginRight: "8px",
                    }}
                  >
                    TIME IN
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
