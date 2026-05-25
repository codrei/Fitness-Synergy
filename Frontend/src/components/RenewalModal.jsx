import React from "react";

function RenewalModal({ theme, member, plans, renewalForm, setRenewalForm, onSubmit, onClose }) {
  const update = (field, value) => setRenewalForm((f) => ({ ...f, [field]: value }));

  const membershipPlans = plans.filter((p) => String(p.plan_id) !== "1");

  const total = (
    parseFloat(renewalForm.cashAmount || 0) +
    parseFloat(renewalForm.gcashAmount || 0) +
    parseFloat(renewalForm.mayaAmount || 0) +
    parseFloat(renewalForm.debitAmount || 0) +
    parseFloat(renewalForm.creditAmount || 0)
  ).toLocaleString("en-PH", { minimumFractionDigits: 2 });

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
        inset: 0,
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
          maxHeight: "90vh",
          overflowY: "auto",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "6px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px" }}>🔄 Renew Membership</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}
          >
            ❌
          </button>
        </div>
        <p style={{ margin: "0 0 22px 0", color: theme.textMuted, fontSize: "14px" }}>
          Renewing for:{" "}
          <strong style={{ color: theme.text }}>{member.full_name}</strong>
        </p>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={labelStyle}>Membership Plan</label>
            <select
              value={renewalForm.planId}
              onChange={(e) => {
                const id = e.target.value;
                const matched = membershipPlans.find((p) => String(p.plan_id) === id);
                setRenewalForm((f) => ({
                  ...f,
                  planId: id,
                  customPrice: matched ? matched.price : f.customPrice,
                }));
              }}
              required
              style={inputStyle}
            >
              <option value="" disabled>
                Select a Plan...
              </option>
              {membershipPlans.map((p) => (
                <option key={p.plan_id} value={p.plan_id}>
                  {p.plan_name} — ₱{p.price}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={labelStyle}>Custom Price Override (₱)</label>
              <input
                type="number"
                step="0.01"
                value={renewalForm.customPrice}
                onChange={(e) => update("customPrice", e.target.value)}
                placeholder="Override plan price..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Promo Bonus Days</label>
              <input
                type="number"
                min="0"
                value={renewalForm.bonusDays}
                onChange={(e) => update("bonusDays", e.target.value)}
                placeholder="e.g., 3"
                style={inputStyle}
              />
            </div>
          </div>

          <fieldset
            style={{
              border: `1px dashed ${theme.border}`,
              borderRadius: "8px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
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
              💳 PAYMENT DETAILS
            </legend>

            <div
              style={{
                background: theme.bg,
                borderRadius: 8,
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: `1px solid ${theme.border}`,
              }}
            >
              <span style={{ color: theme.textMuted, fontSize: 13 }}>Total Payment</span>
              <span style={{ color: theme.primary, fontWeight: "bold", fontSize: 18 }}>
                ₱{total}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label style={labelStyle}>💵 Cash</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={renewalForm.cashAmount}
                  onChange={(e) => update("cashAmount", e.target.value)}
                  placeholder="0.00"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>📱 GCash</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={renewalForm.gcashAmount}
                  onChange={(e) => update("gcashAmount", e.target.value)}
                  placeholder="0.00"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label style={labelStyle}>🟢 Maya</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={renewalForm.mayaAmount}
                  onChange={(e) => update("mayaAmount", e.target.value)}
                  placeholder="0.00"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>💳 Debit Card</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={renewalForm.debitAmount}
                  onChange={(e) => update("debitAmount", e.target.value)}
                  placeholder="0.00"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label style={labelStyle}>💳 Credit Card</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={renewalForm.creditAmount}
                  onChange={(e) => update("creditAmount", e.target.value)}
                  placeholder="0.00"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>🔖 Reference Number</label>
                <input
                  type="text"
                  value={renewalForm.referenceNumber}
                  onChange={(e) => update("referenceNumber", e.target.value)}
                  placeholder="e.g., GCash ref #"
                  style={inputStyle}
                />
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            style={{
              padding: "16px",
              backgroundColor: theme.primary,
              color: theme.primaryText,
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              letterSpacing: "0.5px",
            }}
          >
            🔄 Confirm Renewal
          </button>
        </form>
      </div>
    </div>
  );
}

export default RenewalModal;
