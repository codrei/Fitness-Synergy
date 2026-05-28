function WalkInRecommendModal({ theme, name, visits, onConvert, onDismiss }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
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
          borderRadius: "16px",
          padding: "36px",
          width: "420px",
          textAlign: "center",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <h2 style={{ margin: "0 0 10px", fontSize: "20px", color: theme.primary }}>
          Loyal Walk-in Guest!
        </h2>
        <p style={{ color: theme.text, margin: "0 0 6px", fontSize: "15px" }}>
          Si <strong>{name}</strong> ay bumisita na ng{" "}
          <strong>{visits}</strong> beses bilang walk-in.
        </p>
        <p style={{ color: theme.textMuted, margin: "0 0 24px", fontSize: "13px" }}>
          Alukin siyang kumuha ng Regular Membership para makatipid!
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onConvert}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: theme.primary,
              color: theme.primaryText,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Gawan ng Membership
          </button>
          <button
            onClick={onDismiss}
            style={{
              padding: "12px 20px",
              border: `1px solid ${theme.border}`,
              borderRadius: "8px",
              backgroundColor: "transparent",
              color: theme.text,
              cursor: "pointer",
            }}
          >
            Sige mamaya na
          </button>
        </div>
      </div>
    </div>
  );
}

export default WalkInRecommendModal;
