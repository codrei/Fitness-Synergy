import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { MONTHS } from "../config";

const fmtHour = (h) => {
  const hour = parseInt(h);
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
};

function BarChart({ data, labelKey, valueKey, color, theme, height = 160 }) {
  if (!data || data.length === 0)
    return <p style={{ color: theme.textMuted, textAlign: "center", padding: 20 }}>No data available.</p>;
  const max = Math.max(...data.map((d) => parseFloat(d[valueKey] || 0)), 1);
  const barW = Math.max(Math.floor(560 / data.length) - 6, 12);
  const svgW = data.length * (barW + 6) + 20;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={svgW} height={height + 30} style={{ display: "block" }}>
        {data.map((d, i) => {
          const val = parseFloat(d[valueKey] || 0);
          const barH = Math.max((val / max) * height, 2);
          const x = i * (barW + 6) + 10;
          const y = height - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={4} fill={color} opacity={0.85} />
              <text x={x + barW / 2} y={height + 16} textAnchor="middle" fill={theme.textMuted} fontSize={9}>
                {String(d[labelKey]).slice(0, 5)}
              </text>
              {val > 0 && (
                <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill={theme.text} fontSize={9}>
                  {val}
                </text>
              )}
            </g>
          );
        })}
        <line x1={5} y1={height} x2={svgW - 5} y2={height} stroke={theme.border} strokeWidth={1} />
      </svg>
    </div>
  );
}

function StatCard({ label, value, sub, icon, color, theme, isDarkMode }) {
  return (
    <div style={{
      borderRadius: 12, overflow: "hidden",
      background: isDarkMode ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.78)",
      backdropFilter: "blur(14px)",
      border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
      boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)",
      flex: 1, minWidth: 140,
    }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${color}55)` }} />
      <div style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: theme.textMuted, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</span>
          <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, backgroundColor: `${color}22` }}>{icon}</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4, opacity: 0.8 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AttendanceReport({ theme, isDarkMode }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`get_attendance_report.php?month=${month}&year=${year}`).then((r) => r.json());
      if (res.success) setData(res);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [month, year]);

  const selectStyle = {
    padding: "8px 12px", borderRadius: 8,
    background: theme.surface, color: theme.text,
    border: `1px solid ${theme.border}`, cursor: "pointer", fontSize: 13,
  };

  const cardStyle = {
    borderRadius: 12, overflow: "hidden",
    background: isDarkMode ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.78)",
    backdropFilter: "blur(14px)",
    border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
    boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)",
    padding: 24, marginBottom: 20,
  };

  const s = data?.summary || {};

  return (
    <div style={{ padding: 30 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 26 }}>Attendance Report</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={selectStyle}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={selectStyle}>
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: theme.textMuted }}>Loading...</div>
      ) : !data ? (
        <div style={{ textAlign: "center", padding: 60, color: theme.textMuted }}>No data available.</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
            <StatCard label="Total Visits" value={s.total_visits ?? 0} icon="" color="#6366f1" theme={theme} isDarkMode={isDarkMode} sub={`${MONTHS[month-1]} ${year}`} />
            <StatCard label="Member Visits" value={s.total_members ?? 0} icon="" color="#3b82f6" theme={theme} isDarkMode={isDarkMode} sub="Registered members" />
            <StatCard label="Walk-in Visits" value={s.total_walkins ?? 0} icon="" color="#a855f7" theme={theme} isDarkMode={isDarkMode} sub="Guest check-ins" />
            <StatCard label="Avg Per Day" value={s.avg_per_day ?? 0} icon="" color="#22c55e" theme={theme} isDarkMode={isDarkMode} sub="Daily average" />
            <StatCard label="Peak Hour" value={s.peak_hour !== null ? fmtHour(s.peak_hour) : "—"} icon="" color="#f59e0b" theme={theme} isDarkMode={isDarkMode} sub="Busiest time" />
            <StatCard label="Peak Day" value={s.peak_day ?? "—"} icon="" color="#ef4444" theme={theme} isDarkMode={isDarkMode} sub="Busiest weekday" />
          </div>

          {/* Daily Visits Chart */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 16px", color: theme.text, fontSize: 16 }}>Daily Visits — {MONTHS[month - 1]} {year}</h3>
            <BarChart
              data={data.daily}
              labelKey="visit_date"
              valueKey="total"
              color="#6366f1"
              theme={theme}
            />
            {/* Members vs Walk-ins legend */}
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: "#3b82f6" }} />
                <span style={{ fontSize: 12, color: theme.textMuted }}>Members</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: "#a855f7" }} />
                <span style={{ fontSize: 12, color: theme.textMuted }}>Walk-ins</span>
              </div>
            </div>
          </div>

          {/* Two charts side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {/* Peak Hours */}
            <div style={{ ...cardStyle, marginBottom: 0 }}>
              <h3 style={{ margin: "0 0 16px", color: theme.text, fontSize: 16 }}>Peak Hours</h3>
              <BarChart
                data={data.hours.map((h) => ({ ...h, label: fmtHour(h.hour) }))}
                labelKey="label"
                valueKey="total"
                color="#f59e0b"
                theme={theme}
                height={130}
              />
            </div>

            {/* Most Active Days */}
            <div style={{ ...cardStyle, marginBottom: 0 }}>
              <h3 style={{ margin: "0 0 16px", color: theme.text, fontSize: 16 }}>Most Active Days</h3>
              <BarChart
                data={data.weekdays}
                labelKey="day_name"
                valueKey="total"
                color="#22c55e"
                theme={theme}
                height={130}
              />
            </div>
          </div>

          {/* Top Members */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 16px", color: theme.text, fontSize: 16 }}>Most Frequent Members</h3>
            {data.top_members.length === 0 ? (
              <p style={{ color: theme.textMuted, textAlign: "center", padding: 20 }}>No member visits recorded.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.top_members.map((m, i) => {
                  const maxVisits = data.top_members[0].visits;
                  const pct = (m.visits / maxVisits) * 100;
                  const medals = ["1", "2", "3"];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 16, width: 24 }}>{medals[i] || `${i + 1}.`}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: "bold", color: theme.text }}>{m.full_name}</span>
                          <span style={{ fontSize: 13, color: theme.primary, fontWeight: "bold" }}>{m.visits} visit{m.visits !== 1 ? "s" : ""}</span>
                        </div>
                        <div style={{ height: 6, background: theme.border, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: "#6366f1", borderRadius: 3, transition: "width 0.5s ease" }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}