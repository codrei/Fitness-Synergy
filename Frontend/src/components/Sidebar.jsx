import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpg";

function Sidebar({
  theme,
  isDarkMode,
  toggleTheme,
  handleLogout,
  openAddModal,
  openWalkInModal,
  setShowTdeeModal,
  openAdminModal,
  expiringUrgentCount = 0,
}) {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  // Reports section covers /revenue/* + /reports/attendance + /reports/branch.
  const isReportsActive =
    pathname.startsWith("/revenue") || pathname.startsWith("/reports");
  const isPlansActive = pathname === "/plans" || pathname === "/promos";

  const [revenueOpen, setRevenueOpen] = useState(isReportsActive);
  const [plansOpen, setPlansOpen] = useState(isPlansActive);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => pathname === path;
  const go = (path) => () => navigate(path);

  const navBtn = (path) => ({
    textAlign: "left",
    padding: "12px",
    backgroundColor: isActive(path) ? "rgba(255,255,255,0.1)" : "transparent",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: isActive(path) ? "bold" : "normal",
    width: "100%",
    fontSize: "14px",
  });

  const subBtn = (path) => ({
    textAlign: "left",
    padding: "9px 12px 9px 28px",
    backgroundColor: isActive(path) ? "rgba(0,191,255,0.15)" : "transparent",
    color: isActive(path) ? theme.primary : "#aaa",
    border: "none",
    borderLeft: isActive(path) ? `2px solid ${theme.primary}` : "2px solid transparent",
    borderRadius: "0 8px 8px 0",
    cursor: "pointer",
    fontWeight: isActive(path) ? "bold" : "normal",
    width: "100%",
    fontSize: "13px",
  });

  const menuItemStyle = {
    textAlign: "left",
    padding: "10px 12px",
    background: "none",
    border: "none",
    color: theme.text || "white",
    cursor: "pointer",
    borderRadius: "6px",
    fontSize: "14px",
    width: "100%",
  };

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
        flexShrink: 0,
      }}
    >
      {/* Branding */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <img
          src={logo}
          alt="Fitness Synergy Lipa"
          style={{ width: "120px", borderRadius: "12px", boxShadow: "0 0 20px rgba(0,0,0,0.4)" }}
        />
      </div>

      <div
        style={{
          paddingBottom: "20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          marginBottom: "16px",
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

      {/* Quick Actions */}
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            fontSize: "10px",
            color: "#555",
            textTransform: "uppercase",
            letterSpacing: "1px",
            padding: "0 4px",
            marginBottom: "8px",
          }}
        >
          Quick Actions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <button
            onClick={openAddModal}
            style={{
              width: "100%",
              padding: "10px 14px",
              backgroundColor: theme.primary,
              color: theme.primaryText,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
              textAlign: "left",
            }}
          >
            + Register Member
          </button>
          <button
            onClick={openWalkInModal}
            style={{
              width: "100%",
              padding: "10px 14px",
              backgroundColor: "rgba(0,204,204,0.1)",
              color: "#00CCCC",
              border: "1px solid rgba(0,204,204,0.3)",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
              textAlign: "left",
            }}
          >
            + Walk-in Guest
          </button>
        </div>
      </div>

      <div
        style={{
          height: "1px",
          backgroundColor: "rgba(255,255,255,0.07)",
          margin: "4px 0 12px",
        }}
      />

      {/* Navigation */}
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
        <button onClick={go("/")} style={navBtn("/")}>
          Dashboard
        </button>

        {/* Reports expandable */}
        <button
          onClick={() => {
            const opening = !revenueOpen;
            setRevenueOpen(opening);
            if (opening && !isReportsActive) navigate("/revenue/overview");
          }}
          style={{
            textAlign: "left",
            padding: "12px",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            width: "100%",
            fontSize: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: isReportsActive ? "rgba(255,255,255,0.1)" : "transparent",
            fontWeight: isReportsActive ? "bold" : "normal",
          }}
        >
          <span>Reports</span>
          <span style={{ fontSize: 11 }}>{revenueOpen ? "▲" : "▼"}</span>
        </button>

        {revenueOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "4px" }}>
            <div
              style={{
                padding: "6px 12px 2px 28px",
                fontSize: 10,
                color: "#555",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Revenue
            </div>
            <button onClick={go("/revenue/overview")} style={subBtn("/revenue/overview")}>
              Overview
            </button>
            <button onClick={go("/revenue/daily")} style={subBtn("/revenue/daily")}>
              Daily Earnings
            </button>
            <button onClick={go("/revenue/monthly")} style={subBtn("/revenue/monthly")}>
              Monthly Earnings
            </button>
            <button onClick={go("/revenue/yearly")} style={subBtn("/revenue/yearly")}>
              Yearly Earnings
            </button>
            <button onClick={go("/revenue/logs")} style={subBtn("/revenue/logs")}>
              Payment Logs
            </button>
            <div
              style={{
                padding: "8px 12px 2px 28px",
                fontSize: 10,
                color: "#555",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginTop: 4,
              }}
            >
              Attendance
            </div>
            <button onClick={go("/reports/attendance")} style={subBtn("/reports/attendance")}>
              Attendance Report
            </button>
            <div
              style={{
                padding: "8px 12px 2px 28px",
                fontSize: 10,
                color: "#555",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginTop: 4,
              }}
            >
              Branch Reports
            </div>
            <button onClick={go("/reports/branch")} style={subBtn("/reports/branch")}>
              Branch Sales Report
            </button>
          </div>
        )}

        {/* Plans & Promos expandable */}
        <button
          onClick={() => {
            const opening = !plansOpen;
            setPlansOpen(opening);
            if (opening && !isPlansActive) navigate("/plans");
          }}
          style={{
            textAlign: "left",
            padding: "12px",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            width: "100%",
            fontSize: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: isPlansActive ? "rgba(255,255,255,0.1)" : "transparent",
            fontWeight: isPlansActive ? "bold" : "normal",
          }}
        >
          <span>Plans</span>
          <span style={{ fontSize: 11 }}>{plansOpen ? "▲" : "▼"}</span>
        </button>

        {plansOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "4px" }}>
            <button onClick={go("/plans")} style={subBtn("/plans")}>
              Regular Plans
            </button>
            <button onClick={go("/promos")} style={subBtn("/promos")}>
              Promos
            </button>
          </div>
        )}

        <button onClick={go("/expenses")} style={navBtn("/expenses")}>
          Expenses
        </button>

        <button
          onClick={go("/expiring")}
          style={{
            ...navBtn("/expiring"),
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Expiring Soon</span>
          {expiringUrgentCount > 0 && (
            <span
              aria-label={`${expiringUrgentCount} urgent`}
              style={{
                minWidth: 22,
                height: 22,
                padding: "0 7px",
                background: "#EF4444",
                color: "white",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {expiringUrgentCount}
            </span>
          )}
        </button>

        <button onClick={go("/activity-log")} style={navBtn("/activity-log")}>
          Activity Log
        </button>
      </div>

      {/* Admin drop-up */}
      <div
        ref={menuRef}
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px", position: "relative" }}
      >
        {adminMenuOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "105%",
              left: 0,
              width: "100%",
              backgroundColor: theme.surface || "#222",
              border: `1px solid ${theme.border || "rgba(255,255,255,0.15)"}`,
              borderRadius: "10px",
              padding: "8px",
              boxShadow: "0 -5px 25px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              zIndex: 100,
            }}
          >
            <button
              onClick={() => { setAdminMenuOpen(false); openAdminModal(); }}
              style={menuItemStyle}
              onMouseEnter={(e) => (e.target.style.backgroundColor = isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
            >
              Account Profile
            </button>
            <button
              onClick={() => { setAdminMenuOpen(false); toggleTheme(); }}
              style={menuItemStyle}
              onMouseEnter={(e) => (e.target.style.backgroundColor = isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
            >
              {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </button>

            <div style={{ height: "1px", backgroundColor: theme.border || "rgba(255,255,255,0.1)", margin: "4px 0" }} />

            <button
              onClick={() => { setAdminMenuOpen(false); setShowTdeeModal(true); }}
              style={menuItemStyle}
              onMouseEnter={(e) => (e.target.style.backgroundColor = isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
            >
              TDEE Calculator
            </button>

            <div style={{ height: "1px", backgroundColor: theme.border || "rgba(255,255,255,0.1)", margin: "4px 0" }} />

            <button
              onClick={handleLogout}
              style={{
                ...menuItemStyle,
                backgroundColor: theme.danger || "#ef4444",
                color: "white",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          </div>
        )}

        <button
          onClick={() => setAdminMenuOpen(!adminMenuOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "12px",
            backgroundColor: adminMenuOpen ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.2)",
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>Administrator</span>
              <span style={{ fontSize: "11px", color: "#aaa" }}>System Account</span>
            </div>
          </div>
          <span style={{ fontSize: "10px", color: "#888" }}>{adminMenuOpen ? "▼" : "▲"}</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
