import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { apiFetch } from "../api";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const fmt = (n) =>
  n === 0 || n === null || n === undefined
    ? "—"
    : parseFloat(n).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const fmtNum = (n) =>
  parseFloat(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const currentYear  = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const DEPOSIT_FORM_DEFAULT = { deposit_date: "", amount: "", variance: "", remarks: "" };

export default function BranchSalesReport({ theme }) {
  const [activeTab, setActiveTab]           = useState("branch");
  const [selectedMonth, setSelectedMonth]   = useState(currentMonth);
  const [selectedYear, setSelectedYear]     = useState(currentYear);

  // Branch report
  const [branchData, setBranchData]         = useState(null);
  const [branchLoading, setBranchLoading]   = useState(false);

  // Weekly
  const [weeklyData, setWeeklyData]         = useState(null);
  const [weeklyLoading, setWeeklyLoading]   = useState(false);
  const [targetInput, setTargetInput]       = useState("");
  const [targetSaving, setTargetSaving]     = useState(false);
  const [targetMsg, setTargetMsg]           = useState("");

  // Deposits
  const [deposits, setDeposits]             = useState([]);
  const [depositsTotal, setDepositsTotal]   = useState(0);
  const [depositsLoading, setDepositsLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [editingDepositId, setEditingDepositId] = useState(null);
  const [depositForm, setDepositForm]       = useState(DEPOSIT_FORM_DEFAULT);
  const [depositSaving, setDepositSaving]   = useState(false);
  const [depositError, setDepositError]     = useState("");
  const [deleteDepositId, setDeleteDepositId] = useState(null);

  // Installments
  const [installments, setInstallments]     = useState([]);
  const [installLoading, setInstallLoading] = useState(false);
  const [expandedMember, setExpandedMember] = useState(null);

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const fetchBranch = useCallback(async (m, y) => {
    setBranchLoading(true);
    try {
      const res = await apiFetch(`get_branch_report.php?month=${m}&year=${y}`).then(r => r.json());
      if (res.success) setBranchData(res);
    } catch {}
    finally { setBranchLoading(false); }
  }, []);

  const fetchWeekly = useCallback(async (m, y) => {
    setWeeklyLoading(true);
    try {
      const res = await apiFetch(`get_weekly_sales.php?month=${m}&year=${y}`).then(r => r.json());
      if (res.success) {
        setWeeklyData(res);
        setTargetInput(res.target > 0 ? String(res.target) : "");
      }
    } catch {}
    finally { setWeeklyLoading(false); }
  }, []);

  const fetchDeposits = useCallback(async (m, y) => {
    setDepositsLoading(true);
    try {
      const res = await apiFetch(`get_bank_deposits.php?month=${m}&year=${y}`).then(r => r.json());
      if (res.success) { setDeposits(res.deposits); setDepositsTotal(res.total); }
    } catch {}
    finally { setDepositsLoading(false); }
  }, []);

  const fetchInstallments = useCallback(async () => {
    setInstallLoading(true);
    try {
      const res = await apiFetch("get_installment_tracker.php").then(r => r.json());
      if (res.success) setInstallments(res.installments);
    } catch {}
    finally { setInstallLoading(false); }
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (activeTab === "branch")       fetchBranch(selectedMonth, selectedYear);
    if (activeTab === "weekly")       fetchWeekly(selectedMonth, selectedYear);
    if (activeTab === "deposits")     fetchDeposits(selectedMonth, selectedYear);
    if (activeTab === "installments") fetchInstallments();
  }, [activeTab, selectedMonth, selectedYear]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleMonthChange = (m, y) => {
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  const handleSaveTarget = async () => {
    const amt = parseFloat(targetInput);
    if (isNaN(amt) || amt < 0) { setTargetMsg("Enter a valid amount."); return; }
    setTargetSaving(true);
    setTargetMsg("");
    try {
      const res = await apiFetch("set_monthly_target.php", {
        method: "POST",
        body: JSON.stringify({ month: selectedMonth, year: selectedYear, target_amount: amt }),
      }).then(r => r.json());
      if (res.success) {
        setTargetMsg("Target saved!");
        fetchWeekly(selectedMonth, selectedYear);
      } else { setTargetMsg("Failed to save."); }
    } catch { setTargetMsg("Server error."); }
    finally {
      setTargetSaving(false);
      setTimeout(() => setTargetMsg(""), 3000);
    }
  };

  const openAddDeposit = () => {
    setEditingDepositId(null);
    setDepositForm(DEPOSIT_FORM_DEFAULT);
    setDepositError("");
    setShowDepositModal(true);
  };

  const openEditDeposit = (dep) => {
    setEditingDepositId(dep.id);
    setDepositForm({
      deposit_date: dep.deposit_date,
      amount: String(dep.amount),
      variance: dep.variance !== null ? String(dep.variance) : "",
      remarks: dep.remarks || "",
    });
    setDepositError("");
    setShowDepositModal(true);
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!depositForm.deposit_date || !depositForm.amount) {
      setDepositError("Date and amount are required.");
      return;
    }
    setDepositSaving(true);
    setDepositError("");
    try {
      const endpoint = editingDepositId ? "update_bank_deposit.php" : "add_bank_deposit.php";
      const body = {
        deposit_date: depositForm.deposit_date,
        amount: parseFloat(depositForm.amount),
        variance: depositForm.variance !== "" ? parseFloat(depositForm.variance) : null,
        remarks: depositForm.remarks || null,
        ...(editingDepositId && { id: editingDepositId }),
      };
      const res = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      }).then(r => r.json());
      if (res.success) {
        setShowDepositModal(false);
        fetchDeposits(selectedMonth, selectedYear);
      } else { setDepositError(res.error || "Failed to save."); }
    } catch { setDepositError("Server error."); }
    finally { setDepositSaving(false); }
  };

  const handleDeleteDeposit = async (id) => {
    try {
      const res = await apiFetch("delete_bank_deposit.php", {
        method: "POST",
        body: JSON.stringify({ id }),
      }).then(r => r.json());
      if (res.success) {
        setDeleteDepositId(null);
        fetchDeposits(selectedMonth, selectedYear);
      }
    } catch {}
  };

  // ── Export helpers ─────────────────────────────────────────────────────────

  const exportBranchExcel = () => {
    if (!branchData) return;
    const monthName = MONTHS[selectedMonth - 1];
    const header = [
      ["FITNESS SYNERGY LIPA"],
      [`BRANCH SALES PERFORMANCE — ${monthName.toUpperCase()} ${selectedYear}`],
      [],
      ["DATE", "CASH SALE", "GCASH / MAYA", "BANK TRANSFER", "CARD (CC/DC)", "TOTAL SALE"],
    ];

    const daysInMonth = branchData.days_in_month;
    const byDay = {};
    (branchData.daily || []).forEach(r => { byDay[parseInt(r.day_num)] = r; });

    const rows = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const r = byDay[d];
      rows.push([
        d,
        r ? parseFloat(r.cash) || 0 : "",
        r ? parseFloat(r.gcash_maya) || 0 : "",
        r ? parseFloat(r.bank_transfer) || 0 : "",
        r ? parseFloat(r.card) || 0 : "",
        r ? parseFloat(r.total) || 0 : "",
      ]);
    }

    const mtd = branchData.mtd || {};
    const totalsRow = [
      "MTD",
      parseFloat(mtd.cash) || 0,
      parseFloat(mtd.gcash_maya) || 0,
      parseFloat(mtd.bank_transfer) || 0,
      parseFloat(mtd.card) || 0,
      parseFloat(mtd.total) || 0,
    ];
    const ytdRow = ["YTD", "", "", "", "", parseFloat(branchData.ytd) || 0];

    const aoa = [...header, ...rows, [], totalsRow, ytdRow];
    const ws  = XLSX.utils.aoa_to_sheet(aoa);
    const wb  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Branch Report");
    XLSX.writeFile(wb, `Branch_Report_${monthName}_${selectedYear}.xlsx`);
  };

  const exportWeeklyExcel = () => {
    if (!weeklyData) return;
    const monthName = MONTHS[selectedMonth - 1];
    const aoa = [
      ["FITNESS SYNERGY LIPA"],
      [`WEEKLY SALES REPORT VS. TARGET — ${monthName.toUpperCase()} ${selectedYear}`],
      [],
      ["MONTH TARGET", weeklyData.target],
      [],
    ];

    (weeklyData.weeks || []).forEach(wk => {
      aoa.push([`Week ${wk.week} (${monthName} ${wk.start_day} – ${wk.end_day})`]);
      aoa.push(["DATE", "ACTUAL SALE"]);
      wk.days.forEach(day => {
        const label = `${String(day.day).padStart(2,"0")}-${monthName.slice(0,3)}`;
        aoa.push([label, day.total > 0 ? day.total : ""]);
      });
      aoa.push(["TOTAL", wk.week_total]);
      aoa.push([]);
      aoa.push(["MONTH TO DATE", wk.mtd]);
      aoa.push(["MONTH BALANCE", Math.max(0, weeklyData.target - wk.mtd)]);
      aoa.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Weekly vs Target");
    XLSX.writeFile(wb, `Weekly_Sales_${monthName}_${selectedYear}.xlsx`);
  };

  const exportDepositsExcel = () => {
    const monthName = MONTHS[selectedMonth - 1];
    const aoa = [
      ["FITNESS SYNERGY LIPA"],
      [`DEPOSIT TRACKER — ${monthName.toUpperCase()} ${selectedYear}`],
      [],
      ["DEPOSIT DATE", "AMOUNT", "VARIANCE", "REMARKS"],
      ...deposits.map(d => [
        d.deposit_date,
        parseFloat(d.amount),
        d.variance !== null ? parseFloat(d.variance) : "",
        d.remarks || "",
      ]),
      [],
      ["TOTAL", depositsTotal, "", ""],
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deposits");
    XLSX.writeFile(wb, `Deposits_${monthName}_${selectedYear}.xlsx`);
  };

  const exportInstallmentsExcel = () => {
    const aoa = [
      ["FITNESS SYNERGY LIPA"],
      ["INSTALLMENT TRACKER 2026"],
      [],
      ["NAME", "DATE OF MEMBERSHIP", "PACKAGE", "TOTAL AMOUNT", "TOTAL PAID", "BALANCE", "STATUS"],
      ...installments.map(i => [
        i.full_name,
        i.start_date,
        i.plan_name,
        i.installment_total,
        i.total_paid,
        i.balance,
        i.status,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Installments");
    XLSX.writeFile(wb, "Installment_Tracker.xlsx");
  };

  // ── Shared styles ──────────────────────────────────────────────────────────

  const card = {
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
  };

  const tabBtn = (key) => ({
    padding: "10px 20px",
    border: "none",
    borderBottom: activeTab === key ? `3px solid ${theme.primary}` : "3px solid transparent",
    backgroundColor: "transparent",
    color: activeTab === key ? theme.primary : theme.textMuted,
    fontWeight: activeTab === key ? "bold" : "normal",
    cursor: "pointer",
    fontSize: "14px",
    whiteSpace: "nowrap",
  });

  const th = {
    padding: "10px 14px",
    backgroundColor: theme.primary,
    color: "#000",
    fontWeight: "bold",
    fontSize: "12px",
    textAlign: "right",
    whiteSpace: "nowrap",
  };
  const thLeft = { ...th, textAlign: "left" };

  const td = (isAlt) => ({
    padding: "8px 14px",
    textAlign: "right",
    fontSize: "13px",
    color: theme.text,
    backgroundColor: isAlt ? (theme.bg === "#ECF8F7" ? "#f5fcfc" : "rgba(255,255,255,0.03)") : "transparent",
    borderBottom: `1px solid ${theme.border}`,
    whiteSpace: "nowrap",
  });
  const tdLeft = (isAlt) => ({ ...td(isAlt), textAlign: "left" });

  const inputStyle = {
    padding: "9px 12px",
    backgroundColor: theme.bg,
    border: `1px solid ${theme.border}`,
    borderRadius: "8px",
    color: theme.text,
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
  };

  const btnPrimary = {
    padding: "10px 20px",
    backgroundColor: theme.primary,
    color: "#000",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "13px",
    whiteSpace: "nowrap",
  };

  const btnOutline = {
    padding: "10px 20px",
    backgroundColor: "transparent",
    color: theme.primary,
    border: `1px solid ${theme.primary}`,
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "13px",
    whiteSpace: "nowrap",
  };

  const btnDanger = {
    padding: "5px 10px",
    backgroundColor: "transparent",
    color: theme.danger,
    border: `1px solid ${theme.danger}`,
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  };

  const btnEdit = {
    padding: "5px 10px",
    backgroundColor: "transparent",
    color: theme.primary,
    border: `1px solid ${theme.primary}`,
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  };

  // ── Month picker ───────────────────────────────────────────────────────────

  const MonthPicker = () => (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <select
        value={selectedMonth}
        onChange={e => handleMonthChange(parseInt(e.target.value), selectedYear)}
        style={{ ...inputStyle, width: "140px" }}
      >
        {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
      </select>
      <select
        value={selectedYear}
        onChange={e => handleMonthChange(selectedMonth, parseInt(e.target.value))}
        style={{ ...inputStyle, width: "90px" }}
      >
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );

  const Loader = () => (
    <div style={{ textAlign: "center", padding: "60px 0", color: theme.textMuted }}>
      Loading...
    </div>
  );

  // ── TAB 1: Branch Performance Report ──────────────────────────────────────

  const renderBranchTab = () => {
    const daysInMonth = branchData?.days_in_month || 31;
    const byDay = {};
    (branchData?.daily || []).forEach(r => { byDay[parseInt(r.day_num)] = r; });
    const mtd = branchData?.mtd || {};

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <MonthPicker />
          <button style={btnOutline} onClick={exportBranchExcel}>Export Excel</button>
        </div>

        {branchLoading ? <Loader /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "650px" }}>
              <thead>
                <tr>
                  <th style={{ ...thLeft, width: "60px" }}>DATE</th>
                  <th style={th}>CASH SALE</th>
                  <th style={th}>GCASH / MAYA</th>
                  <th style={th}>BANK TRANSFER</th>
                  <th style={th}>CARD (CC/DC)</th>
                  <th style={{ ...th, backgroundColor: theme.success || "#1B6B63", color: "#fff" }}>TOTAL SALE</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d, idx) => {
                  const r = byDay[d];
                  const isAlt = idx % 2 === 1;
                  return (
                    <tr key={d}>
                      <td style={{ ...tdLeft(isAlt), fontWeight: "600" }}>{d}</td>
                      <td style={td(isAlt)}>{r && parseFloat(r.cash) > 0 ? fmt(r.cash) : "—"}</td>
                      <td style={td(isAlt)}>{r && parseFloat(r.gcash_maya) > 0 ? fmt(r.gcash_maya) : "—"}</td>
                      <td style={td(isAlt)}>{r && parseFloat(r.bank_transfer) > 0 ? fmt(r.bank_transfer) : "—"}</td>
                      <td style={td(isAlt)}>{r && parseFloat(r.card) > 0 ? fmt(r.card) : "—"}</td>
                      <td style={{ ...td(isAlt), fontWeight: r ? "600" : "normal" }}>
                        {r && parseFloat(r.total) > 0 ? fmt(r.total) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: theme.primary + "22" }}>
                  <td style={{ ...tdLeft(false), fontWeight: "bold", color: theme.primary }}>MTD</td>
                  <td style={{ ...td(false), fontWeight: "bold" }}>{fmt(mtd.cash)}</td>
                  <td style={{ ...td(false), fontWeight: "bold" }}>{fmt(mtd.gcash_maya)}</td>
                  <td style={{ ...td(false), fontWeight: "bold" }}>{fmt(mtd.bank_transfer)}</td>
                  <td style={{ ...td(false), fontWeight: "bold" }}>{fmt(mtd.card)}</td>
                  <td style={{ ...td(false), fontWeight: "bold", color: theme.primary }}>{fmt(mtd.total)}</td>
                </tr>
                <tr style={{ backgroundColor: "#FFD70022" }}>
                  <td style={{ ...tdLeft(false), fontWeight: "bold", color: "#B8860B" }}>YTD</td>
                  <td style={td(false)} colSpan={4}></td>
                  <td style={{ ...td(false), fontWeight: "bold", color: "#B8860B" }}>{fmtNum(branchData?.ytd)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ── TAB 2: Weekly vs Target ────────────────────────────────────────────────

  const renderWeeklyTab = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <MonthPicker />
        <button style={btnOutline} onClick={exportWeeklyExcel}>Export Excel</button>
      </div>

      {/* Target setter */}
      <div style={{ ...card, display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <span style={{ fontWeight: "bold", color: theme.text, fontSize: "14px", whiteSpace: "nowrap" }}>
          Monthly Target:
        </span>
        <div style={{ position: "relative", flex: 1, minWidth: "180px", maxWidth: "260px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: theme.textMuted }}>₱</span>
          <input
            type="number"
            value={targetInput}
            onChange={e => setTargetInput(e.target.value)}
            placeholder="500000"
            style={{ ...inputStyle, paddingLeft: "28px" }}
          />
        </div>
        <button style={btnPrimary} onClick={handleSaveTarget} disabled={targetSaving}>
          {targetSaving ? "Saving…" : "Save Target"}
        </button>
        {targetMsg && (
          <span style={{ fontSize: "13px", color: targetMsg.includes("!") ? theme.success : theme.danger }}>
            {targetMsg}
          </span>
        )}
      </div>

      {weeklyLoading ? <Loader /> : !weeklyData ? null : (
        <>
          {/* Summary row */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
            {[
              { label: "Target", value: fmtNum(weeklyData.target), color: theme.textMuted },
              { label: "Month to Date", value: fmtNum(weeklyData.mtd), color: theme.primary },
              { label: "Month Balance", value: fmtNum(Math.max(0, weeklyData.target - weeklyData.mtd)), color: weeklyData.mtd >= weeklyData.target ? theme.success : theme.danger },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ ...card, flex: 1, minWidth: "160px", margin: 0, textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: theme.textMuted, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</div>
                <div style={{ fontSize: "20px", fontWeight: "bold", color }}>{value ? `₱${value}` : "—"}</div>
              </div>
            ))}
          </div>

          {/* Week blocks */}
          {weeklyData.weeks.map((wk) => {
            const monthName = MONTHS[selectedMonth - 1];
            return (
              <div key={wk.week} style={{ ...card, marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0, fontSize: "15px", color: theme.text }}>
                    Week {wk.week} &nbsp;
                    <span style={{ fontWeight: "normal", color: theme.textMuted, fontSize: "13px" }}>
                      ({monthName} {wk.start_day} – {wk.end_day})
                    </span>
                  </h3>
                  <span style={{ fontWeight: "bold", color: theme.primary, fontSize: "15px" }}>
                    ₱{fmtNum(wk.week_total)}
                  </span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {wk.days.map((day, idx) => {
                      const label = `${String(day.day).padStart(2, "0")}-${monthName.slice(0, 3)}`;
                      const isAlt = idx % 2 === 1;
                      return (
                        <tr key={day.day}>
                          <td style={{ ...tdLeft(isAlt), width: "120px" }}>{label}</td>
                          <td style={{ ...td(isAlt), fontWeight: day.total > 0 ? "600" : "normal" }}>
                            {day.total > 0 ? `₱${fmtNum(day.total)}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: theme.primary + "18" }}>
                      <td style={{ ...tdLeft(false), fontWeight: "bold" }}>TOTAL</td>
                      <td style={{ ...td(false), fontWeight: "bold", color: theme.primary }}>
                        ₱{fmtNum(wk.week_total)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ ...tdLeft(false), color: theme.textMuted, fontSize: "12px" }}>Month to Date</td>
                      <td style={{ ...td(false), color: theme.textMuted, fontSize: "12px" }}>₱{fmtNum(wk.mtd)}</td>
                    </tr>
                    <tr>
                      <td style={{ ...tdLeft(false), color: theme.textMuted, fontSize: "12px" }}>Month Balance</td>
                      <td style={{ ...td(false), color: theme.textMuted, fontSize: "12px" }}>
                        ₱{fmtNum(Math.max(0, weeklyData.target - wk.mtd))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })}
        </>
      )}
    </div>
  );

  // ── TAB 3: Deposit Tracker ─────────────────────────────────────────────────

  const renderDepositsTab = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <MonthPicker />
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={btnPrimary} onClick={openAddDeposit}>+ Add Deposit</button>
          <button style={btnOutline} onClick={exportDepositsExcel}>Export Excel</button>
        </div>
      </div>

      {depositsLoading ? <Loader /> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr>
                <th style={thLeft}>DEPOSIT DATE</th>
                <th style={th}>AMOUNT</th>
                <th style={th}>VARIANCE</th>
                <th style={thLeft}>REMARKS</th>
                <th style={th}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...td(false), textAlign: "center", padding: "40px", color: theme.textMuted }}>
                    No deposits recorded for this month.
                  </td>
                </tr>
              ) : deposits.map((dep, idx) => {
                const isAlt = idx % 2 === 1;
                return (
                  <tr key={dep.id}>
                    <td style={tdLeft(isAlt)}>{new Date(dep.deposit_date + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td style={td(isAlt)}>₱{fmtNum(dep.amount)}</td>
                    <td style={{ ...td(isAlt), color: dep.variance < 0 ? theme.danger : dep.variance > 0 ? theme.success : theme.textMuted }}>
                      {dep.variance !== null ? (dep.variance >= 0 ? "+" : "") + fmtNum(dep.variance) : "—"}
                    </td>
                    <td style={tdLeft(isAlt)}>{dep.remarks || "—"}</td>
                    <td style={{ ...td(isAlt), textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                        <button style={btnEdit} onClick={() => openEditDeposit(dep)}>Edit</button>
                        <button style={btnDanger} onClick={() => setDeleteDepositId(dep.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {deposits.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: theme.primary + "22" }}>
                  <td style={{ ...tdLeft(false), fontWeight: "bold" }}>TOTAL</td>
                  <td style={{ ...td(false), fontWeight: "bold", color: theme.primary }}>₱{fmtNum(depositsTotal)}</td>
                  <td colSpan={3} style={td(false)}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Add/Edit modal */}
      {showDepositModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200, backdropFilter: "blur(4px)" }}
          onClick={() => setShowDepositModal(false)}>
          <div style={{ backgroundColor: theme.surface, borderRadius: "16px", padding: "32px", width: "440px", border: `1px solid ${theme.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 24px", fontSize: "18px", color: theme.text }}>
              {editingDepositId ? "Edit Deposit" : "Add Bank Deposit"}
            </h2>
            <form onSubmit={handleDepositSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <label style={{ fontSize: "13px", color: theme.textMuted }}>
                  Deposit Date *
                  <input type="date" value={depositForm.deposit_date}
                    onChange={e => setDepositForm(f => ({ ...f, deposit_date: e.target.value }))}
                    style={{ ...inputStyle, marginTop: "6px" }} required />
                </label>
                <label style={{ fontSize: "13px", color: theme.textMuted }}>
                  Amount *
                  <input type="number" step="0.01" min="0" value={depositForm.amount}
                    onChange={e => setDepositForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00" style={{ ...inputStyle, marginTop: "6px" }} required />
                </label>
                <label style={{ fontSize: "13px", color: theme.textMuted }}>
                  Variance
                  <input type="number" step="0.01" value={depositForm.variance}
                    onChange={e => setDepositForm(f => ({ ...f, variance: e.target.value }))}
                    placeholder="0.00 (optional)" style={{ ...inputStyle, marginTop: "6px" }} />
                </label>
                <label style={{ fontSize: "13px", color: theme.textMuted }}>
                  Remarks
                  <input type="text" value={depositForm.remarks}
                    onChange={e => setDepositForm(f => ({ ...f, remarks: e.target.value }))}
                    placeholder="Optional notes" style={{ ...inputStyle, marginTop: "6px" }} />
                </label>
                {depositError && <p style={{ margin: 0, color: theme.danger, fontSize: "13px" }}>{depositError}</p>}
                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <button type="submit" style={{ ...btnPrimary, flex: 1 }} disabled={depositSaving}>
                    {depositSaving ? "Saving…" : editingDepositId ? "Update" : "Add Deposit"}
                  </button>
                  <button type="button" style={{ ...btnOutline }} onClick={() => setShowDepositModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteDepositId && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1300, backdropFilter: "blur(4px)" }}>
          <div style={{ backgroundColor: theme.surface, borderRadius: "16px", padding: "32px", width: "360px", textAlign: "center", border: `1px solid ${theme.border}` }}>
            <h3 style={{ margin: "0 0 12px", color: theme.text }}>Delete Deposit?</h3>
            <p style={{ color: theme.textMuted, margin: "0 0 24px", fontSize: "14px" }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button style={{ ...btnDanger, flex: 1, padding: "12px" }} onClick={() => handleDeleteDeposit(deleteDepositId)}>Delete</button>
              <button style={{ ...btnOutline, flex: 1 }} onClick={() => setDeleteDepositId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── TAB 4: Installment Tracker ─────────────────────────────────────────────

  const renderInstallmentsTab = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ fontSize: "13px", color: theme.textMuted }}>
          All installment members — click a row to see payment history
        </div>
        <button style={btnOutline} onClick={exportInstallmentsExcel}>Export Excel</button>
      </div>

      {installLoading ? <Loader /> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr>
                <th style={thLeft}>MEMBER NAME</th>
                <th style={thLeft}>DATE JOINED</th>
                <th style={thLeft}>PACKAGE</th>
                <th style={th}>TOTAL</th>
                <th style={th}>PAID</th>
                <th style={th}>BALANCE</th>
                <th style={th}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {installments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...td(false), textAlign: "center", padding: "40px", color: theme.textMuted }}>
                    No installment members found.
                  </td>
                </tr>
              ) : installments.map((inst, idx) => {
                const isExpanded = expandedMember === inst.member_id;
                const isAlt = idx % 2 === 1;
                return (
                  <>
                    <tr key={inst.member_id}
                      onClick={() => setExpandedMember(isExpanded ? null : inst.member_id)}
                      style={{ cursor: "pointer" }}>
                      <td style={{ ...tdLeft(isAlt), fontWeight: "600" }}>
                        <span style={{ marginRight: "8px", fontSize: "11px", color: theme.textMuted }}>{isExpanded ? "▼" : "▶"}</span>
                        {inst.full_name}
                      </td>
                      <td style={tdLeft(isAlt)}>{inst.start_date ? new Date(inst.start_date + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
                      <td style={tdLeft(isAlt)}>{inst.plan_name || "—"}</td>
                      <td style={td(isAlt)}>₱{fmtNum(inst.installment_total)}</td>
                      <td style={{ ...td(isAlt), color: theme.success }}>₱{fmtNum(inst.total_paid)}</td>
                      <td style={{ ...td(isAlt), color: inst.balance > 0 ? theme.danger : theme.success }}>
                        {inst.balance > 0 ? `₱${fmtNum(inst.balance)}` : "—"}
                      </td>
                      <td style={{ ...td(isAlt), textAlign: "center" }}>
                        <span style={{
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          backgroundColor: inst.status === "PAID" ? (theme.success + "22") : (theme.danger + "22"),
                          color: inst.status === "PAID" ? theme.success : theme.danger,
                        }}>
                          {inst.status}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`exp-${inst.member_id}`}>
                        <td colSpan={7} style={{ padding: "0", backgroundColor: theme.bg, borderBottom: `1px solid ${theme.border}` }}>
                          <div style={{ padding: "12px 24px" }}>
                            <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "bold", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>
                              Payment History
                            </p>
                            {inst.payments.length === 0 ? (
                              <p style={{ margin: 0, color: theme.textMuted, fontSize: "13px" }}>No payments recorded yet.</p>
                            ) : (
                              <table style={{ width: "100%", maxWidth: "500px", borderCollapse: "collapse" }}>
                                <thead>
                                  <tr>
                                    <th style={{ ...thLeft, fontSize: "11px", padding: "6px 10px" }}>#</th>
                                    <th style={{ ...thLeft, fontSize: "11px", padding: "6px 10px" }}>Date</th>
                                    <th style={{ ...th, fontSize: "11px", padding: "6px 10px" }}>Amount</th>
                                    <th style={{ ...thLeft, fontSize: "11px", padding: "6px 10px" }}>Method</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {inst.payments.map((p, pi) => (
                                    <tr key={p.payment_id}>
                                      <td style={{ ...tdLeft(false), padding: "5px 10px", fontSize: "12px" }}>{pi + 1}</td>
                                      <td style={{ ...tdLeft(false), padding: "5px 10px", fontSize: "12px" }}>{new Date(p.payment_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</td>
                                      <td style={{ ...td(false), padding: "5px 10px", fontSize: "12px" }}>₱{fmtNum(p.amount)}</td>
                                      <td style={{ ...tdLeft(false), padding: "5px 10px", fontSize: "12px" }}>{p.payment_method}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: "26px", color: theme.text }}>Branch Sales Report</h1>
        <p style={{ margin: 0, color: theme.textMuted, fontSize: "14px" }}>
          Fitness Synergy Lipa — auto-populated from transaction records
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ ...card, padding: "0", marginBottom: "20px", overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${theme.border}`, overflowX: "auto" }}>
          {[
            { key: "branch",       label: "Branch Performance" },
            { key: "weekly",       label: "Weekly vs Target" },
            { key: "deposits",     label: "Deposit Tracker" },
            { key: "installments", label: "Installment Tracker" },
          ].map(t => (
            <button key={t.key} style={tabBtn(t.key)} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={card}>
        {activeTab === "branch"       && renderBranchTab()}
        {activeTab === "weekly"       && renderWeeklyTab()}
        {activeTab === "deposits"     && renderDepositsTab()}
        {activeTab === "installments" && renderInstallmentsTab()}
      </div>
    </div>
  );
}
