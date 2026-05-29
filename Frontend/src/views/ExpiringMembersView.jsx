import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../api";

const TIERS = [
  {
    key: "today",
    label: "Today & Tomorrow",
    description: "Urgent — call now",
    accent: "#FCA5A5",
    bg: "rgba(239, 68, 68, 0.08)",
    border: "rgba(239, 68, 68, 0.35)",
  },
  {
    key: "soon",
    label: "Next 2–3 Days",
    description: "Reach out this week",
    accent: "#FCD34D",
    bg: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.35)",
  },
  {
    key: "week",
    label: "Next 4–7 Days",
    description: "Plan a courtesy follow-up",
    accent: "#93C5FD",
    bg: "rgba(59, 130, 246, 0.08)",
    border: "rgba(59, 130, 246, 0.30)",
  },
  {
    key: "contacted",
    label: "Already Contacted",
    description: "Outreach in flight — within last 14 days",
    accent: "#86EFAC",
    bg: "rgba(16, 185, 129, 0.06)",
    border: "rgba(16, 185, 129, 0.30)",
  },
];

const formatExpiry = (dateStr, daysLeft) => {
  if (daysLeft === 0) return "Today";
  if (daysLeft === 1) return "Tomorrow";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

function ExpiringMembersView({ theme, startRenewal, showToast, fetchData }) {
  const [tiers, setTiers]   = useState({ today: [], soon: [], week: [], contacted: [] });
  const [counts, setCounts] = useState({ today: 0, soon: 0, week: 0, contacted: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [pendingId, setPendingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("get_expiring_members.php").then((r) => r.json());
      if (!res.success) throw new Error(res.error || "Failed to load expiring members.");
      setTiers(res.tiers || { today: [], soon: [], week: [], contacted: [] });
      setCounts(res.counts || { today: 0, soon: 0, week: 0, contacted: 0, total: 0 });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markContacted = async (memberId, clear) => {
    setPendingId(memberId);
    try {
      const res = await apiFetch("mark_renewal_contacted.php", {
        method: "POST",
        body: JSON.stringify({ member_id: memberId, clear: !!clear }),
      }).then((r) => r.json());
      if (!res.success) throw new Error(res.error || "Failed.");
      showToast?.(clear ? "Moved back to outreach list." : "Marked as contacted.");
      load();
    } catch (e) {
      showToast?.(e.message || "Failed to update contact status.", "error");
    } finally {
      setPendingId(null);
    }
  };

  const handleRenew = (member) => {
    if (!startRenewal) return;
    // RenewalModal expects a member object compatible with the existing renewal flow.
    startRenewal({
      member_id: member.member_id,
      full_name: member.full_name,
      plan_id: member.plan_id,
      expiration_date: member.expiration_date,
    });
  };

  const renderMember = (member, isContacted) => (
    <div
      key={member.member_id}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 16,
        padding: "14px 16px",
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 10,
        marginBottom: 8,
        alignItems: "center",
        opacity: isContacted ? 0.85 : 1,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>
            {member.full_name}
          </span>
          <span style={{
            fontSize: 10,
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            color: theme.textMuted,
            padding: "1px 8px",
            borderRadius: 4,
            fontFamily: "monospace",
          }}>
            {member.contract_id || "—"}
          </span>
        </div>
        <div style={{ fontSize: 12, color: theme.textMuted, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {member.contact_number && (
            <span>
              📞 <a href={`tel:${member.contact_number}`} style={{ color: theme.text, textDecoration: "none" }}>
                {member.contact_number}
              </a>
            </span>
          )}
          <span>{member.plan_name || "—"}</span>
          <span>
            Expires <strong style={{ color: Number(member.days_left) <= 1 ? "#FCA5A5" : theme.text }}>
              {formatExpiry(member.expiration_date, Number(member.days_left))}
            </strong>
          </span>
          {isContacted && member.renewal_contacted_at && (
            <span>
              ✓ Contacted {new Date(member.renewal_contacted_at.replace(" ", "T")).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => handleRenew(member)}
          style={{
            padding: "8px 14px",
            background: theme.primary,
            color: theme.primaryText,
            border: "none",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Renew Now
        </button>
        <button
          onClick={() => markContacted(member.member_id, isContacted)}
          disabled={pendingId === member.member_id}
          style={{
            padding: "8px 14px",
            background: "transparent",
            color: theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: pendingId === member.member_id ? "wait" : "pointer",
            opacity: pendingId === member.member_id ? 0.6 : 1,
          }}
        >
          {pendingId === member.member_id
            ? "…"
            : isContacted ? "Move back" : "Mark contacted"}
        </button>
      </div>
    </div>
  );

  const renderTier = (tier) => {
    const members = tiers[tier.key] || [];
    if (members.length === 0) return null;
    return (
      <div key={tier.key} style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            background: tier.bg,
            border: `1px solid ${tier.border}`,
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: tier.accent }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, textTransform: "uppercase", letterSpacing: 1 }}>
              {tier.label}
            </div>
            <div style={{ fontSize: 11, color: theme.textMuted }}>{tier.description}</div>
          </div>
          <span style={{ fontSize: 14, color: theme.text, fontWeight: 700 }}>
            {members.length}
          </span>
        </div>
        {members.map((m) => renderMember(m, tier.key === "contacted"))}
      </div>
    );
  };

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Expiring Soon</h1>
          <p style={{ margin: "4px 0 0", color: theme.textMuted, fontSize: 13 }}>
            Members up for renewal in the next 7 days. Reach out before they lapse.
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, color: theme.textMuted, fontSize: 13 }}>
          <span><strong style={{ color: "#FCA5A5" }}>{counts.today}</strong> urgent</span>
          <span><strong style={{ color: "#FCD34D" }}>{counts.soon}</strong> soon</span>
          <span><strong style={{ color: "#93C5FD" }}>{counts.week}</strong> this week</span>
          <span><strong style={{ color: "#86EFAC" }}>{counts.contacted}</strong> contacted</span>
        </div>
      </header>

      {error && (
        <div role="alert" style={{
          background: "rgba(255,82,82,0.08)",
          border: "1px solid rgba(255,82,82,0.35)",
          color: "#FF8A8A",
          padding: "10px 14px",
          borderRadius: 8,
          marginBottom: 14,
          fontSize: 13,
        }}>{error}</div>
      )}

      {loading && counts.total === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: theme.textMuted }}>Loading…</div>
      )}

      {!loading && counts.total === 0 && !error && (
        <div style={{
          padding: 40,
          textAlign: "center",
          color: theme.textMuted,
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
        }}>
          🎉 No one&apos;s expiring in the next 7 days. Members are paid up.
        </div>
      )}

      {TIERS.map(renderTier)}
    </div>
  );
}

export default ExpiringMembersView;
