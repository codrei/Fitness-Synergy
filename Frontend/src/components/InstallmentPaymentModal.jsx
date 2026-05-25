import { useState } from "react";
import { apiFetch } from "../api";

function InstallmentPaymentModal({ theme, member, paymentHistory, onSuccess, onClose }) {
  const [form, setForm] = useState({
    cashAmount: 0, gcashAmount: 0, mayaAmount: 0,
    bankTransferAmount: 0, debitAmount: 0, creditAmount: 0,
    referenceNumber: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const paymentsInCycle = paymentHistory.filter((p) =>
    !member.start_date || new Date(p.payment_date) >= new Date(member.start_date)
  );
  const totalPaid = paymentsInCycle.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const installmentTotal = parseFloat(member.installment_total || 0);
  const outstanding = Math.max(0, installmentTotal - totalPaid);

  const thisPayment =
    parseFloat(form.cashAmount || 0) +
    parseFloat(form.gcashAmount || 0) +
    parseFloat(form.mayaAmount || 0) +
    parseFloat(form.bankTransferAmount || 0) +
    parseFloat(form.debitAmount || 0) +
    parseFloat(form.creditAmount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (thisPayment <= 0) { setError("Enter at least one payment amount."); return; }
    setSaving(true);
    try {
      const res = await apiFetch("add_installment_payment.php", {
        method: "POST",
        body: JSON.stringify({
          member_id:            member.member_id,
          amount:               thisPayment,
          cash_amount:          parseFloat(form.cashAmount || 0),
          gcash_amount:         parseFloat(form.gcashAmount || 0),
          maya_amount:          parseFloat(form.mayaAmount || 0),
          bank_transfer_amount: parseFloat(form.bankTransferAmount || 0),
          debit_amount:         parseFloat(form.debitAmount || 0),
          credit_amount:        parseFloat(form.creditAmount || 0),
          reference_number:     form.referenceNumber || null,
        }),
      }).then((r) => r.json());
      if (res.success) onSuccess();
      else setError(res.error || "Payment failed.");
    } catch {
      setError("Server error.");
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n) => parseFloat(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

  const labelStyle = {
    fontSize: "12px", color: theme.textMuted, textTransform: "uppercase",
    fontWeight: "bold", display: "block", marginBottom: "5px",
  };
  const inputStyle = {
    width: "100%", padding: "10px", borderRadius: "6px",
    border: `1px solid ${theme.border}`, backgroundColor: theme.bg,
    color: theme.text, outline: "none", boxSizing: "border-box",
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200, backdropFilter: "blur(3px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: theme.surface, padding: "30px", borderRadius: "12px", width: "460px", maxHeight: "90vh", overflowY: "auto", border: `1px solid ${theme.border}`, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <h2 style={{ margin: 0, fontSize: "18px" }}>💰 Add Installment Payment</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>❌</button>
        </div>
        <p style={{ margin: "0 0 20px", color: theme.textMuted, fontSize: "14px" }}>
          For: <strong style={{ color: theme.text }}>{member.full_name}</strong>
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "22px" }}>
          <div style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: theme.textMuted, textTransform: "uppercase", marginBottom: "4px" }}>Total Plan</div>
            <div style={{ fontWeight: "bold" }}>₱{fmt(installmentTotal)}</div>
          </div>
          <div style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: theme.textMuted, textTransform: "uppercase", marginBottom: "4px" }}>Paid So Far</div>
            <div style={{ fontWeight: "bold", color: "#22c55e" }}>₱{fmt(totalPaid)}</div>
          </div>
          <div style={{
            backgroundColor: outstanding > 0 ? "#ef444422" : "#22c55e22",
            border: `1px solid ${outstanding > 0 ? theme.danger : "#22c55e"}`,
            borderRadius: "8px", padding: "12px", textAlign: "center",
          }}>
            <div style={{ fontSize: "11px", color: theme.textMuted, textTransform: "uppercase", marginBottom: "4px" }}>Outstanding</div>
            <div style={{ fontWeight: "bold", color: outstanding > 0 ? theme.danger : "#22c55e" }}>₱{fmt(outstanding)}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>💵 Cash</label>
              <input type="number" step="0.01" min="0" value={form.cashAmount} onChange={(e) => update("cashAmount", e.target.value)} placeholder="0.00" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>📱 GCash</label>
              <input type="number" step="0.01" min="0" value={form.gcashAmount} onChange={(e) => update("gcashAmount", e.target.value)} placeholder="0.00" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>🟢 Maya</label>
              <input type="number" step="0.01" min="0" value={form.mayaAmount} onChange={(e) => update("mayaAmount", e.target.value)} placeholder="0.00" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>🏦 Bank Transfer</label>
              <input type="number" step="0.01" min="0" value={form.bankTransferAmount} onChange={(e) => update("bankTransferAmount", e.target.value)} placeholder="0.00" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>💳 Debit Card</label>
              <input type="number" step="0.01" min="0" value={form.debitAmount} onChange={(e) => update("debitAmount", e.target.value)} placeholder="0.00" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>💳 Credit Card</label>
              <input type="number" step="0.01" min="0" value={form.creditAmount} onChange={(e) => update("creditAmount", e.target.value)} placeholder="0.00" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>🔖 Reference Number</label>
            <input type="text" value={form.referenceNumber} onChange={(e) => update("referenceNumber", e.target.value)} placeholder="e.g., GCash ref #" style={inputStyle} />
          </div>

          <div style={{ backgroundColor: theme.bg, borderRadius: "8px", padding: "12px 16px", display: "flex", justifyContent: "space-between", border: `1px solid ${theme.border}` }}>
            <span style={{ color: theme.textMuted, fontSize: 13 }}>This Payment</span>
            <span style={{ color: theme.primary, fontWeight: "bold", fontSize: 18 }}>
              ₱{thisPayment.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {error && <div style={{ color: theme.danger, fontSize: "13px" }}>{error}</div>}

          <button
            type="submit"
            disabled={saving}
            style={{ padding: "13px", backgroundColor: theme.primary, color: theme.primaryText, border: "none", borderRadius: "8px", cursor: saving ? "default" : "pointer", fontWeight: "bold", fontSize: "14px", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving…" : "💾 Record Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default InstallmentPaymentModal;
