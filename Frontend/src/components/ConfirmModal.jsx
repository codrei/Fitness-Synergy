function ConfirmModal({
  theme,
  name,
  errorMessage = "",
  pending = false,
  onConfirm,
  onCancel,
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.65)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          backgroundColor: theme.surface,
          padding: "36px",
          borderRadius: "16px",
          width: "min(95vw, 420px)",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
          textAlign: "center",
        }}
      >
        <h3 style={{ margin: "0 0 10px", fontSize: "20px", color: theme.text }}>
          Delete Member?
        </h3>
        <p
          style={{
            color: theme.textMuted,
            margin: "0 0 24px",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          This will permanently delete{" "}
          <strong style={{ color: theme.text }}>{name}</strong> along with all
          their attendance and payment history. This cannot be undone.
        </p>

        {errorMessage && (
          <div
            role="alert"
            style={{
              backgroundColor: "rgba(255, 82, 82, 0.08)",
              border: "1px solid rgba(255, 82, 82, 0.35)",
              color: "#FF8A8A",
              padding: "12px 14px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "13px",
              lineHeight: 1.5,
              textAlign: "left",
            }}
          >
            <strong style={{ display: "block", marginBottom: 4 }}>
              Cannot delete
            </strong>
            {errorMessage}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={onCancel}
            disabled={pending}
            style={{
              padding: "11px 28px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
              backgroundColor: "transparent",
              color: theme.text,
              cursor: pending ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              opacity: pending ? 0.5 : 1,
            }}
          >
            {errorMessage ? "Close" : "Cancel"}
          </button>
          {!errorMessage && (
            <button
              onClick={onConfirm}
              disabled={pending}
              style={{
                padding: "11px 28px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: theme.danger,
                color: "#fff",
                cursor: pending ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(255,82,82,0.35)",
                opacity: pending ? 0.7 : 1,
              }}
            >
              {pending ? "Deleting…" : "Yes, Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
