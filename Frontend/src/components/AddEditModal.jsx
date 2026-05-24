import React from "react";

function AddEditModal({
  theme,
  editingId,
  cancelEdit,
  setShowMemberModal,
  handleSubmit,
  newName,
  setNewName,
  newPlan,
  setNewPlan,
  plans,
  address,
  setAddress,
  contactNumber,
  setContactNumber,
  dob,
  setDob,
  gender,
  setGender,
  occupation,
  setOccupation,
  emergencyContactName,
  setEmergencyContactName,
  emergencyContactNumber,
  setEmergencyContactNumber,
  contractId,
  setContractId,
  discountType,
  setDiscountType,
  discountId,
  setDiscountId,
  // NEW PROMO PROPS PASSED FROM PARENT STATE
  customPrice,
  setCustomPrice,
  bonusDays,
  setBonusDays,
}) {
  const selectedPlanObj = plans.find(
    (p) => String(p.plan_id) === String(newPlan),
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
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            flex: 1,
          }}
        >
          {/* MEMBERSHIP PLAN SELECTION */}
          <div>
            <label style={labelStyle}>Membership Plan</label>
            <select
              value={newPlan}
              onChange={(e) => {
                const selectedId = e.target.value;
                setNewPlan(selectedId);

                // Automatically find and set the price default when plan shifts
                const matchedPlan = plans.find(
                  (p) => String(p.plan_id) === String(selectedId),
                );
                if (matchedPlan) {
                  setCustomPrice(matchedPlan.price);
                }
              }}
              required
              style={inputStyle}
            >
              <option value="" disabled>
                Select a Plan...
              </option>
              {plans.map((plan) => (
                <option key={plan.plan_id} value={plan.plan_id}>
                  {plan.plan_name} - ₱{plan.price}
                </option>
              ))}
            </select>
          </div>

          {/* DYNAMIC PROMO FIELD ADJUSTMENTS */}
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
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="Override base price..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Promo Bonus Days</label>
              <input
                type="number"
                value={bonusDays}
                onChange={(e) => setBonusDays(e.target.value)}
                placeholder="e.g., 3"
                min="0"
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Contact Number</label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g., 0917XXXXXXX"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Complete Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House No., Street, Barangay, City"
              required
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
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required={isLongTermPlan}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div>
                  <label style={labelStyle}>Occupation</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Profession"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Contract ID #</label>
                  <input
                    type="text"
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value)}
                    placeholder="Unique Contract number"
                    required={isLongTermPlan}
                    style={inputStyle}
                  />
                </div>
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
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Full Name"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Emergency Contact #</label>
                  <input
                    type="text"
                    value={emergencyContactNumber}
                    onChange={(e) => setEmergencyContactNumber(e.target.value)}
                    placeholder="Phone number"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div>
                  <label style={labelStyle}>Discount / Promo Group</label>
                  <select
                    value={discountType}
                    onChange={(e) => {
                      setDiscountType(e.target.value);
                      if (e.target.value === "None") setDiscountId("");
                    }}
                    style={inputStyle}
                  >
                    <option value="None">Regular (No Promo)</option>
                    <option value="Student">Student Promo</option>
                    <option value="Senior">Senior Citizen Promo</option>
                  </select>
                </div>

                {discountType !== "None" && (
                  <div>
                    <label style={labelStyle}>
                      {discountType === "Student"
                        ? "Student ID Number"
                        : "Senior Citizen ID Number"}
                    </label>
                    <input
                      type="text"
                      value={discountId}
                      onChange={(e) => setDiscountId(e.target.value)}
                      placeholder="Enter Identification ID"
                      required={discountType !== "None"}
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>
            </fieldset>
          )}

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
              marginTop: "auto",
              fontSize: "14px",
              letterSpacing: "0.5px",
            }}
          >
            {editingId
              ? "💾 Save Changes & Update"
              : "🚀 Complete Registration Process"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddEditModal;
