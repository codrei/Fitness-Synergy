import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { MONTHS } from "../config";
import { apiFetch } from "../api";

const THIS_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => THIS_YEAR - 2 + i);
const fmtPHP = (n) =>
  `₱${parseFloat(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const calcAge = (dob) => {
  if (!dob) return "-";
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};
const isSenior = (age, discountType) =>
  discountType === "Senior" || (typeof age === "number" && age >= 60);

function BarChart({ data, labelKey, valueKey, theme }) {
  if (!data || data.length === 0)
    return (
      <p style={{ color: theme.textMuted, textAlign: "center" }}>
        No data yet.
      </p>
    );
  const max = Math.max(...data.map((d) => parseFloat(d[valueKey] || 0)), 1);
  return (
    <div style={{ overflowX: "auto" }}>
      <svg
        width={Math.max(data.length * 60, 400)}
        height={200}
        style={{ display: "block" }}
      >
        {data.map((d, i) => {
          const val = parseFloat(d[valueKey] || 0);
          const barH = Math.max((val / max) * 140, 2);
          const x = i * 60 + 10;
          const y = 155 - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={42}
                height={barH}
                rx={4}
                fill={theme.primary}
                opacity={0.85}
              />
              <text
                x={x + 21}
                y={172}
                textAnchor="middle"
                fill={theme.textMuted}
                fontSize={10}
              >
                {String(d[labelKey]).slice(0, 6)}
              </text>
              <text
                x={x + 21}
                y={y - 4}
                textAnchor="middle"
                fill={theme.text}
                fontSize={9}
              >
                {val > 0 ? `₱${(val / 1000).toFixed(1)}k` : ""}
              </text>
            </g>
          );
        })}
        <line
          x1={5}
          y1={155}
          x2={data.length * 60 + 10}
          y2={155}
          stroke={theme.border}
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}

function StatCard({ label, value, sub, theme }) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        padding: "20px 24px",
        flex: 1,
        minWidth: 150,
      }}
    >
      <div
        style={{
          color: theme.textMuted,
          fontSize: 11,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
      <div style={{ color: theme.primary, fontSize: 24, fontWeight: "bold" }}>
        {value}
      </div>
      {sub && (
        <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function PaymentTable({ payments, theme }) {
  if (!payments || payments.length === 0)
    return (
      <p style={{ color: theme.textMuted, textAlign: "center", padding: 32 }}>
        No payments found.
      </p>
    );
  return (
    <div
      style={{
        background: theme.surface,
        borderRadius: 12,
        overflow: "auto",
        border: `1px solid ${theme.border}`,
      }}
    >
      <table
        style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}
      >
        <thead>
          <tr style={{ background: theme.sidebar }}>
            {[
              "#",
              "Date",
              "Name",
              "Age",
              "Senior?",
              "Type",
              "Plan",
              "Payment Method",
              "Total",
              "Reference",
            ].map((h) => (
              <th
                key={h}
                style={{
                  padding: "11px 12px",
                  textAlign: "left",
                  color: theme.textMuted,
                  fontSize: 11,
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.map((p, i) => {
            const age = p.age ?? calcAge(p.dob);
            const senior = isSenior(age, p.discount_type);
            return (
              <tr
                key={i}
                style={{
                  borderTop: `1px solid ${theme.border}`,
                  background: i % 2 === 0 ? "transparent" : `${theme.border}22`,
                }}
              >
                <td
                  style={{
                    padding: "10px 12px",
                    color: theme.textMuted,
                    fontSize: 12,
                  }}
                >
                  {i + 1}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: theme.text,
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.payment_date}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: theme.text,
                    fontWeight: 500,
                    fontSize: 13,
                  }}
                >
                  {p.full_name || "Guest"}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: theme.textMuted,
                    fontSize: 12,
                  }}
                >
                  {age || "-"}
                </td>
                <td style={{ padding: "10px 12px", fontSize: 12 }}>
                  <span
                    style={{
                      background: senior ? "#ff980022" : "transparent",
                      color: senior ? "#ff9800" : theme.textMuted,
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontSize: 11,
                    }}
                  >
                    {senior ? "✅ Yes" : "No"}
                  </span>
                </td>
                <td style={{ padding: "10px 12px", fontSize: 12 }}>
                  <span
                    style={{
                      background:
                        p.customer_type === "Walk-in"
                          ? "#00bcd422"
                          : "#4caf5022",
                      color:
                        p.customer_type === "Walk-in"
                          ? theme.primary
                          : "#4caf50",
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontSize: 11,
                    }}
                  >
                    {p.customer_type}
                  </span>
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: theme.textMuted,
                    fontSize: 12,
                  }}
                >
                  {p.plan_name || "-"}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: theme.text,
                    fontSize: 12,
                  }}
                >
                  {p.payment_method || "—"}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: theme.primary,
                    fontWeight: "bold",
                    fontSize: 13,
                  }}
                >
                  {fmtPHP(p.amount)}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: theme.textMuted,
                    fontSize: 12,
                  }}
                >
                  {p.reference_number || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function RevenueReport({ theme, activeTab }) {
  const [data, setData] = useState({
    payments: [],
    member_payments: [],
    walkin_payments: [],
    monthly: [],
    yearly: [],
    overview: {},
    total: 0,
    selected_expenses: 0,
  });
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [dayFilter, setDayFilter] = useState(new Date().toISOString().slice(0, 10));
  const [weeklyTarget, setWeeklyTarget] = useState(() =>
    parseFloat(localStorage.getItem("fitness_synergy_weekly_target") || "0")
  );

  useEffect(() => {
    apiFetch("get_setting.php?key=weekly_target")
      .then((r) => r.json())
      .then((d) => {
        if (d.value !== null) {
          const v = parseFloat(d.value) || 0;
          setWeeklyTarget(v);
          localStorage.setItem("fitness_synergy_weekly_target", String(v));
        }
      })
      .catch(() => {});
  }, []);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState("");

  useEffect(() => {
    if (activeTab === "revenue-daily") {
      const t = new Date().toISOString().slice(0, 10);
      const [y, m] = t.split("-");
      setDayFilter(t);
      setYear(Number(y));
      setMonth(Number(m));
    }
  }, [activeTab]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `get_revenue.php?month=${month}&year=${year}`,
      );
      const d = await res.json();
      if (d.success) setData(d);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [month, year, activeTab]);

  const exportExcel = (rows, sheetName, filename) => {
    const monthName = MONTHS[month - 1].toUpperCase();
    const wsData = [
      ["FITNESS SYNERGY LIPA - GYM SYSTEM"],
      [`${sheetName} — ${monthName} ${year}`],
      [],
      ["#", "Date", "Name", "Age", "Senior?", "Type", "Plan", "Payment Method", "Total", "Reference"],
      ...rows.map((p, i) => {
        const age = p.age ?? calcAge(p.dob);
        const senior = isSenior(age, p.discount_type);
        return [
          i + 1,
          p.payment_date,
          p.full_name || "Guest",
          age || "-",
          senior ? "Yes" : "No",
          p.customer_type || "Member",
          p.plan_name || "-",
          p.payment_method || "Cash",
          parseFloat(p.amount || 0),
          p.reference_number || "-",
        ];
      }),
      [],
      ["", "", "", "", "", "", "TOTAL", "", rows.reduce((s, p) => s + parseFloat(p.amount || 0), 0), ""],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [
      { wch: 4 },
      { wch: 12 },
      { wch: 22 },
      { wch: 5 },
      { wch: 8 },
      { wch: 9 },
      { wch: 24 },
      { wch: 16 },
      { wch: 14 },
      { wch: 18 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
    XLSX.writeFile(wb, filename);
  };

  const exportPDF = (rows, title) => {
    const total = rows.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>${title}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#111;font-size:12px}
        h1{font-size:18px;margin:0}h2{font-size:13px;color:#555;margin:4px 0 16px}
        table{width:100%;border-collapse:collapse;margin-top:10px;font-size:11px}
        th{background:#0d1b2a;color:white;padding:8px 6px;text-align:left}
        td{padding:7px 6px;border-bottom:1px solid #ddd}
        tr:nth-child(even){background:#f9f9f9}
        .senior{color:#e65100;font-weight:bold}
        .walkin{color:#0288d1}
        .total-row{font-weight:bold;background:#e8f5e9}
        .badge{margin:12px 0;padding:10px 16px;background:#0d1b2a;color:white;display:inline-block;border-radius:6px}
      </style></head><body>
      <h1>FITNESS SYNERGY LIPA — GYM SYSTEM</h1>
      <h2>${title}</h2>
      <div class="badge">TOTAL REVENUE: ₱${total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
      <table><thead><tr>
        <th>#</th><th>Date</th><th>Name</th><th>Age</th><th>Senior?</th>
        <th>Type</th><th>Plan</th><th>Payment Method</th><th>Total</th><th>Reference</th>
      </tr></thead><tbody>
      ${rows
        .map((p, i) => {
          const age = p.age ?? calcAge(p.dob);
          const senior = isSenior(age, p.discount_type);
          return `<tr>
          <td>${i + 1}</td><td>${p.payment_date || ""}</td>
          <td>${p.full_name || "Guest"}</td>
          <td>${age || "-"}</td>
          <td class="${senior ? "senior" : ""}">${senior ? "✓ Yes" : "No"}</td>
          <td class="${p.customer_type === "Walk-in" ? "walkin" : ""}">${p.customer_type || "Member"}</td>
          <td>${p.plan_name || "-"}</td>
          <td>${p.payment_method || "Cash"}</td>
          <td><strong>₱${parseFloat(p.amount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</strong></td>
          <td>${p.reference_number || "-"}</td>
        </tr>`;
        })
        .join("")}
      <tr class="total-row">
        <td colspan="8" style="text-align:right">TOTAL:</td>
        <td><strong>₱${total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</strong></td>
        <td></td>
      </tr>
      </tbody></table></body></html>
    `);
    win.document.close();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  const printDailySummary = (rows, date) => {
    const total = rows.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const memRows = rows.filter((p) => p.customer_type === "Member");
    const wiRows = rows.filter((p) => p.customer_type === "Walk-in");
    const methods = Object.entries(
      rows.reduce((acc, p) => {
        const m = p.payment_method || "Cash";
        acc[m] = (acc[m] || 0) + parseFloat(p.amount || 0);
        return acc;
      }, {})
    ).filter(([, v]) => v > 0);
    const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("en-PH", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Daily Summary — ${date}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;max-width:580px;margin:0 auto;color:#111;font-size:13px}
        h1{font-size:22px;text-align:center;margin:0}
        .sub{text-align:center;color:#555;margin-bottom:20px;font-size:13px}
        .total-box{background:#0d1b2a;color:white;padding:20px;border-radius:8px;text-align:center;margin:16px 0}
        .total-box .lbl{font-size:11px;letter-spacing:1px;text-transform:uppercase;opacity:.7}
        .total-box .amt{font-size:36px;font-weight:bold;margin-top:4px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
        .card{border:1px solid #ddd;border-radius:6px;padding:12px 16px}
        .card .lbl{font-size:11px;color:#888;text-transform:uppercase}
        .card .val{font-size:18px;font-weight:bold;color:#0d1b2a;margin-top:4px}
        hr{border:none;border-top:1px dashed #ccc;margin:16px 0}
        .footer{text-align:center;color:#999;font-size:11px;margin-top:20px}
        @media print{button{display:none}}
      </style></head><body>
      <h1>FITNESS SYNERGY LIPA — DAILY SUMMARY</h1>
      <div class="sub">${dateLabel}</div>
      <div class="total-box">
        <div class="lbl">Total Revenue</div>
        <div class="amt">₱${total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
        <div class="lbl" style="margin-top:6px">${rows.length} transaction(s)</div>
      </div>
      <div class="grid">
        <div class="card"><div class="lbl">👥 Members</div><div class="val">${memRows.length} transaction(s)</div></div>
        <div class="card"><div class="lbl">🚶 Walk-ins</div><div class="val">${wiRows.length} transaction(s)</div></div>
      </div>
      ${methods.length > 0 ? `<hr><div style="font-size:12px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Payment Breakdown</div><div class="grid">${methods.map(([lbl, val]) => `<div class="card"><div class="lbl">${lbl}</div><div class="val">₱${val.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div></div>`).join("")}</div>` : ""}
      <div class="footer">Printed on ${new Date().toLocaleString("en-PH")} · FITNESS SYNERGY LIPA GYM SYSTEM</div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
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
  const btnStyle = (bg) => ({
    background: bg,
    color: "white",
    border: "none",
    padding: "9px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 13,
  });

  if (loading)
    return (
      <div style={{ padding: 40, color: theme.textMuted, textAlign: "center" }}>
        Loading...
      </div>
    );

  const monthSelects = (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
    </div>
  );

  const exportMonthlyExcel = (rows, yr) => {
    const wsData = [
      ["FITNESS SYNERGY LIPA - GYM SYSTEM"],
      [`Monthly Earnings — ${yr}`],
      [],
      ["Month", "Total Revenue (₱)", "Transactions"],
      ...rows.map((r) => [r.month_name, parseFloat(r.total || 0), parseInt(r.count || 0)]),
      [],
      ["TOTAL",
        rows.reduce((s, r) => s + parseFloat(r.total || 0), 0),
        rows.reduce((s, r) => s + parseInt(r.count || 0), 0)],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 14 }, { wch: 22 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Earnings");
    XLSX.writeFile(wb, `Monthly_Earnings_${yr}.xlsx`);
  };

  const exportMonthlyPDF = (rows, yr) => {
    const grandTotal = rows.reduce((s, r) => s + parseFloat(r.total || 0), 0);
    const grandCount = rows.reduce((s, r) => s + parseInt(r.count || 0), 0);
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Monthly Earnings ${yr}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#111;font-size:12px}
        h1{font-size:18px;margin:0}h2{font-size:13px;color:#555;margin:4px 0 16px}
        table{width:100%;border-collapse:collapse;margin-top:10px}
        th{background:#0d1b2a;color:white;padding:8px 6px;text-align:left}
        td{padding:7px 6px;border-bottom:1px solid #ddd}
        tr:nth-child(even){background:#f9f9f9}
        .total-row{font-weight:bold;background:#e8f5e9}
        .badge{margin:12px 0;padding:10px 16px;background:#0d1b2a;color:white;display:inline-block;border-radius:6px}
      </style></head><body>
      <h1>FITNESS SYNERGY LIPA — GYM SYSTEM</h1>
      <h2>Monthly Earnings — ${yr}</h2>
      <div class="badge">ANNUAL TOTAL: ₱${grandTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
      <table><thead><tr>
        <th>Month</th><th>Total Revenue (₱)</th><th>Transactions</th>
      </tr></thead><tbody>
      ${rows.map((r) => `<tr>
        <td>${r.month_name}</td>
        <td><strong>₱${parseFloat(r.total || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</strong></td>
        <td>${r.count || 0}</td>
      </tr>`).join("")}
      <tr class="total-row">
        <td>TOTAL</td>
        <td><strong>₱${grandTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</strong></td>
        <td>${grandCount}</td>
      </tr>
      </tbody></table></body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const exportBtns = (rows, title, filename) => (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={() => exportPDF(rows, title)}
        style={btnStyle("#c62828")}
      >
        📄 PDF
      </button>
      <button
        onClick={() => exportExcel(rows, title, filename)}
        style={btnStyle("#1d6f42")}
      >
        📊 Excel
      </button>
    </div>
  );

  const totalCard = (rows, label) => {
    const methodTotals = rows.reduce((acc, p) => {
      const m = p.payment_method || "Cash";
      acc[m] = (acc[m] || 0) + parseFloat(p.amount || 0);
      return acc;
    }, {});
    return (
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard
          label={label}
          value={fmtPHP(rows.reduce((s, p) => s + parseFloat(p.amount || 0), 0))}
          sub={`${rows.length} transaction(s)`}
          theme={theme}
        />
        {Object.entries(methodTotals).map(([method, total]) => (
          <StatCard key={method} label={method} value={fmtPHP(total)} theme={theme} />
        ))}
      </div>
    );
  };

  // OVERVIEW
  if (activeTab === "revenue-overview") {
    const o = data.overview || {};
    const weekRevenue = parseFloat(o.this_week || 0);
    const monthExpenses = parseFloat(o.expenses_this_month || 0);
    const netIncome = parseFloat(o.this_month || 0) - monthExpenses;
    const weekPct = weeklyTarget > 0 ? Math.min(100, (weekRevenue / weeklyTarget) * 100) : 0;
    const now = new Date();
    const dow = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const weekRange = `${monday.toLocaleDateString("en-PH", { month: "short", day: "numeric" })} – ${sunday.toLocaleDateString("en-PH", { month: "short", day: "numeric" })}`;
    return (
      <div style={{ padding: 30 }}>
        <h1 style={{ margin: "0 0 24px", fontSize: 28 }}>📈 Overview</h1>

        {/* Revenue stat cards */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <StatCard label="Today's Revenue" value={fmtPHP(o.today)} theme={theme} />
          <StatCard label="This Week" value={fmtPHP(o.this_week)} sub={weekRange} theme={theme} />
          <StatCard label="This Month" value={fmtPHP(o.this_month)} theme={theme} />
          <StatCard label="This Year" value={fmtPHP(o.this_year)} theme={theme} />
          <StatCard label="All Time" value={fmtPHP(o.all_time)} theme={theme} />
          {monthExpenses > 0 && (
            <StatCard
              label="Expenses (Month)"
              value={fmtPHP(monthExpenses)}
              theme={{ ...theme, primary: theme.danger }}
            />
          )}
          {monthExpenses > 0 && (
            <StatCard
              label="Net Income (Month)"
              value={fmtPHP(netIncome)}
              sub="Revenue − Expenses"
              theme={{ ...theme, primary: netIncome >= 0 ? theme.success : theme.danger }}
            />
          )}
        </div>

        {/* Weekly Target Tracker */}
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: "bold", fontSize: 16, color: theme.text }}>🎯 Weekly Sales Target</div>
              <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>{weekRange}</div>
            </div>
            {!editingTarget ? (
              <button
                onClick={() => { setEditingTarget(true); setTargetInput(weeklyTarget ? String(weeklyTarget) : ""); }}
                style={{ background: "none", border: `1px solid ${theme.border}`, color: theme.textMuted, padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
              >
                ✏️ Set Target
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  style={{ width: 130, padding: "6px 10px", borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 13 }}
                  placeholder="e.g. 50000"
                  autoFocus
                />
                <button
                  onClick={() => {
                    const v = parseFloat(targetInput) || 0;
                    setWeeklyTarget(v);
                    localStorage.setItem("fitness_synergy_weekly_target", String(v));
                    setEditingTarget(false);
                    apiFetch("save_setting.php", {
                      method: "POST",
                      body: JSON.stringify({ key: "weekly_target", value: String(v) }),
                    }).catch(() => {});
                  }}
                  style={{ background: theme.primary, color: theme.primaryText, border: "none", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: "bold" }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingTarget(false)}
                  style={{ background: "none", border: `1px solid ${theme.border}`, color: theme.textMuted, padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: weeklyTarget > 0 ? 16 : 0, flexWrap: "wrap" }}>
            <div>
              <div style={{ color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>This Week</div>
              <div style={{ color: theme.primary, fontSize: 26, fontWeight: "bold", marginTop: 4 }}>{fmtPHP(weekRevenue)}</div>
            </div>
            {weeklyTarget > 0 && (
              <>
                <div style={{ color: theme.border, fontSize: 28 }}>→</div>
                <div>
                  <div style={{ color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Target</div>
                  <div style={{ color: theme.text, fontSize: 26, fontWeight: "bold", marginTop: 4 }}>{fmtPHP(weeklyTarget)}</div>
                </div>
                <div style={{ color: theme.border, fontSize: 24 }}>|</div>
                <div>
                  <div style={{ color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Remaining</div>
                  <div style={{ color: weekRevenue >= weeklyTarget ? theme.success : theme.danger, fontSize: 26, fontWeight: "bold", marginTop: 4 }}>
                    {weekRevenue >= weeklyTarget ? "✅ Reached!" : fmtPHP(weeklyTarget - weekRevenue)}
                  </div>
                </div>
              </>
            )}
          </div>

          {weeklyTarget > 0 ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: theme.textMuted, fontSize: 12 }}>Progress toward weekly target</span>
                <span style={{ color: theme.text, fontSize: 12, fontWeight: "bold" }}>{weekPct.toFixed(1)}%</span>
              </div>
              <div style={{ background: theme.border, borderRadius: 100, height: 12, overflow: "hidden" }}>
                <div style={{
                  background: weekPct >= 100 ? theme.success : theme.primary,
                  height: "100%",
                  width: `${weekPct}%`,
                  borderRadius: 100,
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ) : (
            <div style={{ color: theme.textMuted, fontSize: 13, padding: "4px 0" }}>
              No target set — click "Set Target" to track this week's progress.
            </div>
          )}
        </div>

        {/* Monthly bar chart */}
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", color: theme.text }}>Monthly Revenue — {year}</h3>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={selectStyle}
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <BarChart data={data.monthly || []} labelKey="month_name" valueKey="total" theme={theme} />
        </div>
      </div>
    );
  }

  // DAILY EARNINGS
  if (activeTab === "revenue-daily") {
    const rows = data.payments || [];
    const allMembers = data.member_payments || [];
    const allWalkins = data.walkin_payments || [];
    const filteredRows = dayFilter ? rows.filter((p) => String(p.payment_date).startsWith(dayFilter)) : rows;
    const filteredMembers = dayFilter ? allMembers.filter((p) => String(p.payment_date).startsWith(dayFilter)) : allMembers;
    const filteredWalkins = dayFilter ? allWalkins.filter((p) => String(p.payment_date).startsWith(dayFilter)) : allWalkins;
    return (
      <div style={{ padding: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>📅 Daily Earnings</h1>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {monthSelects}
            <input
              type="date"
              value={dayFilter}
              onChange={(e) => {
                const d = e.target.value;
                setDayFilter(d);
                if (d) {
                  const [y, m] = d.split("-");
                  setYear(Number(y));
                  setMonth(Number(m));
                }
              }}
              style={{ padding: "7px 10px", borderRadius: 8, background: theme.surface, color: theme.text, border: `1px solid ${theme.border}`, fontSize: 13, cursor: "pointer" }}
              title="Filter by specific date"
            />
            {dayFilter && (
              <button
                onClick={() => setDayFilter("")}
                style={{ background: "none", border: `1px solid ${theme.border}`, color: theme.textMuted, padding: "7px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}
              >
                ✕ Clear
              </button>
            )}
            {exportBtns(filteredRows, `Daily Earnings ${MONTHS[month - 1]} ${year}`, `Daily_${MONTHS[month - 1]}_${year}.xlsx`)}
          </div>
        </div>

        {/* Daily Summary Card — shown when a specific date is selected */}
        {dayFilter && (() => {
          const dayTotal = filteredRows.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
          const methodBreakdown = Object.entries(
            filteredRows.reduce((acc, p) => {
              const m = p.payment_method || "Cash";
              acc[m] = (acc[m] || 0) + parseFloat(p.amount || 0);
              return acc;
            }, {})
          ).filter(([, v]) => v > 0);
          return (
            <div style={{ background: theme.surface, border: `2px solid ${theme.primary}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ color: theme.primary, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, fontWeight: "bold", marginBottom: 6 }}>📋 Daily Summary</div>
                  <div style={{ fontSize: 18, fontWeight: "bold", color: theme.text }}>
                    {new Date(dayFilter + "T00:00:00").toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>
                <button
                  onClick={() => printDailySummary(filteredRows, dayFilter)}
                  style={{ background: theme.primary, color: theme.primaryText, border: "none", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 13 }}
                >
                  🖨️ Print Summary
                </button>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 160px", background: theme.bg, borderRadius: 8, padding: "16px 20px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
                  <div style={{ color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Total Revenue</div>
                  <div style={{ color: theme.primary, fontSize: 28, fontWeight: "bold", marginTop: 6 }}>
                    ₱{dayTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 4 }}>{filteredRows.length} transaction(s)</div>
                </div>
                <div style={{ flex: "1 1 160px", background: theme.bg, borderRadius: 8, padding: "16px 20px", border: `1px solid ${theme.border}` }}>
                  <div style={{ color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Transaction Types</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ color: "#4caf50", fontWeight: "bold", fontSize: 14 }}>👥 {filteredMembers.length} Member Transaction(s)</span>
                    <span style={{ color: theme.primary, fontWeight: "bold", fontSize: 14 }}>🚶 {filteredWalkins.length} Walk-in Transaction(s)</span>
                  </div>
                </div>
                {methodBreakdown.length > 0 && (
                  <div style={{ flex: "2 1 240px", background: theme.bg, borderRadius: 8, padding: "16px 20px", border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Payment Methods</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px" }}>
                      {methodBreakdown.map(([label, val]) => (
                        <div key={label} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ color: theme.textMuted, fontSize: 13 }}>{label}:</span>
                          <span style={{ color: theme.text, fontWeight: "bold", fontSize: 13 }}>
                            ₱{val.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {filteredRows.length === 0 && (
                <div style={{ color: theme.textMuted, textAlign: "center", padding: "12px 0 0", fontSize: 13 }}>
                  No transactions found for this date.
                </div>
              )}
            </div>
          );
        })()}

        {totalCard(filteredRows, dayFilter
          ? `Filtered — ${new Date(dayFilter + "T00:00:00").toLocaleDateString("en-PH")}`
          : `Total — ${MONTHS[month - 1]} ${year}`
        )}
        <h3 style={{ color: theme.text, margin: "0 0 12px" }}>👥 Members</h3>
        <PaymentTable payments={filteredMembers} theme={theme} />
        <h3 style={{ color: theme.text, margin: "24px 0 12px" }}>🚶 Walk-ins</h3>
        <PaymentTable payments={filteredWalkins} theme={theme} />
      </div>
    );
  }

  // MONTHLY EARNINGS
  if (activeTab === "revenue-monthly") {
    const rows = data.monthly || [];
    return (
      <div style={{ padding: 30 }}>
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
          <h1 style={{ margin: 0, fontSize: 28 }}>
            🗓️ Monthly Earnings — {year}
          </h1>
          <div style={{ display: "flex", gap: 10 }}>
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
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => exportMonthlyPDF(data.monthly || [], year)} style={btnStyle("#c62828")}>📄 PDF</button>
              <button onClick={() => exportMonthlyExcel(data.monthly || [], year)} style={btnStyle("#1d6f42")}>📊 Excel</button>
            </div>
          </div>
        </div>
        <div
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <BarChart
            data={rows}
            labelKey="month_name"
            valueKey="total"
            theme={theme}
          />
        </div>
        <div
          style={{
            background: theme.surface,
            borderRadius: 12,
            overflow: "hidden",
            border: `1px solid ${theme.border}`,
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: theme.sidebar }}>
                {["Month", "Total Revenue", "Transactions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: theme.textMuted,
                      fontSize: 12,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      textAlign: "center",
                      padding: 32,
                      color: theme.textMuted,
                    }}
                  >
                    No data.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr
                    key={i}
                    style={{ borderTop: `1px solid ${theme.border}` }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        color: theme.text,
                        fontWeight: 500,
                      }}
                    >
                      {r.month_name}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: theme.primary,
                        fontWeight: "bold",
                      }}
                    >
                      {fmtPHP(r.total)}
                    </td>
                    <td
                      style={{ padding: "12px 16px", color: theme.textMuted }}
                    >
                      {r.count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // YEARLY EARNINGS
  if (activeTab === "revenue-yearly") {
    const rows = data.yearly || [];
    return (
      <div style={{ padding: 30 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28 }}>📆 Yearly Earnings</h1>
          {exportBtns(
            data.payments || [],
            "Yearly Revenue",
            "Yearly_Revenue.xlsx",
          )}
        </div>
        <div
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <BarChart
            data={rows}
            labelKey="year"
            valueKey="total"
            theme={theme}
          />
        </div>
        <div
          style={{
            background: theme.surface,
            borderRadius: 12,
            overflow: "hidden",
            border: `1px solid ${theme.border}`,
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: theme.sidebar }}>
                {["Year", "Total Revenue", "Transactions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: theme.textMuted,
                      fontSize: 12,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      textAlign: "center",
                      padding: 32,
                      color: theme.textMuted,
                    }}
                  >
                    No data.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr
                    key={i}
                    style={{ borderTop: `1px solid ${theme.border}` }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        color: theme.text,
                        fontWeight: 500,
                      }}
                    >
                      {r.year}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: theme.primary,
                        fontWeight: "bold",
                      }}
                    >
                      {fmtPHP(r.total)}
                    </td>
                    <td
                      style={{ padding: "12px 16px", color: theme.textMuted }}
                    >
                      {r.count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // PAYMENT LOGS (default)
  const rows = data.payments || [];
  const members = data.member_payments || [];
  const walkins = data.walkin_payments || [];
  return (
    <div style={{ padding: 30 }}>
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
        <h1 style={{ margin: 0, fontSize: 28 }}>🧾 Payment Logs</h1>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {monthSelects}
          {exportBtns(
            rows,
            `Payment Logs ${MONTHS[month - 1]} ${year}`,
            `Logs_${MONTHS[month - 1]}_${year}.xlsx`,
          )}
        </div>
      </div>
      {totalCard(rows, `Total — ${MONTHS[month - 1]} ${year}`)}
      <h3 style={{ color: theme.text, margin: "0 0 12px" }}>👥 Members</h3>
      <PaymentTable payments={members} theme={theme} />
      <h3 style={{ color: theme.text, margin: "24px 0 12px" }}>🚶 Walk-ins</h3>
      <PaymentTable payments={walkins} theme={theme} />
    </div>
  );
}
