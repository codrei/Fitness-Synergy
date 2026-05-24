import React, { useState } from "react";
import bg from "../assets/logBG1.png";

function Login({
  theme,
  loginUser,
  setLoginUser,
  loginPass,
  setLoginPass,
  loginError,
  handleLogin,
}) {
  const [loading, setLoading] = useState(false);

  // We wrap the parent handleLogin to manage the loading UI locally
  const onSubmit = async (e) => {
    setLoading(true);
    await handleLogin(e);
    setLoading(false);
  };

  return (
    <div
      style={{
        // Replaced height: "100vh" with absolute layout to eliminate default browser margin white gaps
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.bg,
        color: theme.text,
        fontFamily: "sans-serif",
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        // Changed from "center" to "left top" so the logo in your photo is never cropped out
        backgroundPosition: "left top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          backgroundColor: theme.surface,
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          width: "350px",
          textAlign: "center",
          border: `1px solid ${theme.border}`,
        }}
      >
        <h1
          style={{
            color: theme.primary,
            margin: "0 0 5px 0",
            fontSize: "32px",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Fitness Synergy
        </h1>
        <p
          style={{
            color: theme.textMuted,
            marginTop: "0",
            marginBottom: "30px",
          }}
        >
          Secure Gateway
        </p>

        <form
          onSubmit={onSubmit}
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
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.bg,
              color: theme.text,
              fontSize: "16px",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
            style={{
              padding: "14px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.bg,
              color: theme.text,
              fontSize: "16px",
            }}
          />
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
            disabled={loading}
            style={{
              boxShadow: "0 0 20px rgba(0,191,255,0.35)",
              padding: "14px",
              backgroundColor: theme.primary,
              color: theme.primaryText,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            {loading ? "AUTHENTICATING..." : "ACCESS SYSTEM"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
