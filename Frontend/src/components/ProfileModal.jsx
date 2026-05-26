import { useState } from "react";
import PhotoCropModal from "./PhotoCropModal";
import { apiFetch } from "../api";

function ProfileModal({
  theme,
  selectedMember,
  closeProfile,
  totalVisits,
  paymentHistory,
  formatSafeDate,
  printReceipt,
  memberHistory,
  onEditInfo,
  onPhotoUpdate,
  onAddInstallmentPayment,
}) {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  const m = selectedMember;

  const handleDeletePhoto = async () => {
    if (!window.confirm("Remove this profile photo?")) return;
    setDeletingPhoto(true);
    try {
      const res = await apiFetch("delete_member_photo.php", {
        method: "POST",
        body: JSON.stringify({ member_id: m.member_id }),
      }).then((r) => r.json());
      if (res.success) {
        setShowLightbox(false);
        onPhotoUpdate(null);
      } else {
        alert(res.error || "Delete failed.");
      }
    } catch {
      alert("Delete failed.");
    } finally {
      setDeletingPhoto(false);
    }
  };

  const paymentsInCycle = paymentHistory.filter((p) =>
    !m.start_date || new Date(p.payment_date) >= new Date(m.start_date)
  );
  const installmentTotalAmt = parseFloat(m.installment_total || 0);
  const installmentPaid = paymentsInCycle.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const installmentOutstanding = Math.max(0, installmentTotalAmt - installmentPaid);
  const fmtMoney = (n) => parseFloat(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

  const infoRow = (label, value) =>
    value ? (
      <div style={{ marginBottom: "10px" }}>
        <span
          style={{
            fontSize: "11px",
            color: theme.textMuted,
            textTransform: "uppercase",
            fontWeight: "bold",
            display: "block",
            marginBottom: "2px",
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: "14px" }}>{value}</span>
      </div>
    ) : null;

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
          width: "560px",
          maxHeight: "92vh",
          overflowY: "auto",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${theme.border}`,
            paddingBottom: "15px",
            marginBottom: "20px",
            gap: "14px",
          }}
        >
          {/* Profile photo */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            {m.photo_url ? (
              <img
                src={m.photo_url}
                alt={m.full_name}
                onClick={() => setShowLightbox(true)}
                title="Click to view full size"
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `3px solid ${theme.primary}`,
                  display: "block",
                  cursor: "zoom-in",
                }}
              />
            ) : (
              <div
                onClick={() => setShowPhotoModal(true)}
                title="Click to upload photo"
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  backgroundColor: theme.bg,
                  border: `3px dashed ${theme.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  cursor: "pointer",
                }}
              >
                👤
              </div>
            )}
            {/* Camera badge — always triggers upload */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPhotoModal(true);
              }}
              title="Upload new photo"
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: theme.primary,
                border: `2px solid ${theme.surface}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                cursor: "pointer",
                padding: 0,
              }}
            >
              📷
            </button>
          </div>

          {/* Lightbox */}
          {showLightbox && m.photo_url && (
            <div
              onClick={() => setShowLightbox(false)}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.92)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1300,
                cursor: "zoom-out",
              }}
            >
              <img
                src={m.photo_url}
                alt={m.full_name}
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: "85vw",
                  maxHeight: "78vh",
                  borderRadius: "12px",
                  objectFit: "contain",
                  boxShadow: "0 0 60px rgba(0,0,0,0.8)",
                }}
              />
              <div
                style={{
                  marginTop: "16px",
                  color: "#fff",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                {m.full_name}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "16px",
                  alignItems: "center",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleDeletePhoto}
                  disabled={deletingPhoto}
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: deletingPhoto ? "default" : "pointer",
                    fontWeight: "bold",
                    fontSize: "13px",
                    opacity: deletingPhoto ? 0.6 : 1,
                  }}
                >
                  {deletingPhoto ? "Deleting…" : "🗑️ Delete Photo"}
                </button>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>
                  or click outside to close
                </span>
              </div>
            </div>
          )}

          <h2 style={{ margin: 0, flex: 1, fontSize: "18px" }}>{m.full_name}</h2>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={() => onEditInfo(m)}
              style={{
                padding: "7px 14px",
                backgroundColor: "#f59e0b",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              ✏️ Edit Info
            </button>
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
        </div>

        {showPhotoModal && (
          <PhotoCropModal
            theme={theme}
            memberId={m.member_id}
            onSuccess={(url) => {
              setShowPhotoModal(false);
              onPhotoUpdate(url);
            }}
            onClose={() => setShowPhotoModal(false)}
          />
        )}

        {/* Plan + visits summary */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: 1,
              backgroundColor: theme.bg,
              padding: "10px 15px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
              minWidth: "120px",
            }}
          >
            <div style={{ fontSize: "11px", color: theme.textMuted, textTransform: "uppercase", marginBottom: "3px" }}>Current Plan</div>
            <strong style={{ color: theme.primary, fontSize: "14px" }}>{m.plan_name || "—"}</strong>
          </div>
          <div
            style={{
              flex: 1,
              backgroundColor: theme.bg,
              padding: "10px 15px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
              minWidth: "120px",
            }}
          >
            <div style={{ fontSize: "11px", color: theme.textMuted, textTransform: "uppercase", marginBottom: "3px" }}>Expires</div>
            <strong style={{ fontSize: "14px" }}>{m.expiration_date ? formatSafeDate(m.expiration_date) : "—"}</strong>
          </div>
          <div
            style={{
              flex: 1,
              backgroundColor: theme.bg,
              padding: "10px 15px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
              minWidth: "100px",
            }}
          >
            <div style={{ fontSize: "11px", color: theme.textMuted, textTransform: "uppercase", marginBottom: "3px" }}>Total Visits</div>
            <strong style={{ fontSize: "14px" }}>{totalVisits}</strong>
          </div>
        </div>

        {/* Installment section */}
        {m.is_installment == 1 && installmentTotalAmt > 0 && (
          <div style={{
            backgroundColor: "#f59e0b22", border: "1px solid #f59e0b",
            borderRadius: "10px", padding: "16px", marginBottom: "20px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ backgroundColor: "#f59e0b", color: "#000", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>
                💰 INSTALLMENT PLAN
              </span>
              <button
                onClick={() => onAddInstallmentPayment(m)}
                style={{ padding: "7px 14px", backgroundColor: theme.primary, color: theme.primaryText, border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}
              >
                ➕ Add Payment
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "11px", color: theme.textMuted, textTransform: "uppercase", marginBottom: "2px" }}>Total Plan</div>
                <strong>₱{fmtMoney(installmentTotalAmt)}</strong>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: theme.textMuted, textTransform: "uppercase", marginBottom: "2px" }}>Paid So Far</div>
                <strong style={{ color: "#22c55e" }}>₱{fmtMoney(installmentPaid)}</strong>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: theme.textMuted, textTransform: "uppercase", marginBottom: "2px" }}>Outstanding</div>
                <strong style={{ color: installmentOutstanding > 0 ? theme.danger : "#22c55e" }}>
                  ₱{fmtMoney(installmentOutstanding)}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Personal info section */}
        <div
          style={{
            backgroundColor: theme.bg,
            borderRadius: "8px",
            border: `1px solid ${theme.border}`,
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: theme.textMuted,
              textTransform: "uppercase",
              fontWeight: "bold",
              marginBottom: "14px",
            }}
          >
            🪪 Personal Information
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            {infoRow("Contact", m.contact_number)}
            {infoRow("Age", m.age ? `${m.age} years old` : null)}
            {infoRow("Date of Birth", m.dob ? formatSafeDate(m.dob) : null)}
            {infoRow("Gender", m.gender)}
            {infoRow("Occupation", m.occupation)}
            {infoRow("Facebook", m.facebook)}
            {infoRow("Contract ID", m.contract_id)}
            {infoRow("Discount", m.discount_type && m.discount_type !== "None" ? m.discount_type : null)}
            {infoRow("ID Type", m.discount_id_type)}
            {infoRow("ID Number", m.discount_id)}
            {infoRow("School", m.discount_school_name)}
            {infoRow("Emergency Contact", m.emergency_contact_name)}
            {infoRow("Emergency #", m.emergency_contact_number)}
          </div>
          {m.address && (
            <div style={{ marginTop: "6px" }}>
              <span style={{ fontSize: "11px", color: theme.textMuted, textTransform: "uppercase", fontWeight: "bold", display: "block", marginBottom: "2px" }}>Address</span>
              <span style={{ fontSize: "14px" }}>{m.address}</span>
            </div>
          )}
        </div>

        {/* Billing history */}
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
                  {payment.payment_method && (
                    <span style={{ color: theme.textMuted, marginLeft: "8px", fontSize: "12px" }}>
                      · {payment.payment_method}
                    </span>
                  )}
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

        {/* Attendance history */}
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
