import React, { useState, useEffect } from "react";
import bg1 from "../assets/logBG1.png";
import bg2 from "../assets/logBG2.png";

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

function Login({ theme, loginUser, setLoginUser, loginPass, setLoginPass, loginError, handleLogin }) {
  const backgrounds = [bg1, bg2];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backgrounds.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const inputStyle = {
    padding: "14px",
    borderRadius: "6px",
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.bg,
    color: theme.text,
    fontSize: "16px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

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
            backgroundPosition: "top center",
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
            id="username"
            name="username"
            autoComplete="username"
            placeholder="Username"
            required
            value={loginUser}
            onChange={(e) => setLoginUser(e.target.value)}
            style={inputStyle}
          />

          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              required
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              style={{ ...inputStyle, paddingRight: "48px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                color: showPassword ? theme.primary : theme.textMuted,
                transition: "color 0.2s ease",
              }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {loginError && (
            <div style={{ color: theme.danger, fontSize: "14px", marginTop: "-5px" }}>
              {loginError}
            </div>
          )}

          <button
            type="submit"
            style={{
              boxShadow: "0 0 20px rgba(84,202,241,0.25)",
              padding: "14px",
              backgroundColor: theme.primary,
              color: theme.primaryText,
              border: "none",
              borderRadius: "6px",
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
