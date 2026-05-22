import React from "react";
import logo from "../assets/logo.jpg";

function Sidebar({
  theme,
  isDarkMode,
  toggleTheme,
  handleLogout,
  openAddModal,
  setShowTdeeModal,
}) {
  return (
    <div
      style={{
        width: "250px",
        backgroundColor: theme.sidebar,
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
        zIndex: 10,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <img
          src={logo}
          alt="Fitness Synergy"
          style={{
            width: "120px",
            borderRadius: "12px",
            boxShadow: "0 0 20px rgba(0,0,0,0.4)",
          }}
        />
      </div>
      <div
        style={{
          paddingBottom: "20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: theme.primary,
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          FITNESS SYNERGY
        </h2>
        <span style={{ fontSize: "12px", letterSpacing: "2px", color: "#888" }}>
          GYM SYSTEM
        </span>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <button
          style={{
            textAlign: "left",
            padding: "12px",
            backgroundColor: "rgba(255,255,255,0.1)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📊 Dashboard
        </button>
        <button
          onClick={openAddModal}
          style={{
            textAlign: "left",
            padding: "12px",
            backgroundColor: "transparent",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ➕ Register Member
        </button>
        <button
          onClick={() => setShowTdeeModal(true)}
          style={{
            textAlign: "left",
            padding: "12px",
            backgroundColor: "transparent",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🧮 TDEE Tools
        </button>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <button
          onClick={toggleTheme}
          style={{
            padding: "10px",
            backgroundColor: "transparent",
            color: theme.textMuted,
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {isDarkMode ? "☀️ Switch to Light" : "🌙 Switch to Dark"}
        </button>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px",
            backgroundColor: theme.danger,
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
