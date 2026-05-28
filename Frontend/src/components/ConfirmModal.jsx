import React from "react";

function ConfirmModal({ theme, name, onConfirm, onCancel }) {
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
          width: "400px",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            margin: "0 0 10px",
            fontSize: "20px",
            color: theme.text,
          }}
        >
          Delete Member?
        </h3>
        <p
          style={{
            color: theme.textMuted,
            margin: "0 0 28px",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          This will permanently delete{" "}
          <strong style={{ color: theme.text }}>{name}</strong> along with all
          their attendance and payment history. This cannot be undone.
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "11px 28px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
              backgroundColor: "transparent",
              color: theme.text,
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              transition: "background 0.15s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "11px 28px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: theme.danger,
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(255,82,82,0.35)",
            }}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
