import { useState, useEffect } from "react";
import { apiFetch } from "../api";

const EMPTY = {
  plan_name: "",
  price: "",
  duration_days: "",
};

function PlansManager({ theme }) {
  const [plans, setPlans] = useState([]);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await apiFetch("get_plans.php").then((r) => r.json());
    setPlans(Array.isArray(res) ? res : []);
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => setModal({ mode: "add", form: { ...EMPTY } });
  const openEdit = (plan) =>
    setModal({
      mode: "edit",
      form: {
        plan_id: plan.plan_id,
        plan_name: plan.plan_name,
        price: plan.price,
        duration_days: plan.duration_days,
      },
    });
  const closeModal = () => {
    setModal(null);
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    const { mode, form } = modal;
    const endpoint = mode === "add" ? "add_plan.php" : "update_plan.php";
    const res = await apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(form),
    }).then((r) => r.json());
    if (res.success) {
      closeModal();
      load();
    } else setError(res.error || "Failed to save.");
  };

  const handleDelete = async (plan) => {
    if (
      !window.confirm(`Delete plan "${plan.plan_name}"? This cannot be undone.`)
    )
      return;
    setDeleting(plan.plan_id);
    const res = await apiFetch("delete_plan.php", {
      method: "POST",
      body: JSON.stringify({ plan_id: plan.plan_id }),
    }).then((r) => r.json());
    setDeleting(null);
    if (res.success) load();
    else alert(res.error || "Delete failed.");
  };

  // Separate plans into categories
  const walkinPlan = plans.filter((p) => parseInt(p.duration_days) <= 1);
  const freeTrialPlans = plans.filter(
    (p) => parseInt(p.duration_days) > 1 && parseFloat(p.price) === 0,
  );
  const standardPlans = plans.filter(
    (p) =>
      parseInt(p.duration_days) > 1 &&
      parseFloat(p.price) > 0 &&
      !p.plan_name.toLowerCase().includes("student") &&
      !p.plan_name.toLowerCase().includes("senior"),
  );
  const studentSeniorPlans = plans.filter(
    (p) =>
      parseInt(p.duration_days) > 1 &&
      parseFloat(p.price) > 0 &&
      (p.plan_name.toLowerCase().includes("student") ||
        p.plan_name.toLowerCase().includes("senior")),
  );

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
  const labelStyle = {
    fontSize: "12px",
    color: theme.textMuted,
    textTransform: "uppercase",
    fontWeight: "bold",
    display: "block",
    marginBottom: "5px",
  };

  const PlanTable = ({ title, plans, accent }) => (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{ width: 4, height: 20, background: accent, borderRadius: 2 }}
        />
        <h2 style={{ margin: 0, fontSize: 18, color: theme.text }}>{title}</h2>
        <span
          style={{
            background: accent + "22",
            color: accent,
            fontSize: 11,
            padding: "2px 10px",
            borderRadius: 20,
            fontWeight: "bold",
          }}
        >
          {plans.length} plan{plans.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: theme.sidebar }}>
              {["Plan Name", "Price", "Duration", "Actions"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 20px",
                    textAlign: "left",
                    color: theme.textMuted,
                    fontSize: 12,
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: theme.textMuted,
                  }}
                >
                  No plans found.
                </td>
              </tr>
            )}
            {plans.map((plan, i) => (
              <tr
                key={plan.plan_id}
                style={{
                  borderTop: `1px solid ${theme.border}`,
                  background: i % 2 !== 0 ? `${theme.border}22` : "transparent",
                }}
              >
                {/* FIX: Added explicit theme.text color to the cell styling */}
                <td
                  style={{
                    padding: "14px 20px",
                    fontWeight: "bold",
                    color: theme.text,
                  }}
                >
                  {plan.plan_name}
                  {String(plan.plan_id) === "1" && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        color: theme.textMuted,
                        fontWeight: "normal",
                      }}
                    >
                      (Walk-in default)
                    </span>
                  )}
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    color: parseFloat(plan.price) === 0 ? "#00e676" : accent,
                    fontWeight: "bold",
                  }}
                >
                  {parseFloat(plan.price) === 0 ? (
                    <span
                      style={{
                        backgroundColor: "#00e67622",
                        border: "1px solid #00e676",
                        borderRadius: 6,
                        padding: "2px 10px",
                        fontSize: 12,
                        letterSpacing: "0.5px",
                      }}
                    >
                      FREE
                    </span>
                  ) : (
                    <>
                      ₱
                      {parseFloat(plan.price).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </>
                  )}
                </td>
                <td style={{ padding: "14px 20px", color: theme.textMuted }}>
                  {plan.duration_days} day{plan.duration_days !== 1 ? "s" : ""}
                </td>
                <td style={{ padding: "14px 20px", textAlign: "right" }}>
                  <button
                    onClick={() => openEdit(plan)}
                    style={{
                      padding: "7px 14px",
                      backgroundColor: "#f59e0b",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "12px",
                      marginRight: 8,
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan)}
                    disabled={deleting === plan.plan_id}
                    style={{
                      padding: "7px 14px",
                      backgroundColor: theme.danger,
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "12px",
                      opacity: deleting === plan.plan_id ? 0.6 : 1,
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 30 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        {/* FIX: Added explicit theme.text color to heading */}
        <h1 style={{ margin: 0, fontSize: 26, color: theme.text }}>
          Plans Management
        </h1>
        <button
          onClick={openAdd}
          style={{
            padding: "10px 20px",
            backgroundColor: theme.primary,
            color: theme.primaryText,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 14,
          }}
        >
          Add New Plan
        </button>
      </div>

      {/* Walk-in Plan */}
      <PlanTable
        title="Walk-in / Daily Plan"
        plans={walkinPlan}
        accent="#f59e0b"
      />

      {/* Free Trial Plans */}
      <PlanTable
        title="Free Trial Plans"
        plans={freeTrialPlans}
        accent="#00e676"
      />

      {/* Standard Plans */}
      <PlanTable
        title="Standard Plans"
        plans={standardPlans}
        accent={theme.primary}
      />

      {/* Student / Senior Plans */}
      <PlanTable
        title="Student / Senior Plans"
        plans={studentSeniorPlans}
        accent="#00e676"
      />

      {/* Add / Edit Modal */}
      {modal && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.surface,
              padding: 30,
              borderRadius: 12,
              width: 420,
              border: `1px solid ${theme.border}`,
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              {/* FIX: Added explicit theme.text color to modal title */}
              <h2 style={{ margin: 0, fontSize: 18, color: theme.text }}>
                {modal.mode === "add" ? "Add New Plan" : "Edit Plan"}
              </h2>
              {/* FIX: Styled modal close cross to adjust automatically to the active theme */}
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: theme.text,
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSave}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div>
                <label style={labelStyle}>Plan Name</label>
                <input
                  type="text"
                  required
                  value={modal.form.plan_name}
                  onChange={(e) =>
                    setModal((m) => ({
                      ...m,
                      form: { ...m.form, plan_name: e.target.value },
                    }))
                  }
                  placeholder="e.g., Standard - 1 Month"
                  style={inputStyle}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={modal.form.price}
                    onChange={(e) =>
                      setModal((m) => ({
                        ...m,
                        form: { ...m.form, price: e.target.value },
                      }))
                    }
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Duration (days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={modal.form.duration_days}
                    onChange={(e) =>
                      setModal((m) => ({
                        ...m,
                        form: { ...m.form, duration_days: e.target.value },
                      }))
                    }
                    placeholder="e.g., 30"
                    style={inputStyle}
                  />
                </div>
              </div>
              {/* Category preview hint */}
              {modal.form.plan_name && modal.form.duration_days && modal.form.price !== "" && (() => {
                const dur = parseInt(modal.form.duration_days);
                const price = parseFloat(modal.form.price);
                const name = modal.form.plan_name.toLowerCase();
                let label, color;
                if (dur <= 1) { label = "Walk-in / Daily Plan"; color = "#f59e0b"; }
                else if (price === 0) { label = "Free Trial Plans"; color = "#00e676"; }
                else if (name.includes("student") || name.includes("senior")) { label = "Student / Senior Plans"; color = "#00e676"; }
                else { label = "Standard Plans"; color = theme.primary; }
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: theme.textMuted, backgroundColor: `${color}12`, border: `1px solid ${color}33`, borderRadius: 6, padding: "7px 12px" }}>
                    <span>Will appear under:</span>
                    <strong style={{ color }}>{label}</strong>
                  </div>
                );
              })()}

              {error && (
                <div style={{ color: theme.danger, fontSize: 13 }}>{error}</div>
              )}
              <button
                type="submit"
                style={{
                  padding: 13,
                  backgroundColor: theme.primary,
                  color: theme.primaryText,
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 14,
                }}
              >
                Save Plan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlansManager;
