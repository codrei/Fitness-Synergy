import React, { useState } from "react";

function AddEditModal({
  theme,
  editingId,
  cancelEdit,
  setShowMemberModal,
  handleSubmit,
  plans,
  promos = [],
  memberForm,
  setMemberForm,
}) {
  const [submitting, setSubmitting] = useState(false);
  const update = (field, value) =>
    setMemberForm((f) => ({ ...f, [field]: value }));

  const onSubmit = async (e) => {
    setSubmitting(true);
    try { await handleSubmit(e); } finally { setSubmitting(false); }
  };

  const selectedPlanObj = plans.find(
    (p) => String(p.plan_id) === String(memberForm.plan),
  );
  const isLongTermPlan = selectedPlanObj
    ? parseInt(selectedPlanObj.duration_days, 10) > 1
    : false;

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
    transition: "border-color 0.2s ease",
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
          width: "550px",
          minHeight: "400px",
          maxHeight: "90vh",
          overflowY: "auto",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease-in-out",
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
            {editingId
              ? "✏️ Edit Profile & Status"
              : "➕ Register System Member"}
          </h2>
          <button
            onClick={() => {
              setShowMemberModal(false);
              cancelEdit();
            }}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ❌
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
          <div>
            <label style={labelStyle}>Membership Plan</label>
            <select
              value={memberForm.plan}
              onChange={(e) => {
                const selectedId = e.target.value;
                const matchedPlan = plans.find(
                  (p) => String(p.plan_id) === String(selectedId),
                );
                setMemberForm((f) => ({
                  ...f,
                  plan: selectedId,
                  customPrice: matchedPlan ? matchedPlan.price : f.customPrice,
                  promoId: "",
                  bonusDays: 0,
                }));
              }}
              required
              style={inputStyle}
            >
              <option value="" disabled>
                Select a Plan...
              </option>
              {plans.filter((p) => String(p.plan_id) !== "1").map((plan) => (
                <option key={plan.plan_id} value={plan.plan_id}>
                  {plan.plan_name} - ₱{plan.price}
                </option>
              ))}
            </select>
          </div>

          {promos.length > 0 && (
            <div>
              <label style={labelStyle}>🎁 Apply Promo (Optional)</label>
              <select
                value={memberForm.promoId || ""}
                onChange={(e) => {
                  const id = e.target.value;
                  const p = promos.find((pr) => String(pr.promo_id) === id);
                  if (!p) {
                    const basePlan = plans.find((pl) => String(pl.plan_id) === String(memberForm.plan));
                    setMemberForm((f) => ({ ...f, promoId: "", bonusDays: 0, customPrice: basePlan ? basePlan.price : f.customPrice }));
                    return;
                  }
                  const basePlan = plans.find((pl) => String(pl.plan_id) === String(memberForm.plan));
                  const basePrice = parseFloat(basePlan?.price || 0);
                  const discount = parseFloat(p.discount_amount || 0);
                  setMemberForm((f) => ({
                    ...f,
                    promoId: id,
                    bonusDays: p.bonus_days,
                    customPrice: p.is_free == 1
                      ? "0"
                      : discount > 0
                        ? String(Math.max(0, basePrice - discount))
                        : basePlan ? basePlan.price : f.customPrice,
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label style={labelStyle}>Custom Price Override (₱)</label>
              <input
                type="number"
                step="0.01"
                value={memberForm.customPrice}
                onChange={(e) => update("customPrice", e.target.value)}
                placeholder="Override base price..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Promo Bonus Days</label>
              <input
                type="number"
                value={memberForm.bonusDays}
                onChange={(e) => update("bonusDays", e.target.value)}
                placeholder="e.g., 3"
                min="0"
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={memberForm.name}
                onChange={(e) => update("name", e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Contact Number</label>
              <input
                type="text"
                value={memberForm.contactNumber}
                onChange={(e) => update("contactNumber", e.target.value)}
                placeholder="e.g., 0917XXXXXXX"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Age</label>
              <input
                type="number"
                min="1"
                max="120"
                value={memberForm.age}
                onChange={(e) => update("age", e.target.value)}
                placeholder="e.g., 25"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Complete Address</label>
            <input
              type="text"
              value={memberForm.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="House No., Street, Barangay, City"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Facebook / Social Media (Optional)</label>
            <input
              type="text"
              value={memberForm.facebook}
              onChange={(e) => update("facebook", e.target.value)}
              placeholder="facebook.com/username or @handle"
              style={inputStyle}
            />
          </div>

          {isLongTermPlan && (
            <fieldset
              style={{
                border: `1px dashed ${theme.border}`,
                borderRadius: "8px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                margin: "5px 0",
                animation: "fadeIn 0.3s ease-in-out",
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
                LONG-TERM CONTRACT PROFILE
              </legend>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div>
                  <label style={labelStyle}>Date of Birth</label>
                  <input
                    type="date"
                    value={memberForm.dob}
                    onChange={(e) => update("dob", e.target.value)}
                    required={isLongTermPlan}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select
                    value={memberForm.gender}
                    onChange={(e) => update("gender", e.target.value)}
                    required={isLongTermPlan}
                    style={inputStyle}
                  >
                    <option value="">Select Gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Occupation</label>
                <input
                  type="text"
                  value={memberForm.occupation}
                  onChange={(e) => update("occupation", e.target.value)}
                  placeholder="Profession"
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div>
                  <label style={labelStyle}>Emergency Contact Name</label>
                  <input
                    type="text"
                    value={memberForm.emergencyContactName}
                    onChange={(e) =>
                      update("emergencyContactName", e.target.value)
                    }
                    placeholder="Full Name"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Emergency Contact #</label>
                  <input
                    type="text"
                    value={memberForm.emergencyContactNumber}
                    onChange={(e) =>
                      update("emergencyContactNumber", e.target.value)
                    }
                    placeholder="Phone number"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={labelStyle}>Discount / Promo Group</label>
                  <select
                    value={memberForm.discountType}
                    onChange={(e) =>
                      setMemberForm((f) => ({
                        ...f,
                        discountType:     e.target.value,
                        discountId:       e.target.value === "None" ? "" : f.discountId,
                        discountIdType:   e.target.value === "None" ? "" : f.discountIdType,
                        discountSchoolName: e.target.value !== "Student" ? "" : f.discountSchoolName,
                      }))
                    }
                    style={inputStyle}
                  >
                    <option value="None">Regular (No Promo)</option>
                    <option value="Student">Student Promo</option>
                    <option value="Senior">Senior Citizen Promo</option>
                  </select>
                </div>

                {memberForm.discountType !== "None" && (
                  <div>
                    <label style={labelStyle}>ID Type</label>
                    <select
                      value={memberForm.discountIdType}
                      onChange={(e) => update("discountIdType", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Select ID Type...</option>
                      <option value="School ID">School ID</option>
                      <option value="Senior Citizen ID">Senior Citizen ID</option>
                      <option value="PWD ID">PWD ID</option>
                      <option value="Government ID">Government ID</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
              </div>

              {memberForm.discountType !== "None" && (
                <div style={{ display: "grid", gridTemplateColumns: memberForm.discountType === "Student" ? "1fr 1fr" : "1fr", gap: "15px" }}>
                  <div>
                    <label style={labelStyle}>
                      {memberForm.discountType === "Student" ? "Student ID Number" : "Senior Citizen ID Number"}
                    </label>
                    <input
                      type="text"
                      value={memberForm.discountId}
                      onChange={(e) => update("discountId", e.target.value)}
                      placeholder="Enter ID number"
                      required={memberForm.discountType !== "None"}
                      style={inputStyle}
                    />
                  </div>
                  {memberForm.discountType === "Student" && (
                    <div>
                      <label style={labelStyle}>School Name</label>
                      <input
                        type="text"
                        value={memberForm.discountSchoolName}
                        onChange={(e) => update("discountSchoolName", e.target.value)}
                        placeholder="e.g., University of Santo Tomas"
                        style={inputStyle}
                      />
                    </div>
                  )}
                </div>
              )}

              <div style={{ borderTop: `1px dashed ${theme.border}`, paddingTop: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold", color: theme.text }}>
                  <input
                    type="checkbox"
                    checked={memberForm.isInstallment || false}
                    onChange={(e) => update("isInstallment", e.target.checked)}
                    style={{ width: "16px", height: "16px" }}
                  />
                  💰 Installment Plan
                </label>
                {memberForm.isInstallment && (
                  <div style={{ marginTop: "12px" }}>
                    <label style={labelStyle}>Total Contract Amount (₱)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={memberForm.installmentTotal || ""}
                      onChange={(e) => update("installmentTotal", e.target.value)}
                      placeholder="e.g., 5000.00"
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>
            </fieldset>
          )}

          {!editingId && (
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
                  value={memberForm.paymentMethod}
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

              {memberForm.isInstallment && (
                <div>
                  <label style={labelStyle}>💰 Downpayment Amount (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={memberForm.paymentAmount}
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
                  value={memberForm.referenceNumber}
                  onChange={(e) => update("referenceNumber", e.target.value)}
                  placeholder="e.g., GCash ref #"
                  style={inputStyle}
                />
              </div>
            </fieldset>
          )}

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
            {submitting
              ? "Saving…"
              : editingId
              ? "💾 Save Changes & Update"
              : "🚀 Complete Registration Process"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddEditModal;
