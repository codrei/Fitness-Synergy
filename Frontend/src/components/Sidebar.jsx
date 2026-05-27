import React, { useState, useRef, useEffect } from "react";
import logo from "../assets/logo.jpg";

function Sidebar({
  theme,
  isDarkMode,
  toggleTheme,
  handleLogout,
  openAddModal,
  openWalkInModal,
  setShowTdeeModal,
  currentView,
  setCurrentView,
  openAdminModal,
}) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [revenueOpen, setRevenueOpen] = useState(
    currentView.startsWith("revenue") || currentView === "attendance-report",
  );
  const [plansOpen, setPlansOpen] = useState(
    currentView === "plans" || currentView === "promos",
  );

  // State to manage our Windows-style drop-up panel
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the drop-up if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const isPlansActive = currentView === "plans" || currentView === "promos";

  return (
    <div
      className="app-sidebar"
      style={{
        width: "250px",
        minWidth: "250px",
        backgroundColor: theme.sidebar,
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
        zIndex: 10,
        //  ✅ FIXED: Removed structural overflowY clipping property from here
        flexShrink: 0,
      }}
    >
      {/* Branding Header Area */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <img
          src={logo}
          alt="Fitness Synergy Lipa"
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
          FITNESS SYNERGY LIPA
        </h2>
        <span style={{ fontSize: "12px", letterSpacing: "2px", color: "#888" }}>
          GYM SYSTEM
        </span>
      </div>

      {/*  ✅ FIXED INNER SCROLL ZONE: This isolated view box handles scrolling for links smoothly */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          overflowY: "auto",
          marginBottom: "16px",
        }}
      >
        <button
          onClick={() => setCurrentView("dashboard")}
          style={navBtn("dashboard")}
        >
          📊 Dashboard
        </button>

        {/* Register expandable */}
        <button
          onClick={() => setRegisterOpen(!registerOpen)}
          style={{
            ...navBtn("none"),
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>➕ Register</span>
          <span style={{ fontSize: 11 }}>{registerOpen ? "▲" : "▼"}</span>
        </button>

        {/* Register Nested Items */}
        {registerOpen && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              marginBottom: "4px",
            }}
          >
            <button onClick={openAddModal} style={subBtn("_never_")}>
              👤 Membership
            </button>
            <button onClick={openWalkInModal} style={subBtn("_never_")}>
              🚶 Walk-in Guest
            </button>
          </div>
        )}

        {/* Reports expandable */}
        <button
          onClick={() => {
            setRevenueOpen(!revenueOpen);
            if (!revenueOpen) setCurrentView("revenue-overview");
          }}
          style={{
            ...navBtn("reports"),
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor:
              currentView.startsWith("revenue") ||
              currentView === "attendance-report"
                ? "rgba(255,255,255,0.1)"
                : "transparent",
            fontWeight:
              currentView.startsWith("revenue") ||
              currentView === "attendance-report"
                ? "bold"
                : "normal",
          }}
        >
          <span>📊 Reports</span>
          <span style={{ fontSize: 11 }}>{revenueOpen ? "▲" : "▼"}</span>
        </button>

        {/* Reports Nested Items */}
        {revenueOpen && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                padding: "6px 12px 2px 28px",
                fontSize: 10,
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              💰 Revenue
            </div>
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
              <code>📆</code> Yearly Earnings
            </button>
            <button
              onClick={() => setCurrentView("revenue-logs")}
              style={subBtn("revenue-logs")}
            >
              🧾 Payment Logs
            </button>

            <div
              style={{
                padding: "8px 12px 2px 28px",
                fontSize: 10,
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginTop: 4,
              }}
            >
              📅 Attendance
            </div>
            <button
              onClick={() => setCurrentView("attendance-report")}
              style={subBtn("attendance-report")}
            >
              📊 Attendance Report
            </button>
          </div>
        )}

        {/* Plans & Promos expandable */}
        <button
          onClick={() => {
            setPlansOpen(!plansOpen);
            if (!plansOpen) setCurrentView("plans");
          }}
          style={{
            ...navBtn("plans"),
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: isPlansActive
              ? "rgba(255,255,255,0.1)"
              : "transparent",
            fontWeight: isPlansActive ? "bold" : "normal",
          }}
        >
          <span>📋 Plans</span>
          <span style={{ fontSize: 11 }}>{plansOpen ? "▲" : "▼"}</span>
        </button>

        {/* Plans & Promos Nested Items */}
        {plansOpen && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              marginBottom: "4px",
            }}
          >
            <button
              onClick={() => setCurrentView("plans")}
              style={subBtn("plans")}
            >
              📄 Regular Plans
            </button>
            <button
              onClick={() => setCurrentView("promos")}
              style={subBtn("promos")}
            >
              🎁 Promos
            </button>
          </div>
        )}

        <button
          onClick={() => setCurrentView("expenses")}
          style={navBtn("expenses")}
        >
          💸 Expenses
        </button>
      </div>

      {/* --- REFACTORED WINDOWS STYLE BOTTOM SECTION --- */}
      <div
        ref={menuRef}
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "16px",
          position: "relative",
        }}
      >
        {/* Hidden Context Drop-Up Menu */}
        {adminMenuOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "105%",
              left: "0",
              width: "100%",
              backgroundColor: theme.surface || "#222",
              border: `1px solid ${theme.border || "rgba(255,255,255,0.15)"}`,
              borderRadius: "8px",
              padding: "8px",
              boxShadow: "0 -5px 25px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              zIndex: 100,
            }}
          >
            <button
              onClick={() => {
                setAdminMenuOpen(false);
                openAdminModal();
              }}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                background: "none",
                border: "none",
                color: theme.text || "white",
                cursor: "pointer",
                borderRadius: "6px",
                fontSize: "14px",
                width: "100%",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = isDarkMode
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              ⚙️ Account Profile
            </button>

            <button
              onClick={() => {
                setAdminMenuOpen(false);
                setShowTdeeModal(true);
              }}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                background: "none",
                border: "none",
                color: theme.text || "white",
                cursor: "pointer",
                borderRadius: "6px",
                fontSize: "14px",
                width: "100%",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = isDarkMode
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              🧮 TDEE Tools
            </button>

            <button
              onClick={() => {
                setAdminMenuOpen(false);
                toggleTheme();
              }}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                background: "none",
                border: "none",
                color: theme.text || "white",
                cursor: "pointer",
                borderRadius: "6px",
                fontSize: "14px",
                width: "100%",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = isDarkMode
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              {isDarkMode ? "☀️ Switch to Light" : "🌙 Switch to Dark"}
            </button>

            <div
              style={{
                height: "1px",
                backgroundColor: theme.border || "rgba(255,255,255,0.1)",
                margin: "4px 0",
              }}
            />

            <button
              onClick={handleLogout}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                backgroundColor: theme.danger || "#ef4444",
                border: "none",
                color: "white",
                cursor: "pointer",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              🚪 Logout
            </button>
          </div>
        )}

        {/* Windows Main System Anchor Button Trigger */}
        <button
          onClick={() => setAdminMenuOpen(!adminMenuOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "12px",
            backgroundColor: adminMenuOpen
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.2)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: theme.primary,
                color: "black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              A
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                Administrator
              </span>
              <span style={{ fontSize: "11px", color: "#aaa" }}>
                Active System Account
              </span>
            </div>
          </div>
          <span style={{ fontSize: "10px", color: "#888" }}>
            {adminMenuOpen ? "▼" : "▲"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
