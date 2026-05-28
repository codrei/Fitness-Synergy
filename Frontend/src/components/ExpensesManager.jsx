import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { MONTHS } from "../config";

const THIS_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => THIS_YEAR - 2 + i);

const CATEGORIES = [
  "Utilities",
  "Equipment",
  "Staff / Payroll",
  "Supplies",
  "Maintenance",
  "Rent",
  "Marketing",
  "Other",
];

const EMPTY = {
  category: "",
  description: "",
  amount: "",
  expense_date: new Date().toISOString().slice(0, 10),
};

export default function ExpensesManager({ theme }) {
  const [expenses, setExpenses] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await apiFetch(
      `get_expenses.php?month=${month}&year=${year}`,
    ).then((r) => r.json());
    setExpenses(Array.isArray(res) ? res : []);
  };

  useEffect(() => {
    load();
  }, [month, year]);

  const fmtPHP = (n) =>
    `₱${parseFloat(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  const totalExpenses = expenses.reduce(
    (s, e) => s + parseFloat(e.amount || 0),
    0,
  );

  const openAdd = () => setModal({ mode: "add", form: { ...EMPTY } });
  const openEdit = (e) =>
    setModal({
      mode: "edit",
      form: {
        ...e,
        expense_date: e.expense_date?.slice(0, 10) || EMPTY.expense_date,
      },
    });
  const update = (field, value) =>
    setModal((m) => ({ ...m, form: { ...m.form, [field]: value } }));

  const handleSave = async (ev) => {
    ev.preventDefault();
    setError("");
    const { form, mode } = modal;
    const endpoint = mode === "add" ? "add_expense.php" : "update_expense.php";
    const res = await apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        expense_id: form.expense_id,
        category: form.category,
        description: form.description,
        amount: form.amount,
        expense_date: form.expense_date,
      }),
    }).then((r) => r.json());
    if (res.success) {
      setModal(null);
      load();
    } else {
      setError(res.error || "Failed to save.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense? This cannot be undone.")) return;
    const res = await apiFetch("delete_expense.php", {
      method: "POST",
      body: JSON.stringify({ expense_id: id }),
    }).then((r) => r.json());
    if (res.success) load();
    else alert(res.error || "Delete failed.");
  };

  const selectStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    background: theme.surface,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    cursor: "pointer",
    fontSize: 13,
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
    fontSize: 13,
  };

  const labelStyle = {
    fontSize: "12px",
    color: theme.textMuted,
    textTransform: "uppercase",
    fontWeight: "bold",
    display: "block",
    marginBottom: "5px",
  };

  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    total: expenses
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + parseFloat(e.amount || 0), 0),
  })).filter((c) => c.total > 0);

  return (
    <div style={{ padding: 30 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28 }}>Expenses</h1>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            style={selectStyle}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={selectStyle}
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={openAdd}
            style={{
              background: theme.primary,
              color: theme.primaryText,
              border: "none",
              padding: "9px 18px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 13,
            }}
          >
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 180,
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              color: theme.textMuted,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            Total Expenses
          </div>
          <div
            style={{ color: theme.danger, fontSize: 26, fontWeight: "bold" }}
          >
            {fmtPHP(totalExpenses)}
          </div>
          <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 4 }}>
            {expenses.length} record(s) · {MONTHS[month - 1]} {year}
          </div>
        </div>
        {byCategory.map((c) => (
          <div
            key={c.cat}
            style={{
              flex: 1,
              minWidth: 150,
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                color: theme.textMuted,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              {c.cat}
            </div>
            <div
              style={{ color: theme.text, fontSize: 20, fontWeight: "bold" }}
            >
              {fmtPHP(c.total)}
            </div>
          </div>
        ))}
      </div>

      {/* Expenses Table */}
      <div
        style={{
          background: theme.surface,
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${theme.border}`,
        }}
      >
        {expenses.length === 0 ? (
          <div
            style={{ padding: 40, textAlign: "center", color: theme.textMuted }}
          >
            No expenses recorded for {MONTHS[month - 1]} {year}. Click "Add
            Expense" to log one.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: theme.sidebar }}>
                {["Date", "Category", "Description", "Amount", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        color: theme.textMuted,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {expenses.map((e, i) => (
                <tr
                  key={e.expense_id}
                  style={{
                    borderTop: `1px solid ${theme.border}`,
                    background:
                      i % 2 === 0 ? "transparent" : `${theme.border}22`,
                  }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      color: theme.textMuted,
                      fontSize: 13,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {e.expense_date}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        background: `${theme.primary}22`,
                        color: theme.primary,
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: theme.text,
                      fontSize: 13,
                    }}
                  >
                    {e.description || "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: theme.danger,
                      fontWeight: "bold",
                      fontSize: 14,
                    }}
                  >
                    {fmtPHP(e.amount)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => openEdit(e)}
                        style={{
                          background: `${theme.primary}22`,
                          color: theme.primary,
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: "bold",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(e.expense_id)}
                        style={{
                          background: `${theme.danger}22`,
                          color: theme.danger,
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: "bold",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr
                style={{
                  borderTop: `2px solid ${theme.border}`,
                  background: theme.bg,
                }}
              >
                <td
                  colSpan={3}
                  style={{
                    padding: "12px 16px",
                    textAlign: "right",
                    color: theme.textMuted,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  TOTAL:
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    color: theme.danger,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {fmtPHP(totalExpenses)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal && (
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
              padding: 30,
              borderRadius: 12,
              width: 440,
              border: `1px solid ${theme.border}`,
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 22,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 18 }}>
                {modal.mode === "add" ? "Add Expense" : "Edit Expense"}
              </h2>
              <button
                onClick={() => setModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
            {error && (
              <div
                style={{
                  background: `${theme.danger}22`,
                  color: theme.danger,
                  padding: "10px 14px",
                  borderRadius: 6,
                  marginBottom: 16,
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}
            <form
              onSubmit={handleSave}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div>
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  value={modal.form.expense_date}
                  onChange={(e) => update("expense_date", e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  value={modal.form.category}
                  onChange={(e) => update("category", e.target.value)}
                  required
                  style={inputStyle}
                >
                  <option value="" disabled>
                    Select category...
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Description (Optional)</label>
                <input
                  type="text"
                  value={modal.form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="e.g., Meralco bill for May..."
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Amount (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={modal.form.amount}
                  onChange={(e) => update("amount", e.target.value)}
                  required
                  placeholder="0.00"
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: theme.primary,
                  color: theme.primaryText,
                  border: "none",
                  padding: 14,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 14,
                }}
              >
                {modal.mode === "add" ? "Add Expense" : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
