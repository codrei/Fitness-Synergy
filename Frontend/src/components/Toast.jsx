// Renders the toast queue surfaced by useToast().
// Stacked top-right, dark-theme matched, click-to-dismiss, auto-dismissed by the hook.

const TYPE_STYLES = {
  success: {
    border: "#1B6B63",
    background: "#0B2A26",
    color: "#E8F8F7",
    icon: "✓",
    iconColor: "#00E676",
  },
  error: {
    border: "#7F1D1D",
    background: "#2A0E0E",
    color: "#FECACA",
    icon: "✕",
    iconColor: "#FF5252",
  },
};

function Toast({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 3000,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
        maxWidth: "min(95vw, 420px)",
      }}
    >
      <style>{`
        @keyframes toast-in {
          from { transform: translateX(20px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
      {toasts.map((t) => {
        const style = TYPE_STYLES[t.type] || TYPE_STYLES.success;
        return (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            aria-live="polite"
            onClick={() => onDismiss?.(t.id)}
            style={{
              minWidth: 280,
              padding: "14px 18px",
              background: style.background,
              color: style.color,
              border: `1px solid ${style.border}`,
              borderRadius: 10,
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              animation: "toast-in 0.22s ease-out",
              pointerEvents: "auto",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                color: style.iconColor,
                fontSize: 18,
                fontWeight: 700,
                flexShrink: 0,
                lineHeight: 1.2,
              }}
            >
              {style.icon}
            </span>
            <span style={{ lineHeight: 1.4 }}>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}

export default Toast;
