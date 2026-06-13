import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../api";

// ── Action → category mapping (keeps filter buttons in sync with backend action names) ──
const CATEGORIES = {
  all:       { label: "All",        match: () => true,                                            color: "#9CA3AF" },
  members:   { label: "Members",    match: (a) => a.startsWith("member."),                        color: "#10B981" },
  payments:  { label: "Payments",   match: (a) => a.startsWith("payment.") || a === "walkin.create", color: "#06B6D4" },
  financial: { label: "Financial",  match: (a) => a.startsWith("expense.") || a.startsWith("deposit.") || a.startsWith("target."), color: "#F59E0B" },
  admin:     { label: "Admin",      match: (a) => a.startsWith("admin.") || a.startsWith("auth."), color: "#EF4444" },
};

const categoryFor = (action) => {
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    if (key === "all") continue;
    if (cat.match(action)) return key;
  }
  return "all";
};

const formatTimestamp = (iso) => {
  if (!iso) return "";
  const d = new Date(iso.replace(" ", "T"));
  if (isNaN(d)) return iso;
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}h ago`;
  return d.toLocaleString();
};

const PAGE_SIZE = 50;

function ActivityLogView({ theme }) {
  const [logs, setLogs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [offset, setOffset]     = useState(0);
  const [category, setCategory] = useState("all");
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [expanded, setExpanded] = useState({});

  const fetchPage = useCallback(
    async (nextOffset, replace) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          limit:  String(PAGE_SIZE),
          offset: String(nextOffset),
        });
        if (category !== "all") {
          const prefix = {
            members:   "member.",
            payments:  "payment.",
            financial: "expense.",
            admin:     "admin.",
          }[category];
          if (prefix) params.set("action_prefix", prefix);
        }
        if (search.trim()) params.set("q", search.trim());

        const res = await apiFetch(`get_activity_log.php?${params}`).then((r) => r.json());
        if (!res.success) throw new Error(res.error || "Failed to load activity log.");
        setLogs((prev) => (replace ? res.logs : [...prev, ...res.logs]));
        setTotal(res.total);
        setOffset(nextOffset + res.logs.length);
      } catch (e) {
        setError(e.message || "Failed to load activity log.");
      } finally {
        setLoading(false);
      }
    },
    [category, search],
  );

  // Refetch from scratch when filter/search changes
  useEffect(() => {
    setLogs([]);
    setOffset(0);
    fetchPage(0, true);
  }, [fetchPage]);

  const parsedPayload = (payload) => {
    if (!payload) return null;
    try { return JSON.parse(payload); } catch { return payload; }
  };

  // ── Styles ──
  const cardStyle = {
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    padding: 0,
    overflow: "hidden",
  };
  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "12px 1fr auto",
    gap: 16,
    padding: "14px 20px",
    borderTop: `1px solid ${theme.border}`,
    alignItems: "start",
  };
  const filterBtn = (active, color) => ({
    padding: "8px 14px",
    background: active ? color : "transparent",
    color: active ? "#0a0a0a" : theme.text,
    border: `1px solid ${active ? color : theme.border}`,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    cursor: "pointer",
    transition: "all 0.15s",
  });

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Activity Log</h1>
          <p style={{ margin: "4px 0 0", color: theme.textMuted, fontSize: 13 }}>
            Every member, payment, and admin action — preserved with timestamp and operator.
          </p>
        </div>
        <span style={{ fontSize: 13, color: theme.textMuted }}>
          {total.toLocaleString()} {total === 1 ? "entry" : "entries"}
        </span>
      </header>

      {/* Filter pills + search */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14, alignItems: "center" }}>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            style={filterBtn(category === key, cat.color)}
          >
            {cat.label}
          </button>
        ))}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search summary or admin name…"
          style={{
            marginLeft: "auto",
            padding: "8px 14px",
            background: theme.bg,
            color: theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: 999,
            fontSize: 13,
            minWidth: 260,
            outline: "none",
          }}
        />
      </div>

      {error && (
        <div role="alert" style={{
          backgroundColor: "rgba(255,82,82,0.08)",
          border: "1px solid rgba(255,82,82,0.35)",
          color: "#FF8A8A",
          padding: "10px 14px",
          borderRadius: 8,
          marginBottom: 14,
          fontSize: 13,
        }}>{error}</div>
      )}

      <div style={cardStyle}>
        {logs.length === 0 && !loading && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: theme.textMuted }}>
            No activity yet. As soon as anyone adds, edits, or deletes a record, it&apos;ll show up here.
          </div>
        )}

        {logs.map((log) => {
          const catKey = categoryFor(log.action);
          const color = CATEGORIES[catKey].color;
          const isOpen = !!expanded[log.id];
          const payload = parsedPayload(log.payload);

          return (
            <div key={log.id} style={rowStyle}>
              <div
                aria-hidden
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: color,
                  marginTop: 6,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.4 }}>
                  {log.summary}
                </div>
                <div style={{
                  fontSize: 11,
                  color: theme.textMuted,
                  marginTop: 4,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}>
                  <span style={{
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontFamily: "monospace",
                    fontSize: 10,
                  }}>
                    {log.action}
                  </span>
                  <span>by <strong style={{ color: theme.text }}>{log.admin_username || "unknown"}</strong></span>
                  <span>·</span>
                  <span title={log.created_at}>{formatTimestamp(log.created_at)}</span>
                  {log.ip_address && (
                    <>
                      <span>·</span>
                      <span>{log.ip_address}</span>
                    </>
                  )}
                </div>
                {payload && (
                  <>
                    <button
                      onClick={() => setExpanded((s) => ({ ...s, [log.id]: !s[log.id] }))}
                      style={{
                        marginTop: 8,
                        background: "transparent",
                        border: "none",
                        color: theme.primary,
                        fontSize: 12,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      {isOpen ? "Hide details" : "Show details"}
                    </button>
                    {isOpen && (
                      <pre style={{
                        marginTop: 8,
                        background: theme.bg,
                        border: `1px solid ${theme.border}`,
                        padding: 12,
                        borderRadius: 6,
                        fontSize: 11,
                        color: theme.textMuted,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        maxHeight: 320,
                        overflow: "auto",
                      }}>
                        {JSON.stringify(payload, null, 2)}
                      </pre>
                    )}
                  </>
                )}
              </div>
              <div style={{ fontSize: 11, color: theme.textMuted, textAlign: "right", whiteSpace: "nowrap" }}>
                #{log.id}
              </div>
            </div>
          );
        })}

        {logs.length < total && (
          <div style={{ padding: 16, textAlign: "center", borderTop: `1px solid ${theme.border}` }}>
            <button
              onClick={() => fetchPage(offset, false)}
              disabled={loading}
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: theme.primary,
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Loading…" : `Load more (${total - logs.length} remaining)`}
            </button>
          </div>
        )}

        {loading && logs.length === 0 && (
          <div style={{ padding: 30, textAlign: "center", color: theme.textMuted }}>Loading…</div>
        )}
      </div>
    </div>
  );
}

export default ActivityLogView;
