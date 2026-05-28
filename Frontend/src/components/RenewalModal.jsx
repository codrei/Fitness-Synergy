import React from "react";

function RenewalModal({
  theme,
  member,
  plans,
  promos = [],
  renewalForm,
  setRenewalForm,
  onSubmit,
  onClose,
}) {
  const update = (field, value) =>
    setRenewalForm((f) => ({ ...f, [field]: value }));

  const membershipPlans = plans.filter((p) => String(p.plan_id) !== "1");

  const selectedPlanObj = membershipPlans.find(
    (p) => String(p.plan_id) === String(renewalForm.planId),
  );
  const isLongTermPlan = selectedPlanObj
    ? parseInt(selectedPlanObj.duration_days, 10) > 1
    : false;

  // Compute renewal preview values
  const totalDays = selectedPlanObj
    ? parseInt(selectedPlanObj.duration_days, 10) + parseInt(renewalForm.bonusDays || 0, 10)
    : 0;
  const newExpiryDate = selectedPlanObj
    ? (() => {
        const d = new Date();
        d.setDate(d.getDate() + totalDays);
        return d.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
      })()
    : null;
  const finalPrice =
    renewalForm.customPrice !== "" && renewalForm.customPrice !== null && renewalForm.customPrice !== undefined
      ? parseFloat(renewalForm.customPrice)
      : parseFloat(selectedPlanObj?.price || 0);

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
          width: "520px",
          maxHeight: "90vh",
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
            marginBottom: "6px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px", color: theme.text }}>
            Renew Membership
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "22px",
              cursor: "pointer",
              color: theme.text,
              lineHeight: 1,
              padding: "2px 6px",
            }}
          >
            ×
          </button>
        </div>
        <p style={{ margin: "0 0 20px 0", color: theme.textMuted, fontSize: "14px" }}>
          Renewing for:{" "}
          <strong style={{ color: theme.text }}>{member.full_name}</strong>
        </p>

        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          {/* Plan selection */}
          <div>
            <label style={labelStyle}>Membership Plan</label>
            <select
              value={renewalForm.planId}
              onChange={(e) => {
                const id = e.target.value;
                const matched = membershipPlans.find(
                  (p) => String(p.plan_id) === id,
                );
                setRenewalForm((f) => ({
                  ...f,
                  planId: id,
                  customPrice: matched ? matched.price : f.customPrice,
                  promoId: "",
                  bonusDays: 0,
                }));
              }}
              required
              style={inputStyle}
            >
              <option value="" disabled>Select a Plan...</option>
              {membershipPlans.map((p) => (
                <option key={p.plan_id} value={p.plan_id}>
                  {p.plan_name} — ₱{p.price}
                </option>
              ))}
            </select>
          </div>

          {/* Promo selection */}
          {promos.length > 0 && (
            <div>
              <label style={labelStyle}>
                Apply Promo{" "}
                <span style={{ color: theme.textMuted, fontWeight: "normal", textTransform: "none", fontSize: "11px" }}>
                  (Optional)
                </span>
              </label>
              <select
                value={renewalForm.promoId || ""}
                onChange={(e) => {
                  const id = e.target.value;
                  const p = promos.find((pr) => String(pr.promo_id) === id);
                  if (!p) {
                    setRenewalForm((f) => ({
                      ...f,
                      promoId: "",
                      bonusDays: 0,
                      customPrice: selectedPlanObj ? selectedPlanObj.price : f.customPrice,
                    }));
                    return;
                  }
                  const basePrice = parseFloat(selectedPlanObj?.price || 0);
                  const discount = parseFloat(p.discount_amount || 0);
                  setRenewalForm((f) => ({
                    ...f,
                    promoId: id,
                    bonusDays: p.bonus_days,
                    customPrice:
                      p.is_free == 1
                        ? "0"
                        : discount > 0
                          ? String(Math.max(0, basePrice - discount))
                          : selectedPlanObj
                            ? selectedPlanObj.price
                            : f.customPrice,
                  }));
                }}
                style={inputStyle}
              >
                <option value="">— No Promo —</option>
                {promos.map((p) => (
                  <option key={p.promo_id} value={p.promo_id}>
                    {p.is_free == 1
                      ? `${p.promo_name} (FREE)`
                      : parseInt(p.bonus_days) > 0 && parseFloat(p.discount_amount) > 0
                        ? `${p.promo_name} (+${p.bonus_days} days, ₱${p.discount_amount} off)`
                        : parseInt(p.bonus_days) > 0
                          ? `${p.promo_name} (+${p.bonus_days} days)`
                          : `${p.promo_name} (₱${p.discount_amount} off)`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price & Bonus Days */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={labelStyle}>Final Price Override (₱)</label>
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
              <label style={labelStyle}>
                Bonus Days
                {renewalForm.promoId && (
                  <span style={{ color: theme.primary, marginLeft: 6, fontSize: "10px", fontWeight: "normal", textTransform: "none" }}>
                    (set by promo)
                  </span>
                )}
              </label>
              <input
                type="number"
                min="0"
                value={renewalForm.bonusDays}
                onChange={(e) => update("bonusDays", e.target.value)}
                placeholder="e.g., 3"
                readOnly={!!renewalForm.promoId}
                style={{ ...inputStyle, opacity: renewalForm.promoId ? 0.6 : 1 }}
              />
            </div>
          </div>

          {/* Renewal Preview — appears once a plan is selected */}
          {selectedPlanObj && (
            <div
              style={{
                backgroundColor: theme.bg,
                border: `1px solid ${theme.border}`,
                borderRadius: "10px",
                padding: "14px 18px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "10px",
              }}
            >
              <div>
                <div style={{ fontSize: "10px", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                  Duration
                </div>
                <div style={{ fontWeight: "bold", color: theme.text, fontSize: "15px" }}>
                  {totalDays} day{totalDays !== 1 ? "s" : ""}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                  New Expiry
                </div>
                <div style={{ fontWeight: "bold", color: theme.primary, fontSize: "13px" }}>
                  {newExpiryDate}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                  Amount
                </div>
                <div style={{ fontWeight: "bold", color: finalPrice === 0 ? "#00e676" : "#f59e0b", fontSize: "15px" }}>
                  {finalPrice === 0
                    ? "FREE"
                    : `₱${finalPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
                </div>
              </div>
            </div>
          )}

          {/* Installment toggle (long-term plans) */}
          {isLongTermPlan && (
            <div style={{ borderTop: `1px dashed ${theme.border}`, paddingTop: "16px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: theme.text,
                }}
              >
                <input
                  type="checkbox"
                  checked={renewalForm.isInstallment || false}
                  onChange={(e) => update("isInstallment", e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                Installment Plan
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

          {/* Payment details */}
          <fieldset
            style={{
              border: `1px dashed ${theme.border}`,
              borderRadius: "8px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              margin: "0",
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
                value={renewalForm.paymentMethod}
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

            {renewalForm.isInstallment && (
              <div>
                <label style={labelStyle}>Downpayment Amount (₱)</label>
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
              <label style={labelStyle}>Reference Number</label>
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
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              letterSpacing: "0.5px",
            }}
          >
            Confirm Renewal
          </button>
        </form>
      </div>
    </div>
  );
}

export default RenewalModal;
