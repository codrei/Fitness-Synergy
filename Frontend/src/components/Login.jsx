import React, { useState, useEffect } from "react";
import bg1 from "../assets/logBG1.png";
import bg2 from "../assets/logBG2.png";

// FIXED: Properly destructure all props within a single object parameter
function Login({
  theme,
  loginUser,
  setLoginUser,
  loginPass,
  setLoginPass,
  loginError,
  handleLogin,
}) {
  // ==================== BACKGROUND TIMER LOGIC ====================
  const backgrounds = [bg1, bg2];
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1. ADDED PASSWORD VISIBILITY TOGGLE STATE HERE
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.bg,
        color: theme.text,
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {backgrounds.map((bg, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: i === currentIndex ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
          }}
        />
      ))}
      <div
        style={{
          backgroundColor: theme.surface,
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          width: "350px",
          textAlign: "center",
          border: `1px solid ${theme.border}`,
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            color: "#ffffff",
            margin: "0",
            fontSize: "42px",
            fontWeight: "900",
            letterSpacing: "2px",
            textTransform: "uppercase",
            lineHeight: "1.1",
          }}
        >
          Fitness
        </h1>
        <h1
          style={{
            color: theme.primary,
            margin: "0 0 5px 0",
            fontSize: "42px",
            fontWeight: "900",
            letterSpacing: "2px",
            textTransform: "uppercase",
            lineHeight: "1.1",
          }}
        >
          Synergy
        </h1>
        <p
          style={{
            color: theme.textMuted,
            marginTop: "5px",
            marginBottom: "30px",
            fontSize: "14px",
            fontWeight: "600",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}
        >
          Secure System
        </p>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <input
            type="text"
            placeholder="Username"
            required
            value={loginUser}
            onChange={(e) => setLoginUser(e.target.value)}
            style={{
              padding: "14px",
              borderRadius: "4px",
              border: `1px solid ${theme.border}`,
              backgroundColor: "#e0e0e0",
              color: "#111111",
              fontSize: "16px",
              outline: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              style={{
                padding: "14px 50px 14px 14px",
                borderRadius: "4px",
                border: `1px solid ${theme.border}`,
                backgroundColor: "#e0e0e0",
                color: "#111111",
                fontSize: "16px",
                width: "100%",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                userSelect: "none",
                opacity: showPassword ? 1 : 0.5,
                transition: "opacity 0.2s ease",
              }}
            >
              <svg width="26" height="16" viewBox="0 0 24 12" fill="#111111">
                <rect x="1" y="2" width="2" height="8" rx="0.5" />
                <rect x="4" y="0" width="2" height="12" rx="0.5" />
                <rect x="6" y="4.5" width="12" height="3" />
                <rect x="18" y="0" width="2" height="12" rx="0.5" />
                <rect x="21" y="2" width="2" height="8" rx="0.5" />
              </svg>
            </span>
          </div>

          {loginError && (
            <div
              style={{
                color: theme.danger,
                fontSize: "14px",
                marginTop: "-5px",
              }}
            >
              {loginError}
            </div>
          )}

          <button
            type="submit"
            style={{
              boxShadow: "0 0 20px rgba(84, 202, 241, 0.25)",
              padding: "14px",
              backgroundColor: theme.primary,
              color: theme.primaryText,
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            ACCESS SYSTEM
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
