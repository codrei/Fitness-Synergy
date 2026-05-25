import React, { useState } from "react";
import logo from "../assets/logo.jpg";

function Sidebar({
  theme,
  toggleTheme,
  handleLogout,
  openAddModal,
  openWalkInModal,
  setShowTdeeModal,
  currentView,
  setCurrentView,
}) {
  const [revenueOpen, setRevenueOpen] = useState(
    currentView.startsWith("revenue"),
  );

  const navBtn = (view) => ({
    textAlign: "left",
    padding: "12px",
    backgroundColor:
      currentView === view ? "rgba(255,255,255,0.1)" : "transparent",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: currentView === view ? "bold" : "normal",
    width: "100%",
  });

  const subBtn = (view) => ({
    textAlign: "left",
    padding: "9px 12px 9px 28px",
    backgroundColor:
      currentView === view ? "rgba(0,191,255,0.15)" : "transparent",
    color: currentView === view ? theme.primary : "#aaa",
    border: "none",
    borderLeft:
      currentView === view
        ? `2px solid ${theme.primary}`
        : "2px solid transparent",
    borderRadius: "0 8px 8px 0",
    cursor: "pointer",
    fontWeight: currentView === view ? "bold" : "normal",
    width: "100%",
    fontSize: "13px",
  });

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
          gap: "4px",
          overflowY: "auto",
        }}
      >
        <button onClick={openAddModal} style={navBtn("none")}>
          ➕ Register Member
        </button>

        <button onClick={openWalkInModal} style={navBtn("none")}>
          🚶 Walk-in Guest
        </button>

        <button
          onClick={() => setCurrentView("dashboard")}
          style={navBtn("dashboard")}
        >
          📊 Dashboard
        </button>

        {/* Revenue Report expandable */}
        <button
          onClick={() => {
            setRevenueOpen(!revenueOpen);
            if (!revenueOpen) setCurrentView("revenue-overview");
          }}
          style={{
            ...navBtn("revenue"),
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: currentView.startsWith("revenue")
              ? "rgba(255,255,255,0.1)"
              : "transparent",
            fontWeight: currentView.startsWith("revenue") ? "bold" : "normal",
          }}
        >
          <span>💰 Revenue Report</span>
          <span style={{ fontSize: 11 }}>{revenueOpen ? "▲" : "▼"}</span>
        </button>

        {revenueOpen && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              marginBottom: "4px",
            }}
          >
            <button
              onClick={() => setCurrentView("revenue-overview")}
              style={subBtn("revenue-overview")}
            >
              📈 Overview
            </button>
            <button
              onClick={() => setCurrentView("revenue-daily")}
              style={subBtn("revenue-daily")}
            >
              📅 Daily Earnings
            </button>
            <button
              onClick={() => setCurrentView("revenue-monthly")}
              style={subBtn("revenue-monthly")}
            >
              🗓️ Monthly Earnings
            </button>
            <button
              onClick={() => setCurrentView("revenue-yearly")}
              style={subBtn("revenue-yearly")}
            >
              📆 Yearly Earnings
            </button>
            <button
              onClick={() => setCurrentView("revenue-logs")}
              style={subBtn("revenue-logs")}
            >
              🧾 Payment Logs
            </button>
          </div>
        )}

        <button
          onClick={() => setCurrentView("plans")}
          style={navBtn("plans")}
        >
          📋 Plans
        </button>

        <button
          onClick={() => setCurrentView("promos")}
          style={navBtn("promos")}
        >
          🎁 Promos
        </button>
      </div>

      {/* TDEE always at bottom before logout */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
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
          {theme.bg === "#081018" ? "☀️ Switch to Light" : "🌙 Switch to Dark"}
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
