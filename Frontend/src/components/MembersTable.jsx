import React, { useState, useEffect } from "react";

const PAGE_SIZE = 10;

const getNumDays = (expDate) => {
  if (!expDate) return null;
  const today = new Date().setHours(0, 0, 0, 0);
  const exp = new Date(expDate + "T00:00:00").setHours(0, 0, 0, 0);
  return Math.round((exp - today) / (1000 * 60 * 60 * 24));
};

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const handle = () => setOpenDropdown(null);
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredMembers.length, searchQuery, statusFilter]);

  // Filter counts for tabs
  const counts = {
    all: filteredMembers.length,
    active: filteredMembers.filter(
      (m) => m.client_type !== "Walk-in" && (getNumDays(m.expiration_date) === null || getNumDays(m.expiration_date) >= 0),
    ).length,
    expired: filteredMembers.filter(
      (m) => m.client_type !== "Walk-in" && getNumDays(m.expiration_date) !== null && getNumDays(m.expiration_date) < 0,
    ).length,
    expiring: filteredMembers.filter((m) => {
      if (m.client_type === "Walk-in") return false;
      const d = getNumDays(m.expiration_date);
      return d !== null && d >= 0 && d <= 7;
    }).length,
    walkin: filteredMembers.filter((m) => m.client_type === "Walk-in").length,
  };

  const displayMembers = filteredMembers.filter((member) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "walkin") return member.client_type === "Walk-in";
    if (member.client_type === "Walk-in") return false;
    const days = getNumDays(member.expiration_date);
    if (statusFilter === "active") return days === null || days >= 0;
    if (statusFilter === "expired") return days !== null && days < 0;
    if (statusFilter === "expiring") return days !== null && days >= 0 && days <= 7;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(displayMembers.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * PAGE_SIZE;
  const pageMembers = displayMembers.slice(startIdx, startIdx + PAGE_SIZE);

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "expired", label: "Expired" },
    { key: "expiring", label: "Expiring Soon" },
    { key: "walkin", label: "Walk-in" },
  ];

  const tabColor = (key) => {
    if (key === "expired") return "#ef4444";
    if (key === "expiring") return "#f59e0b";
    if (key === "walkin") return "#a855f7";
    if (key === "active") return "#22c55e";
    return theme.primary;
  };

  return (
    <div
      style={{
        flex: 3,
        backgroundColor: isDarkMode ? "rgba(10,15,25,0.78)" : "rgba(255,255,255,0.82)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: "20px",
        border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
        boxShadow: isDarkMode ? "0 8px 32px rgba(0,0,0,0.45)" : "0 8px 24px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px 12px",
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px", color: theme.text }}>Client Directory</h2>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "9px 15px",
              borderRadius: "20px",
              border: `1px solid ${theme.border}`,
              backgroundColor: isDarkMode ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.7)",
              color: theme.text,
              width: "240px",
              outline: "none",
              fontSize: "13px",
            }}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {filterTabs.map((tab) => {
            const active = statusFilter === tab.key;
            const color = tabColor(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  border: `1px solid ${active ? color : theme.border}`,
                  backgroundColor: active ? color : "transparent",
                  color: active ? (tab.key === "all" ? theme.primaryText : "#fff") : theme.textMuted,
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: active ? "bold" : "normal",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
                <span
                  style={{
                    marginLeft: "5px",
                    backgroundColor: active ? "rgba(0,0,0,0.2)" : (isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"),
                    color: active ? "#fff" : theme.textMuted,
                    borderRadius: "10px",
                    padding: "1px 6px",
                    fontSize: "11px",
                  }}
                >
                  {counts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr>
            <th style={{ padding: "12px 20px", color: theme.textMuted, fontSize: "12px", textTransform: "uppercase", fontWeight: "bold" }}>Name</th>
            <th style={{ padding: "12px 20px", color: theme.textMuted, fontSize: "12px", textTransform: "uppercase", fontWeight: "bold" }}>Plan</th>
            <th style={{ padding: "12px 20px", color: theme.textMuted, fontSize: "12px", textTransform: "uppercase", fontWeight: "bold" }}>Status</th>
            <th style={{ padding: "12px 20px", color: theme.textMuted, fontSize: "12px", textTransform: "uppercase", fontWeight: "bold", textAlign: "right" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {pageMembers.length === 0 && (
            <tr>
              <td
                colSpan={4}
                style={{ padding: "40px 20px", textAlign: "center", color: theme.textMuted, fontSize: "14px" }}
              >
                No members match this filter.
              </td>
            </tr>
          )}

          {pageMembers.map((member) => {
            const isWalkIn = member.client_type === "Walk-in";

            if (isWalkIn) {
              return (
                <tr key={member.member_id} style={{ borderTop: `1px solid ${theme.border}` }}>
                  {/* Name */}
                  <td style={{ padding: "12px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: isDarkMode ? "rgba(99,102,241,0.18)" : "#ede9fe",
                          border: "2px solid #7c3aed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "15px",
                          fontWeight: "bold",
                          color: "#7c3aed",
                          flexShrink: 0,
                        }}
                      >
                        {member.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: "bold", color: theme.text }}>{member.full_name}</div>
                        <span
                          style={{
                            backgroundColor: isDarkMode ? "rgba(99,102,241,0.18)" : "#ede9fe",
                            color: "#7c3aed",
                            padding: "1px 7px",
                            borderRadius: "10px",
                            fontSize: "10px",
                            fontWeight: "bold",
                          }}
                        >
                          WALK-IN
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Plan */}
                  <td style={{ padding: "12px 20px", color: theme.textMuted, fontSize: "13px" }}>
                    {member.plan_name || "Walk-in / Daily Plan"}
                  </td>

                  {/* Status — two lines, no pill */}
                  <td style={{ padding: "12px 20px" }}>
                    <div style={{ fontWeight: "bold", fontSize: "14px", color: "#7c3aed" }}>
                      {member.total_visits} visit{member.total_visits !== 1 ? "s" : ""}
                    </div>
                    <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px" }}>
                      Last:{" "}
                      {member.last_visit
                        ? new Date(member.last_visit + "T00:00:00").toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => walkInAgain(member)}
                        style={{
                          padding: "7px 12px",
                          backgroundColor: "#7c3aed",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        Walk-in Again
                      </button>
                      <button
                        onClick={() => convertWalkIn(member)}
                        style={{
                          padding: "7px 12px",
                          backgroundColor: "transparent",
                          color: "#7c3aed",
                          border: "1px solid #7c3aed",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        + New Member
                      </button>

                      {/* ··· Delete dropdown */}
                      <div style={{ position: "relative" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === member.member_id ? null : member.member_id);
                          }}
                          style={{
                            padding: "7px 10px",
                            backgroundColor: "transparent",
                            color: theme.textMuted,
                            border: `1px solid ${theme.border}`,
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "16px",
                            lineHeight: 1,
                            fontWeight: "bold",
                            letterSpacing: "1px",
                          }}
                          title="More actions"
                        >
                          ···
                        </button>
                        {openDropdown === member.member_id && (
                          <div
                            style={{
                              position: "absolute",
                              right: 0,
                              top: "calc(100% + 4px)",
                              backgroundColor: theme.surface,
                              border: `1px solid ${theme.border}`,
                              borderRadius: "8px",
                              padding: "6px",
                              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                              zIndex: 200,
                              minWidth: "130px",
                            }}
                          >
                            <button
                              onClick={() => { handleDelete(member.member_id, member.full_name); setOpenDropdown(null); }}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "8px 12px",
                                backgroundColor: "transparent",
                                color: theme.danger,
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "bold",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDarkMode ? "rgba(255,82,82,0.12)" : "#ffebee")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            }

            // — Member row —
            const daysLeft = getDaysRemaining(member.expiration_date);
            const numDays = getNumDays(member.expiration_date);
            const isExpired = member.status === "Expired" || numDays < 0;
            const isTimedIn = attendanceLogs.some(
              (log) => String(log.member_id) === String(member.member_id),
            );

            const statusBg = isExpired
              ? isDarkMode ? "rgba(255,82,82,0.14)" : "#ffebee"
              : daysLeft === "Expires Today"
                ? isDarkMode ? "rgba(245,158,11,0.16)" : "#fff8e1"
                : isDarkMode ? "rgba(0,230,118,0.12)" : "#e8f5e9";

            const statusColor = isExpired
              ? "#ff5252"
              : daysLeft === "Expires Today"
                ? "#f59e0b"
                : "#00e676";

            const statusLabel = isExpired
              ? "EXPIRED"
              : daysLeft === "Expires Today"
                ? "EXPIRES TODAY"
                : daysLeft === "No Expiration"
                  ? "NO EXPIRATION"
                  : `${daysLeft}`;

            const initial = member.full_name?.charAt(0)?.toUpperCase() || "?";

            return (
              <tr key={member.member_id} style={{ borderTop: `1px solid ${theme.border}` }}>
                {/* Name */}
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
                          backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "#f0f0f0",
                          border: `2px dashed ${theme.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "15px",
                          fontWeight: "bold",
                          color: theme.textMuted,
                          flexShrink: 0,
                        }}
                      >
                        {initial}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: "bold", color: theme.text }}>{member.full_name}</div>
                      {member.age && (
                        <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px" }}>
                          Age {member.age}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Plan */}
                <td style={{ padding: "12px 20px", color: theme.textMuted, fontSize: "13px" }}>
                  {member.plan_name || "No Plan"}
                </td>

                {/* Status */}
                <td style={{ padding: "12px 20px" }}>
                  <span
                    style={{
                      backgroundColor: statusBg,
                      color: statusColor,
                      padding: "5px 11px",
                      borderRadius: "20px",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                  >
                    {statusLabel}
                  </span>
                </td>

                {/* Actions */}
                <td style={{ padding: "12px 20px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
                    {/* Primary: Time In */}
                    <button
                      onClick={() => { if (!isExpired && !isTimedIn) confirmTimeIn(member); }}
                      disabled={isExpired || isTimedIn}
                      title={isExpired ? "Membership expired — renew first" : ""}
                      style={{
                        padding: "7px 12px",
                        backgroundColor: isExpired
                          ? theme.border
                          : isTimedIn
                            ? isDarkMode ? "rgba(0,230,118,0.18)" : "#e8f5e9"
                            : theme.success,
                        color: isExpired ? theme.textMuted : isTimedIn ? theme.success : "#fff",
                        border: isTimedIn ? `1px solid ${theme.success}` : "none",
                        borderRadius: "6px",
                        cursor: isExpired || isTimedIn ? "default" : "pointer",
                        fontWeight: "bold",
                        fontSize: "12px",
                        opacity: isTimedIn ? 0.85 : 1,
                        minWidth: "80px",
                      }}
                    >
                      {isTimedIn ? "CHECKED IN" : "TIME IN"}
                    </button>

                    {/* Secondary: Profile */}
                    <button
                      onClick={() => viewProfile(member)}
                      style={{
                        padding: "7px 12px",
                        backgroundColor: "transparent",
                        color: theme.textMuted,
                        border: `1px solid ${theme.border}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Profile
                    </button>

                    {/* Secondary: Renew */}
                    <button
                      onClick={() => startRenewal(member)}
                      style={{
                        padding: "7px 12px",
                        backgroundColor: theme.primary,
                        color: theme.primaryText,
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                    >
                      Renew
                    </button>

                    {/* ··· Delete dropdown */}
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === member.member_id ? null : member.member_id);
                        }}
                        style={{
                          padding: "7px 10px",
                          backgroundColor: "transparent",
                          color: theme.textMuted,
                          border: `1px solid ${theme.border}`,
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "16px",
                          lineHeight: 1,
                          fontWeight: "bold",
                          letterSpacing: "1px",
                        }}
                        title="More actions"
                      >
                        ···
                      </button>
                      {openDropdown === member.member_id && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "calc(100% + 4px)",
                            backgroundColor: theme.surface,
                            border: `1px solid ${theme.border}`,
                            borderRadius: "8px",
                            padding: "6px",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                            zIndex: 200,
                            minWidth: "130px",
                          }}
                        >
                          <button
                            onClick={() => { handleDelete(member.member_id, member.full_name); setOpenDropdown(null); }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "8px 12px",
                              backgroundColor: "transparent",
                              color: theme.danger,
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: "bold",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDarkMode ? "rgba(255,82,82,0.12)" : "#ffebee")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
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
          Showing {displayMembers.length === 0 ? 0 : startIdx + 1}–
          {Math.min(startIdx + PAGE_SIZE, displayMembers.length)} of {displayMembers.length}{" "}
          {displayMembers.length !== 1 ? "entries" : "entry"}
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
