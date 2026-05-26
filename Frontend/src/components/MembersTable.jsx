import React, { useState, useEffect } from "react";

const PAGE_SIZE = 10;

function MembersTable({
  theme,
  isDarkMode,
  searchQuery,
  setSearchQuery,
  filteredMembers,
  getDaysRemaining,
  confirmTimeIn,
  attendanceLogs,
  viewProfile,
  startRenewal,
  walkInAgain,
  convertWalkIn,
  showToast,
  handleDelete,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredMembers.length, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * PAGE_SIZE;
  const pageMembers = filteredMembers.slice(startIdx, startIdx + PAGE_SIZE);

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
        <h2 style={{ margin: 0, fontSize: "18px" }}>Client Directory</h2>

        <input
          type="text"
          placeholder="🔍 Search clients..."
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
            <th style={{ padding: "15px 20px" }}>Client Name</th>
            <th style={{ padding: "15px 20px" }}>Plan</th>
            <th style={{ padding: "15px 20px" }}>Status</th>
            <th style={{ padding: "15px 20px", textAlign: "right" }}>
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {pageMembers.map((member) => {
            const isWalkIn = member.client_type === "Walk-in";

            // — Walk-in row —
            if (isWalkIn) {
              return (
                <tr
                  key={member.member_id}
                  style={{ borderBottom: `1px solid ${theme.border}` }}
                >
                  <td style={{ padding: "12px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: isDarkMode ? "rgba(99,102,241,0.18)" : "#ede9fe",
                          border: `2px solid #7c3aed`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          flexShrink: 0,
                        }}
                      >
                        🚶
                      </div>
                      <div>
                        <span style={{ fontWeight: "bold" }}>{member.full_name}</span>
                        <span
                          style={{
                            marginLeft: "8px",
                            backgroundColor: isDarkMode ? "rgba(99,102,241,0.18)" : "#ede9fe",
                            color: "#7c3aed",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "bold",
                          }}
                        >
                          WALK-IN
                        </span>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "15px 20px" }}>
                    {member.plan_name || "Walk-in / Daily Plan"}
                  </td>

                  <td style={{ padding: "15px 20px" }}>
                    <span
                      style={{
                        backgroundColor: isDarkMode
                          ? "rgba(99,102,241,0.14)"
                          : "#ede9fe",
                        color: "#7c3aed",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                    >
                      {member.total_visits}x visit{member.total_visits !== 1 ? "s" : ""} · last {member.last_visit}
                    </span>
                  </td>

                  <td style={{ padding: "15px 20px", textAlign: "right" }}>
                    <button
                      onClick={() => walkInAgain(member)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#7c3aed",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "12px",
                        marginRight: "8px",
                      }}
                    >
                      🚶 Walk-in Again
                    </button>
                    <button
                      onClick={() => convertWalkIn(member)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "transparent",
                        color: "#7c3aed",
                        border: "1px solid #7c3aed",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                    >
                      ➕ Member
                    </button>
                  </td>
                </tr>
              );
            }

            // — Member row —
            const daysLeft = getDaysRemaining(member.expiration_date);
            const isExpired =
              member.status === "Expired" || daysLeft === "Expired";
            const isTimedIn = attendanceLogs.some(
              (log) => String(log.member_id) === String(member.member_id),
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
                <td style={{ padding: "12px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.full_name}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: `2px solid ${theme.primary}`,
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: theme.bg,
                          border: `2px dashed ${theme.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          flexShrink: 0,
                        }}
                      >
                        👤
                      </div>
                    )}
                    <span style={{ fontWeight: "bold" }}>{member.full_name}</span>
                  </div>
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
                      if (isExpired) {
                        showToast("⛔ Membership expired — use 🔄 Renew to reactivate.", "error");
                      } else if (!isTimedIn) {
                        confirmTimeIn(member);
                      }
                    }}
                    disabled={isTimedIn}
                    title={isExpired ? "Membership expired — please renew first" : ""}
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
                    onClick={() => startRenewal(member)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: theme.primary,
                      color: theme.primaryText,
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      marginRight: "8px",
                      fontSize: "12px",
                    }}
                  >
                    🔄 Renew
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

      <div
        style={{
          padding: "14px 20px",
          borderTop: `1px solid ${theme.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "13px",
          color: theme.textMuted,
        }}
      >
        <span>
          Showing {filteredMembers.length === 0 ? 0 : startIdx + 1}–
          {Math.min(startIdx + PAGE_SIZE, filteredMembers.length)} of{" "}
          {filteredMembers.length} {filteredMembers.length !== 1 ? "entries" : "entry"}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: `1px solid ${theme.border}`,
              backgroundColor: safeCurrentPage === 1 ? "transparent" : theme.primary,
              color: safeCurrentPage === 1 ? theme.textMuted : theme.primaryText,
              cursor: safeCurrentPage === 1 ? "default" : "pointer",
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            ‹ Prev
          </button>

          <span style={{ fontWeight: "bold", color: theme.text }}>
            Page {safeCurrentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: `1px solid ${theme.border}`,
              backgroundColor: safeCurrentPage === totalPages ? "transparent" : theme.primary,
              color: safeCurrentPage === totalPages ? theme.textMuted : theme.primaryText,
              cursor: safeCurrentPage === totalPages ? "default" : "pointer",
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
}

export default MembersTable;
