import React, { useState } from "react";
import {
  PHONE_PATTERN_STR,
  sanitizePhoneInput,
  isValidPhilippinePhone,
} from "../utils/phone";

function WalkInModal({
  theme,
  onClose,
  handleWalkInSubmit,
  walkInForm,
  setWalkInForm,
}) {
  const [submitting, setSubmitting] = useState(false);
  const update = (field, value) =>
    setWalkInForm((f) => ({ ...f, [field]: value }));

  const onSubmit = async (e) => {
    setSubmitting(true);
    try {
      await handleWalkInSubmit(e);
    } finally {
      setSubmitting(false);
    }
  };

  const labelStyle = {
    fontSize: "12px",
    color: theme.textMuted,
    textTransform: "uppercase",
    fontWeight: "bold",
    display: "block",
    marginBottom: "5px",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.bg,
    color: theme.text,
    outline: "none",
    boxSizing: "border-box",
  };

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
          width: "min(95vw, 500px)",
          maxHeight: "90vh",
          overflowY: "auto",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px" }}>
            Register Walk-in Guest
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label style={labelStyle}>
                Guest Name <span style={{ color: theme.danger }}>*</span>
              </label>
              <input
                type="text"
                value={walkInForm.guestName}
                onChange={(e) => update("guestName", e.target.value)}
                required
                autoFocus
                placeholder="Full Name"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Age <span style={{ color: theme.danger }}>*</span>
              </label>
              <input
                type="number"
                value={walkInForm.guestAge}
                onChange={(e) => update("guestAge", e.target.value)}
                placeholder="e.g., 25"
                min="1"
                max="120"
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>
              Contact Number <span style={{ color: theme.danger }}>*</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              pattern={PHONE_PATTERN_STR}
              maxLength={11}
              required
              title="Must be exactly 11 digits starting with 09"
              value={walkInForm.guestContact}
              onChange={(e) =>
                update("guestContact", sanitizePhoneInput(e.target.value))
              }
              placeholder="09171234567 — used to track repeat visits"
              style={inputStyle}
            />
            {walkInForm.guestContact &&
              !isValidPhilippinePhone(walkInForm.guestContact) && (
                <div style={{ fontSize: 11, color: theme.danger, marginTop: 4 }}>
                  Must be 11 digits starting with 09
                </div>
              )}
          </div>

          <div>
            <label style={labelStyle}>Address (Optional)</label>
            <input
              type="text"
              value={walkInForm.guestAddress}
              onChange={(e) => update("guestAddress", e.target.value)}
              placeholder="House No., Street, Barangay, City"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Custom Price Override (₱)</label>
            <input
              type="number"
              step="0.01"
              value={walkInForm.customPrice}
              onChange={(e) => update("customPrice", e.target.value)}
              placeholder="Override plan price..."
              style={inputStyle}
            />
          </div>

          <fieldset
            style={{
              border: `1px dashed ${theme.border}`,
              borderRadius: "8px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              margin: "5px 0",
            }}
          >
            <legend
              style={{
                color: theme.primary,
                fontWeight: "bold",
                fontSize: "12px",
                padding: "0 8px",
              }}
            >
              PAYMENT DETAILS
            </legend>

            <div>
              <label style={labelStyle}>Payment Method</label>
              <select
                value={walkInForm.paymentMethod}
                onChange={(e) => update("paymentMethod", e.target.value)}
                style={inputStyle}
              >
                <option value="Cash">Cash</option>
                <option value="GCash">GCash</option>
                <option value="Maya">Maya</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Reference Number</label>
              <input
                type="text"
                value={walkInForm.referenceNumber}
                onChange={(e) => update("referenceNumber", e.target.value)}
                placeholder="e.g., GCash ref #"
                style={inputStyle}
              />
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "16px",
              backgroundColor: theme.primary,
              color: theme.primaryText,
              border: "none",
              borderRadius: "6px",
              cursor: submitting ? "default" : "pointer",
              fontWeight: "bold",
              marginTop: "auto",
              fontSize: "14px",
              letterSpacing: "0.5px",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Saving…" : "Complete Walk-in Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default WalkInModal;
