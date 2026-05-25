import react from "react";

function LiveFeed({ theme, isDarkMode, attendanceLogs }) {
  return (
    <div
      style={{
        flex: 1,
        background:
          isDarkMode
            ? "rgba(15, 23, 42, 0.72)"
            : "rgba(255, 255, 255, 0.78)",

        backdropFilter: "blur(14px)",

        border:
          isDarkMode
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",
        borderRadius: "12px",
        border: `1px solid ${theme.border}`,
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "600px",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ color: theme.success }}>●</span> Live Feed
        </h2>
      </div>
      <div
        style={{
          padding: "20px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {attendanceLogs.length === 0 ? (
          <div
            style={{
              color: theme.textMuted,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            No check-ins yet today.
          </div>
        ) : (
          attendanceLogs.map((log, i) => (
            <div
              key={i}
              style={{
                padding: "12px",
                backgroundColor: theme.bg,
                border: `1px solid ${theme.border}`,
                borderRadius: "8px",
                borderLeft: `4px solid ${log.type === "Walk-in" ? theme.primary : theme.success}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "14px" }}>{log.full_name}</strong>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    padding: "2px 8px",
                    borderRadius: "20px",
                    backgroundColor: log.type === "Walk-in" ? `${theme.primary}22` : `${theme.success}22`,
                    color: log.type === "Walk-in" ? theme.primary : theme.success,
                  }}
                >
                  {log.type || "Member"}
                </span>
              </div>
              <span style={{ color: theme.textMuted, fontSize: "11px" }}>
                Timed in at {new Date(log.time_in).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LiveFeed;
