import { useState, useEffect } from "react";
import { apiFetch } from "../api";

const EMPTY = {
  promo_name: "",
  bonus_days: "0",
  discount_amount: "",
  is_free: false,
  description: "",
};

function PromosManager({ theme }) {
  const [promos, setPromos] = useState([]);
  const [modal, setModal] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await apiFetch("get_promos.php?all=1").then((r) => r.json());
    setPromos(Array.isArray(res) ? res : []);
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => setModal({ mode: "add", form: { ...EMPTY } });
  const openEdit = (p) =>
    setModal({
      mode: "edit",
      form: {
        promo_id: p.promo_id,
        promo_name: p.promo_name,
        bonus_days: p.bonus_days,
        discount_amount: p.discount_amount || "",
        is_free: p.is_free == 1,
        description: p.description || "",
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
    const endpoint = mode === "add" ? "add_promo.php" : "update_promo.php";
    const res = await apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(form),
    }).then((r) => r.json());
    if (res.success) {
      closeModal();
      load();
    } else setError(res.error || "Failed to save.");
  };

  const handleToggle = async (promo) => {
    setToggling(promo.promo_id);
    const res = await apiFetch("update_promo.php", {
      method: "POST",
      body: JSON.stringify({
        promo_id: promo.promo_id,
        promo_name: promo.promo_name,
        bonus_days: promo.bonus_days,
        discount_amount: promo.discount_amount || 0,
        is_free: promo.is_free || 0,
        description: promo.description || "",
        is_active: promo.is_active == 1 ? 0 : 1,
      }),
    }).then((r) => r.json());
    setToggling(null);
    if (res.success) load();
    else alert(res.error || "Toggle failed.");
  };

  const handleDelete = async (promo) => {
    if (
      !window.confirm(
        `Delete promo "${promo.promo_name}"? This cannot be undone.`,
      )
    )
      return;
    setDeleting(promo.promo_id);
    const res = await apiFetch("delete_promo.php", {
      method: "POST",
      body: JSON.stringify({ promo_id: promo.promo_id }),
    }).then((r) => r.json());
    setDeleting(null);
    if (res.success) load();
    else alert(res.error || "Delete failed.");
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
  const labelStyle = {
    fontSize: "12px",
    color: theme.textMuted,
    textTransform: "uppercase",
    fontWeight: "bold",
    display: "block",
    marginBottom: "5px",
  };

  return (
    <div style={{ padding: "30px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "26px" }}>Promos Management</h1>
        <button
          onClick={openAdd}
          style={{
            padding: "10px 20px",
            backgroundColor: theme.primary,
            color: theme.primaryText,
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          Add New Promo
        </button>
      </div>

      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: theme.sidebar }}>
              {["Promo Name", "Benefits", "Description", "Status", ""].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "13px 20px",
                      textAlign: "left",
                      color: theme.textMuted,
                      fontSize: "12px",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {promos.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: theme.textMuted,
                  }}
                >
                  No promos found.
                </td>
              </tr>
            )}
            {promos.map((promo, i) => (
              <tr
                key={promo.promo_id}
                style={{
                  borderTop: `1px solid ${theme.border}`,
                  background: i % 2 !== 0 ? `${theme.border}22` : "transparent",
                }}
              >
                <td style={{ padding: "14px 20px", fontWeight: "bold" }}>
                  {promo.promo_name}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  {promo.is_free == 1 ? (
                    <span
                      style={{
                        backgroundColor: "#22c55e22",
                        color: "#22c55e",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        border: "1px solid #22c55e",
                      }}
                    >
                      FREE
                    </span>
                  ) : (
                    <span
                      style={{
                        color: theme.primary,
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      {parseInt(promo.bonus_days) > 0 && (
                        <span>
                          +{promo.bonus_days} day
                          {promo.bonus_days != 1 ? "s" : ""}
                        </span>
                      )}
                      {parseInt(promo.bonus_days) > 0 &&
                        parseFloat(promo.discount_amount) > 0 && (
                          <span style={{ color: theme.textMuted }}> · </span>
                        )}
                      {parseFloat(promo.discount_amount) > 0 && (
                        <span style={{ color: "#f59e0b" }}>
                          ₱{parseFloat(promo.discount_amount).toLocaleString()}{" "}
                          off
                        </span>
                      )}
                      {parseInt(promo.bonus_days) === 0 &&
                        parseFloat(promo.discount_amount) === 0 && (
                          <span style={{ color: theme.textMuted }}>—</span>
                        )}
                    </span>
                  )}
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    color: theme.textMuted,
                    fontSize: "13px",
                  }}
                >
                  {promo.description || "—"}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      backgroundColor:
                        promo.is_active == 1 ? "#22c55e22" : "#99999922",
                      color: promo.is_active == 1 ? "#22c55e" : theme.textMuted,
                      border: `1px solid ${promo.is_active == 1 ? "#22c55e" : theme.border}`,
                    }}
                  >
                    {promo.is_active == 1 ? "Active" : "Inactive"}
                  </span>
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  <button
                    onClick={() => handleToggle(promo)}
                    disabled={toggling === promo.promo_id}
                    style={{
                      padding: "7px 14px",
                      backgroundColor:
                        promo.is_active == 1 ? "#6b7280" : "#22c55e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "12px",
                      marginRight: "8px",
                      opacity: toggling === promo.promo_id ? 0.6 : 1,
                    }}
                  >
                    {promo.is_active == 1 ? "⏸ Deactivate" : "▶ Activate"}
                  </button>
                  <button
                    onClick={() => openEdit(promo)}
                    style={{
                      padding: "7px 14px",
                      backgroundColor: "#f59e0b",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "12px",
                      marginRight: "8px",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(promo)}
                    disabled={deleting === promo.promo_id}
                    style={{
                      padding: "7px 14px",
                      backgroundColor: theme.danger,
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "12px",
                      opacity: deleting === promo.promo_id ? 0.6 : 1,
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
              padding: "30px",
              borderRadius: "12px",
              width: "420px",
              border: `1px solid ${theme.border}`,
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "18px" }}>
                {modal.mode === "add" ? "Add New Promo" : "Edit Promo"}
              </h2>
              <button
                onClick={closeModal}
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
              onSubmit={handleSave}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label style={labelStyle}>Promo Name</label>
                <input
                  type="text"
                  required
                  value={modal.form.promo_name}
                  onChange={(e) =>
                    setModal((m) => ({
                      ...m,
                      form: { ...m.form, promo_name: e.target.value },
                    }))
                  }
                  placeholder="e.g., New Year Promo"
                  style={inputStyle}
                />
              </div>

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
                  checked={modal.form.is_free || false}
                  onChange={(e) =>
                    setModal((m) => ({
                      ...m,
                      form: {
                        ...m.form,
                        is_free: e.target.checked,
                        discount_amount: e.target.checked
                          ? ""
                          : m.form.discount_amount,
                      },
                    }))
                  }
                  style={{ width: "16px", height: "16px" }}
                />
                Free Promo — no payment required
              </label>

              {!modal.form.is_free && (
                <div>
                  <label style={labelStyle}>
                    Discount Amount (₱) — optional
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={modal.form.discount_amount}
                    onChange={(e) =>
                      setModal((m) => ({
                        ...m,
                        form: { ...m.form, discount_amount: e.target.value },
                      }))
                    }
                    placeholder="e.g., 100.00 — deducted from plan price"
                    style={inputStyle}
                  />
                </div>
              )}

              <div>
                <label style={labelStyle}>
                  Bonus Days{modal.form.is_free ? " (Optional)" : ""}
                </label>
                <input
                  type="number"
                  min="0"
                  value={modal.form.bonus_days}
                  onChange={(e) =>
                    setModal((m) => ({
                      ...m,
                      form: { ...m.form, bonus_days: e.target.value },
                    }))
                  }
                  placeholder="e.g., 15"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Description (Optional)</label>
                <input
                  type="text"
                  value={modal.form.description}
                  onChange={(e) =>
                    setModal((m) => ({
                      ...m,
                      form: { ...m.form, description: e.target.value },
                    }))
                  }
                  placeholder="e.g., Celebrate New Year with 15 free days!"
                  style={inputStyle}
                />
              </div>
              {error && (
                <div style={{ color: theme.danger, fontSize: "13px" }}>
                  {error}
                </div>
              )}
              <button
                type="submit"
                style={{
                  padding: "13px",
                  backgroundColor: theme.primary,
                  color: theme.primaryText,
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Save Promo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromosManager;
