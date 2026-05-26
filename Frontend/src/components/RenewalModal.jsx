import React from "react";

function RenewalModal({ theme, member, plans, promos = [], renewalForm, setRenewalForm, onSubmit, onClose }) {
  const update = (field, value) => setRenewalForm((f) => ({ ...f, [field]: value }));

  const membershipPlans = plans.filter((p) => String(p.plan_id) !== "1");

  const selectedPlanObj = membershipPlans.find((p) => String(p.plan_id) === String(renewalForm.planId));
  const isLongTermPlan = selectedPlanObj ? parseInt(selectedPlanObj.duration_days, 10) > 1 : false;


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

          {promos.length > 0 && (
            <div>
              <label style={labelStyle}>🎁 Apply Promo (Optional)</label>
              <select
                defaultValue=""
                onChange={(e) => {
                  const p = promos.find((pr) => String(pr.promo_id) === e.target.value);
                  update("bonusDays", p ? p.bonus_days : 0);
                }}
                style={inputStyle}
              >
                <option value="">— No Promo —</option>
                {promos.map((p) => (
                  <option key={p.promo_id} value={p.promo_id}>
                    {p.promo_name} (+{p.bonus_days} days)
                  </option>
                ))}
              </select>
            </div>
          )}

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

          {isLongTermPlan && (
            <div style={{ borderTop: `1px dashed ${theme.border}`, paddingTop: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold", color: theme.text }}>
                <input
                  type="checkbox"
                  checked={renewalForm.isInstallment || false}
                  onChange={(e) => update("isInstallment", e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                💰 Installment Plan
              </label>
              {renewalForm.isInstallment && (
                <div style={{ marginTop: "12px" }}>
                  <label style={labelStyle}>Total Contract Amount (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={renewalForm.installmentTotal || ""}
                    onChange={(e) => update("installmentTotal", e.target.value)}
                    placeholder="e.g., 5000.00"
                    style={inputStyle}
                  />
                </div>
              )}
            </div>
          )}

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
              💳 PAYMENT DETAILS
            </legend>

            <div>
              <label style={labelStyle}>💳 Payment Method</label>
              <select
                value={renewalForm.paymentMethod}
                onChange={(e) => update("paymentMethod", e.target.value)}
                style={inputStyle}
              >
                <option value="Cash">💵 Cash</option>
                <option value="GCash">📱 GCash</option>
                <option value="Maya">🟢 Maya</option>
                <option value="Bank Transfer">🏦 Bank Transfer</option>
                <option value="Debit Card">💳 Debit Card</option>
                <option value="Credit Card">💳 Credit Card</option>
              </select>
            </div>

            {renewalForm.isInstallment && (
              <div>
                <label style={labelStyle}>💰 Downpayment Amount (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={renewalForm.paymentAmount}
                  onChange={(e) => update("paymentAmount", e.target.value)}
                  placeholder="Amount paid today..."
                  style={inputStyle}
                />
              </div>
            )}

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
