import react from "react";

function Login({
  theme,
  loginUser,
  setLoginUser,
  loginPass,
  setLoginPass,
  loginError,
  handleLogin,
}) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.bg,
        color: theme.text,
        fontFamily: "sans-serif",
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
          Capuno OS
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
            style={{
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
            ACCESS SYSTEM
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
