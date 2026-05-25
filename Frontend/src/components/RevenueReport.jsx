import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { API_BASE, MONTHS } from "../config";
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
        style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}
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
              "Cash",
              "GCash",
              "Maya",
              "Debit",
              "Credit",
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
                  {parseFloat(p.cash_amount || 0) > 0
                    ? fmtPHP(p.cash_amount)
                    : "-"}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: theme.text,
                    fontSize: 12,
                  }}
                >
                  {parseFloat(p.gcash_amount || 0) > 0
                    ? fmtPHP(p.gcash_amount)
                    : "-"}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: theme.text,
                    fontSize: 12,
                  }}
                >
                  {parseFloat(p.maya_amount || 0) > 0
                    ? fmtPHP(p.maya_amount)
                    : "-"}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: theme.text,
                    fontSize: 12,
                  }}
                >
                  {parseFloat(p.debit_amount || 0) > 0
                    ? fmtPHP(p.debit_amount)
                    : "-"}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: theme.text,
                    fontSize: 12,
                  }}
                >
                  {parseFloat(p.credit_amount || 0) > 0
                    ? fmtPHP(p.credit_amount)
                    : "-"}
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
  });
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/get_revenue.php?month=${month}&year=${year}`,
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
      ["FITNESS SYNERGY - GYM SYSTEM"],
      [`${sheetName} — ${monthName} ${year}`],
      [],
      [
        "#",
        "Date",
        "Name",
        "Age",
        "Senior?",
        "Type",
        "Plan",
        "Cash",
        "GCash",
        "Maya",
        "Debit",
        "Credit",
        "Total",
        "Reference",
      ],
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
          parseFloat(p.cash_amount || 0),
          parseFloat(p.gcash_amount || 0),
          parseFloat(p.maya_amount || 0),
          parseFloat(p.debit_amount || 0),
          parseFloat(p.credit_amount || 0),
          parseFloat(p.amount || 0),
          p.reference_number || "-",
        ];
      }),
      [],
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "TOTAL",
        rows.reduce((s, p) => s + parseFloat(p.cash_amount || 0), 0),
        rows.reduce((s, p) => s + parseFloat(p.gcash_amount || 0), 0),
        rows.reduce((s, p) => s + parseFloat(p.maya_amount || 0), 0),
        rows.reduce((s, p) => s + parseFloat(p.debit_amount || 0), 0),
        rows.reduce((s, p) => s + parseFloat(p.credit_amount || 0), 0),
        rows.reduce((s, p) => s + parseFloat(p.amount || 0), 0),
        "",
      ],
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
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
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
      <h1>FITNESS SYNERGY — GYM SYSTEM</h1>
      <h2>${title}</h2>
      <div class="badge">TOTAL REVENUE: ₱${total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
      <table><thead><tr>
        <th>#</th><th>Date</th><th>Name</th><th>Age</th><th>Senior?</th>
        <th>Type</th><th>Plan</th><th>Cash</th><th>GCash</th><th>Maya</th>
        <th>Debit</th><th>Credit</th><th>Total</th><th>Reference</th>
      </tr></thead><tbody>
      ${rows
        .map((p, i) => {
          const age = p.age ?? calcAge(p.dob);
          const senior = isSenior(age, p.discount_type);
          const fmt = (n) =>
            parseFloat(n || 0) > 0
              ? `₱${parseFloat(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
              : "-";
          return `<tr>
          <td>${i + 1}</td><td>${p.payment_date || ""}</td>
          <td>${p.full_name || "Guest"}</td>
          <td>${age || "-"}</td>
          <td class="${senior ? "senior" : ""}">${senior ? "✓ Yes" : "No"}</td>
          <td class="${p.customer_type === "Walk-in" ? "walkin" : ""}">${p.customer_type || "Member"}</td>
          <td>${p.plan_name || "-"}</td>
          <td>${fmt(p.cash_amount)}</td><td>${fmt(p.gcash_amount)}</td>
          <td>${fmt(p.maya_amount)}</td><td>${fmt(p.debit_amount)}</td>
          <td>${fmt(p.credit_amount)}</td>
          <td><strong>₱${parseFloat(p.amount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</strong></td>
          <td>${p.reference_number || "-"}</td>
        </tr>`;
        })
        .join("")}
      <tr class="total-row">
        <td colspan="7" style="text-align:right">TOTAL:</td>
        <td>₱${rows.reduce((s, p) => s + parseFloat(p.cash_amount || 0), 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
        <td>₱${rows.reduce((s, p) => s + parseFloat(p.gcash_amount || 0), 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
        <td>₱${rows.reduce((s, p) => s + parseFloat(p.maya_amount || 0), 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
        <td>₱${rows.reduce((s, p) => s + parseFloat(p.debit_amount || 0), 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
        <td>₱${rows.reduce((s, p) => s + parseFloat(p.credit_amount || 0), 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
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
        {[2024, 2025, 2026, 2027].map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );

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

  const totalCard = (rows, label) => (
    <div
      style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}
    >
      <StatCard
        label={label}
        value={fmtPHP(rows.reduce((s, p) => s + parseFloat(p.amount || 0), 0))}
        sub={`${rows.length} transaction(s)`}
        theme={theme}
      />
      <StatCard
        label="Cash"
        value={fmtPHP(
          rows.reduce((s, p) => s + parseFloat(p.cash_amount || 0), 0),
        )}
        theme={theme}
      />
      <StatCard
        label="GCash"
        value={fmtPHP(
          rows.reduce((s, p) => s + parseFloat(p.gcash_amount || 0), 0),
        )}
        theme={theme}
      />
      <StatCard
        label="Maya"
        value={fmtPHP(
          rows.reduce((s, p) => s + parseFloat(p.maya_amount || 0), 0),
        )}
        theme={theme}
      />
      <StatCard
        label="Debit"
        value={fmtPHP(
          rows.reduce((s, p) => s + parseFloat(p.debit_amount || 0), 0),
        )}
        theme={theme}
      />
      <StatCard
        label="Credit"
        value={fmtPHP(
          rows.reduce((s, p) => s + parseFloat(p.credit_amount || 0), 0),
        )}
        theme={theme}
      />
    </div>
  );

  // OVERVIEW
  if (activeTab === "revenue-overview") {
    const o = data.overview || {};
    return (
      <div style={{ padding: 30 }}>
        <h1 style={{ margin: "0 0 24px", fontSize: 28 }}>📈 Overview</h1>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 32,
          }}
        >
          <StatCard
            label="Today's Revenue"
            value={fmtPHP(o.today)}
            theme={theme}
          />
          <StatCard
            label="This Month"
            value={fmtPHP(o.this_month)}
            theme={theme}
          />
          <StatCard
            label="This Year"
            value={fmtPHP(o.this_year)}
            theme={theme}
          />
          <StatCard label="All Time" value={fmtPHP(o.all_time)} theme={theme} />
        </div>
        <div
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h3 style={{ margin: "0 0 16px", color: theme.text }}>
            Monthly Revenue — {year}
          </h3>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={selectStyle}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <BarChart
            data={data.monthly || []}
            labelKey="month_name"
            valueKey="total"
            theme={theme}
          />
        </div>
      </div>
    );
  }

  // DAILY EARNINGS
  if (activeTab === "revenue-daily") {
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
          <h1 style={{ margin: 0, fontSize: 28 }}>📅 Daily Earnings</h1>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {monthSelects}
            {exportBtns(
              rows,
              `Daily Earnings ${MONTHS[month - 1]} ${year}`,
              `Daily_${MONTHS[month - 1]}_${year}.xlsx`,
            )}
          </div>
        </div>
        {totalCard(rows, `Total — ${MONTHS[month - 1]} ${year}`)}
        <h3 style={{ color: theme.text, margin: "0 0 12px" }}>👥 Members</h3>
        <PaymentTable payments={members} theme={theme} />
        <h3 style={{ color: theme.text, margin: "24px 0 12px" }}>
          🚶 Walk-ins
        </h3>
        <PaymentTable payments={walkins} theme={theme} />
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
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            {exportBtns(
              data.payments || [],
              `Monthly ${year}`,
              `Monthly_${year}.xlsx`,
            )}
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
