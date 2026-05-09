import React from "react";

function ProfileModal({
  theme,
  selectedMember,
  closeProfile,
  totalVisits,
  paymentHistory,
  formatSafeDate,
  printReceipt,
  memberHistory,
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        style={{
          backgroundColor: theme.surface,
          padding: "30px",
          borderRadius: "12px",
          width: "500px",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${theme.border}`,
            paddingBottom: "15px",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0 }}>👤 {selectedMember.full_name}</h2>
          <button
            onClick={closeProfile}
            style={{
              background: "none",
              border: "none",
              color: theme.textMuted,
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ❌
          </button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: theme.bg,
              padding: "10px 15px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
            }}
          >
            <strong>Plan:</strong>{" "}
            <span style={{ color: theme.primary }}>
              {selectedMember.plan_name}
            </span>
          </div>
          <div
            style={{
              backgroundColor: theme.bg,
              padding: "10px 15px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
            }}
          >
            <strong>Total Visits:</strong> {totalVisits}
          </div>
        </div>

        <h3
          style={{
            margin: "0 0 10px 0",
            fontSize: "14px",
            color: theme.textMuted,
            textTransform: "uppercase",
          }}
        >
          💳 Billing History
        </h3>
        <div
          style={{
            maxHeight: "150px",
            overflowY: "auto",
            border: `1px solid ${theme.border}`,
            borderRadius: "8px",
            padding: "10px",
            backgroundColor: theme.bg,
            marginBottom: "20px",
          }}
        >
          {paymentHistory.length > 0 ? (
            paymentHistory.map((payment, i) => (
              <div
                key={payment.payment_id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom:
                    i !== paymentHistory.length - 1
                      ? `1px solid ${theme.border}`
                      : "none",
                  fontSize: "14px",
                }}
              >
                <div>
                  <strong style={{ fontSize: "16px" }}>
                    ₱{parseFloat(payment.amount).toLocaleString()}
                  </strong>
                  <span style={{ color: theme.textMuted, marginLeft: "10px" }}>
                    {formatSafeDate(payment.payment_date)}
                  </span>
                  {i === 0 && (
                    <span
                      style={{
                        marginLeft: "10px",
                        backgroundColor: theme.success,
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      LATEST
                    </span>
                  )}
                </div>
                <button
                  onClick={() => printReceipt(payment, selectedMember)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: theme.border,
                    color: theme.text,
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  📄 Print
                </button>
              </div>
            ))
          ) : (
            <div
              style={{
                color: theme.textMuted,
                fontStyle: "italic",
                textAlign: "center",
                padding: "10px",
              }}
            >
              No payments recorded.
            </div>
          )}
        </div>

        <h3
          style={{
            margin: "0 0 10px 0",
            fontSize: "14px",
            color: theme.textMuted,
            textTransform: "uppercase",
          }}
        >
          📅 Attendance History
        </h3>
        <div
          style={{
            maxHeight: "150px",
            overflowY: "auto",
            border: `1px solid ${theme.border}`,
            borderRadius: "8px",
            padding: "10px",
            backgroundColor: theme.bg,
          }}
        >
          {memberHistory.length > 0 ? (
            memberHistory.map((log, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 0",
                  borderBottom:
                    i !== memberHistory.length - 1
                      ? `1px solid ${theme.border}`
                      : "none",
                  fontSize: "14px",
                }}
              >
                📆 {new Date(log.time_in).toLocaleDateString()}{" "}
                <span style={{ color: theme.textMuted }}>at</span> ⏰{" "}
                {new Date(log.time_in).toLocaleTimeString()}
              </div>
            ))
          ) : (
            <div
              style={{
                color: theme.textMuted,
                fontStyle: "italic",
                textAlign: "center",
                padding: "10px",
              }}
            >
              No attendance yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
