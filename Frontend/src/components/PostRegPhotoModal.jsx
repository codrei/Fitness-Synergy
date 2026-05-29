function PostRegPhotoModal({ theme, memberName, onUpload, onSkip }) {
  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.82)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1300, backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: theme.surface, borderRadius: "16px",
          padding: "36px 32px", width: "min(95vw, 380px)", textAlign: "center",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        }}
      >
        <h2 style={{ margin: "0 0 6px", fontSize: "20px", color: theme.text }}>
          Registration Complete!
        </h2>
        <p style={{ margin: "0 0 6px", fontWeight: "bold", color: theme.primary, fontSize: "15px" }}>
          {memberName}
        </p>
        <p style={{ margin: "0 0 24px", color: theme.textMuted, fontSize: "13px", lineHeight: 1.5 }}>
          Add a profile photo now so staff can verify identity at the front desk.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={onUpload}
            style={{
              padding: "13px", backgroundColor: theme.primary,
              color: theme.primaryText, border: "none", borderRadius: "8px",
              cursor: "pointer", fontWeight: "bold", fontSize: "14px",
            }}
          >
            Upload Photo Now
          </button>
          <button
            onClick={onSkip}
            style={{
              padding: "11px", backgroundColor: "transparent",
              color: theme.textMuted, border: `1px solid ${theme.border}`,
              borderRadius: "8px", cursor: "pointer", fontSize: "13px",
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostRegPhotoModal;
