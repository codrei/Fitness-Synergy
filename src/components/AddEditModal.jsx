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
          width: "400px",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0 }}>
            {editingId ? "✏️ Edit Member" : "➕ Register Member"}
          </h2>
          <button
            onClick={() => {
              setShowMemberModal(false);
              cancelEdit();
            }}
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
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <div>
            <label
              style={{
                fontSize: "12px",
                color: theme.textMuted,
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "5px",
                borderRadius: "6px",
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.bg,
                color: theme.text,
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "12px",
                color: theme.textMuted,
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              Membership Plan
            </label>
            <select
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "5px",
                borderRadius: "6px",
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.bg,
                color: theme.text,
              }}
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
          <button
            type="submit"
            style={{
              padding: "14px",
              backgroundColor: theme.primary,
              color: theme.primaryText,
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            {editingId ? "Save Changes & Renew" : "Process Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddEditModal;
