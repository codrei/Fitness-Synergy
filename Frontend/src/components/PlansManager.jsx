import { useState, useEffect } from "react";
import { apiFetch } from "../api";

const EMPTY = { plan_name: "", price: "", duration_days: "" };

function PlansManager({ theme }) {
  const [plans, setPlans]   = useState([]);
  const [modal, setModal]   = useState(null); // null | { mode: "add"|"edit", form }
  const [deleting, setDeleting] = useState(null);
  const [error, setError]   = useState("");

  const load = async () => {
    const res = await apiFetch("get_plans.php").then((r) => r.json());
    setPlans(Array.isArray(res) ? res : []);
  };

  useEffect(() => { load(); }, []);

  const openAdd  = ()     => setModal({ mode: "add",  form: { ...EMPTY } });
  const openEdit = (plan) => setModal({ mode: "edit", form: { plan_id: plan.plan_id, plan_name: plan.plan_name, price: plan.price, duration_days: plan.duration_days } });
  const closeModal = () => { setModal(null); setError(""); };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    const { mode, form } = modal;
    const endpoint = mode === "add" ? "add_plan.php" : "update_plan.php";
    const res = await apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(form),
    }).then((r) => r.json());

    if (res.success) { closeModal(); load(); }
    else setError(res.error || "Failed to save.");
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete plan "${plan.plan_name}"? This cannot be undone.`)) return;
    setDeleting(plan.plan_id);
    const res = await apiFetch("delete_plan.php", {
      method: "POST",
      body: JSON.stringify({ plan_id: plan.plan_id }),
    }).then((r) => r.json());
    setDeleting(null);
    if (res.success) load();
    else alert(res.error || "Delete failed.");
  };

  const inputStyle = {
    width: "100%", padding: "10px", borderRadius: "6px",
    border: `1px solid ${theme.border}`, backgroundColor: theme.bg,
    color: theme.text, outline: "none", boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: "12px", color: theme.textMuted, textTransform: "uppercase",
    fontWeight: "bold", display: "block", marginBottom: "5px",
  };

  return (
    <div style={{ padding: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "26px" }}>📋 Plans Management</h1>
        <button
          onClick={openAdd}
          style={{
            padding: "10px 20px", backgroundColor: theme.primary, color: theme.primaryText,
            border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px",
          }}
        >
          ➕ Add New Plan
        </button>
      </div>

      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: theme.sidebar }}>
              {["Plan Name", "Price", "Duration", ""].map((h) => (
                <th key={h} style={{ padding: "13px 20px", textAlign: "left", color: theme.textMuted, fontSize: "12px", textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 && (
              <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: theme.textMuted }}>No plans found.</td></tr>
            )}
            {plans.map((plan, i) => (
              <tr key={plan.plan_id} style={{ borderTop: `1px solid ${theme.border}`, background: i % 2 !== 0 ? `${theme.border}22` : "transparent" }}>
                <td style={{ padding: "14px 20px", fontWeight: "bold" }}>
                  {plan.plan_name}
                  {String(plan.plan_id) === "1" && (
                    <span style={{ marginLeft: "8px", fontSize: "11px", color: theme.textMuted, fontWeight: "normal" }}>(Walk-in default)</span>
                  )}
                </td>
                <td style={{ padding: "14px 20px", color: theme.primary, fontWeight: "bold" }}>
                  ₱{parseFloat(plan.price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: "14px 20px", color: theme.textMuted }}>
                  {plan.duration_days} day{plan.duration_days !== 1 ? "s" : ""}
                </td>
                <td style={{ padding: "14px 20px", textAlign: "right" }}>
                  <button
                    onClick={() => openEdit(plan)}
                    style={{ padding: "7px 14px", backgroundColor: "#f59e0b", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "12px", marginRight: "8px" }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan)}
                    disabled={deleting === plan.plan_id}
                    style={{ padding: "7px 14px", backgroundColor: theme.danger, color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "12px", opacity: deleting === plan.plan_id ? 0.6 : 1 }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <div
          onClick={closeModal}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: theme.surface, padding: "30px", borderRadius: "12px", width: "420px", border: `1px solid ${theme.border}`, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "18px" }}>
                {modal.mode === "add" ? "➕ Add New Plan" : "✏️ Edit Plan"}
              </h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>❌</button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Plan Name</label>
                <input
                  type="text" required value={modal.form.plan_name}
                  onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, plan_name: e.target.value } }))}
                  placeholder="e.g., Monthly Plan" style={inputStyle}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Price (₱)</label>
                  <input
                    type="number" step="0.01" min="0" required value={modal.form.price}
                    onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, price: e.target.value } }))}
                    placeholder="0.00" style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Duration (days)</label>
                  <input
                    type="number" min="1" required value={modal.form.duration_days}
                    onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, duration_days: e.target.value } }))}
                    placeholder="e.g., 30" style={inputStyle}
                  />
                </div>
              </div>
              {error && <div style={{ color: theme.danger, fontSize: "13px" }}>{error}</div>}
              <button
                type="submit"
                style={{ padding: "13px", backgroundColor: theme.primary, color: theme.primaryText, border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
              >
                💾 Save Plan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlansManager;
