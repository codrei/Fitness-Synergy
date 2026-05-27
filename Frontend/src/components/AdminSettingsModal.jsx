import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";

function AdminSettingsModal({ theme, onClose, onLogout }) {
  const [originalUsername, setOriginalUsername] = useState("");
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("fitness_synergy_username") || "admin";
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [showConfirmStep, setShowConfirmStep] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCurrentProfile = async () => {
      try {
        const res = await apiFetch("get_admin_profile.php", { method: "GET" }).then((r) => r.json());
        if (isMounted && res.success && res.username) {
          setUsername(res.username);
          setOriginalUsername(res.username);
          localStorage.setItem("fitness_synergy_username", res.username);
        }
      } catch (err) {
        setOriginalUsername(username);
      }
    };
    fetchCurrentProfile();
    return () => { isMounted = false; };
  }, []);

  const passwordLengthValid = newPassword.length >= 8;
  const passwordHasStrength = /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUsername(originalUsername);
    setNewPassword("");
    setCurrentPassword("");
    setStatus({ type: "", message: "" });
    setShowNewPassword(false);
    setShowCurrentPassword(false);
  };

  const isUsernameChanged = username.trim() !== originalUsername;
  const isPasswordChanged = newPassword.length > 0;
  const isDirty = isUsernameChanged || isPasswordChanged;
  const isPasswordValidToSave = !isPasswordChanged || (passwordLengthValid && passwordHasStrength);
  const canSubmitForm = isEditing && isDirty && isPasswordValidToSave && currentPassword.length > 0;

  const handlePreSubmitCheck = (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    if (!currentPassword) {
      setStatus({ type: "error", message: "You must enter your current password to commit changes." });
      return;
    }
    setShowConfirmStep(true);
  };

  const handleFinalUpdate = async () => {
    setShowConfirmStep(false);
    setLoading(true);
    try {
      const res = await apiFetch("update_admin_profile.php", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          currentPassword: currentPassword,
          newPassword: isPasswordChanged ? newPassword : ""
        }),
      }).then((r) => r.json());

      if (res.success) {
        if (isPasswordChanged || isUsernameChanged) {
          setStatus({ type: "success", message: "Security parameters modified. Re-authenticating system session..." });
          setTimeout(() => {
            if (onLogout) onLogout();
            else { localStorage.clear(); window.location.reload(); }
          }, 2000);
        } else {
          localStorage.setItem("fitness_synergy_username", username.trim());
          setOriginalUsername(username.trim());
          setCurrentPassword("");
          setNewPassword("");
          setIsEditing(false);
          setStatus({ type: "success", message: "Profile updated successfully." });
          setTimeout(() => onClose(), 1500);
        }
      } else {
        setStatus({ type: "error", message: res.error || "System rejected profile update request." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network communications fault." });
    } finally {
      setLoading(false);
    }
  };

  // ---- Styles using theme.text instead of hardcoded "white" ----
  const fieldContainer = { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" };
  const inputWrapper = { position: "relative", display: "flex", alignItems: "center" };

  const inputStyle = {
    padding: "10px 40px 10px 10px",
    borderRadius: "6px",
    backgroundColor: isEditing ? theme.bg : "rgba(128,128,128,0.08)",
    color: isEditing ? theme.text : theme.textMuted,
    border: `1px solid ${isEditing ? theme.border : "rgba(128,128,128,0.15)"}`,
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
    cursor: isEditing ? "text" : "not-allowed",
    outline: "none",
    transition: "all 0.2s ease"
  };

  const inlineEyeBtn = {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    color: theme.textMuted,
    cursor: "pointer",
    fontSize: "14px",
    padding: 0
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, backdropFilter: "blur(4px)" }}>
      <div style={{ backgroundColor: theme.surface, padding: "25px", borderRadius: "12px", width: "420px", border: `1px solid ${theme.border}`, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", position: "relative", overflow: "hidden" }}>

        {/* CONFIRMATION OVERLAY */}
        {showConfirmStep && (
          <div style={{ position: "absolute", inset: 0, backgroundColor: theme.surface, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "30px", zIndex: 10, textAlign: "center", boxSizing: "border-box" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>🛡️</div>
            <h3 style={{ margin: "0 0 10px 0", color: theme.text }}>Commit Security Override?</h3>
            <p style={{ color: theme.textMuted, fontSize: "13px", margin: "0 0 24px 0", lineHeight: "1.4" }}>
              Are you sure you want to write these credential variables to the core system table? Changing these values will terminate current active sessions.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" onClick={() => setShowConfirmStep(false)} style={{ padding: "10px 18px", backgroundColor: "transparent", color: theme.text, border: `1px solid ${theme.border}`, borderRadius: "6px", cursor: "pointer" }}>
                No, Abort
              </button>
              <button type="button" onClick={handleFinalUpdate} style={{ padding: "10px 22px", backgroundColor: theme.primary, color: "black", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                Yes, Commit
              </button>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "17px", color: theme.text }}>⚙️ Core System Configuration</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "16px", cursor: "pointer" }}>❌</button>
        </div>

        {/* STATUS MESSAGE */}
        {status.message && (
          <div style={{
            padding: "10px", borderRadius: "6px", marginBottom: "15px", fontSize: "13px", fontWeight: "bold",
            backgroundColor: status.type === "error" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
            color: status.type === "error" ? "#f87171" : "#4ade80",
            border: status.type === "error" ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(34,197,94,0.4)"
          }}>
            {status.message}
          </div>
        )}

        <form onSubmit={handlePreSubmitCheck}>
          {/* USERNAME */}
          <div style={fieldContainer}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "11px", color: theme.textMuted, fontWeight: "bold", letterSpacing: "0.5px" }}>ADMINISTRATOR USERNAME</label>
              {!isEditing && (
                <button type="button" onClick={() => setIsEditing(true)} style={{ background: "none", border: "none", color: theme.primary, fontSize: "12px", cursor: "pointer", fontWeight: "bold", padding: 0 }}>
                  ✏️ Edit Settings
                </button>
              )}
            </div>
            <input type="text" value={username} disabled={!isEditing} onChange={(e) => setUsername(e.target.value)} style={inputStyle} required />
          </div>

          {!isEditing ? (
            <div style={fieldContainer}>
              <label style={{ fontSize: "11px", color: theme.textMuted, fontWeight: "bold", letterSpacing: "0.5px" }}>ADMINISTRATOR PASSWORD</label>
              <div style={inputWrapper}>
                <input type="text" value="••••••••" disabled style={{ ...inputStyle, color: theme.textMuted }} />
              </div>
            </div>
          ) : (
            <>
              {/* NEW PASSWORD */}
              <div style={fieldContainer}>
                <label style={{ fontSize: "11px", color: theme.textMuted, fontWeight: "bold", letterSpacing: "0.5px" }}>NEW PASSWORD</label>
                <div style={inputWrapper}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    placeholder="Enter secure new password"
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={inputStyle}
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={inlineEyeBtn}>
                    {showNewPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {isPasswordChanged && (
                  <div style={{ marginTop: "6px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ color: passwordLengthValid ? "#4ade80" : "#f87171" }}>
                      {passwordLengthValid ? "✓" : "✗"} Minimum 8 characters
                    </span>
                    <span style={{ color: passwordHasStrength ? "#4ade80" : "#f87171" }}>
                      {passwordHasStrength ? "✓" : "✗"} Contains uppercase and number
                    </span>
                  </div>
                )}
              </div>

              <div style={{ height: "1px", backgroundColor: theme.border, margin: "20px 0" }} />

              {/* CURRENT PASSWORD */}
              <div style={fieldContainer}>
                <label style={{ fontSize: "11px", color: theme.primary, fontWeight: "bold", letterSpacing: "0.5px" }}>CONFIRM CURRENT PASSWORD</label>
                <div style={inputWrapper}>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    required
                    placeholder="Required to save changes"
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ ...inputStyle, border: `1px solid ${theme.primary}`, color: theme.text, backgroundColor: theme.bg }}
                  />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={inlineEyeBtn}>
                    {showCurrentPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* FOOTER */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
            {isEditing ? (
              <button type="button" onClick={handleCancelEdit} style={{ padding: "10px 16px", backgroundColor: "transparent", color: theme.text, border: `1px solid ${theme.border}`, borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}>
                Cancel Edit
              </button>
            ) : (
              <button type="button" onClick={onClose} style={{ padding: "10px 16px", backgroundColor: "transparent", color: theme.text, border: `1px solid ${theme.border}`, borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}>
                Close
              </button>
            )}
            <button
              type="submit"
              disabled={!canSubmitForm || loading}
              style={{
                padding: "10px 20px",
                backgroundColor: canSubmitForm ? theme.primary : "rgba(128,128,128,0.15)",
                color: canSubmitForm ? "black" : theme.textMuted,
                border: "none", borderRadius: "6px",
                cursor: canSubmitForm ? "pointer" : "not-allowed",
                fontWeight: "bold", fontSize: "14px",
                transition: "all 0.2s ease"
              }}
            >
              {loading ? "Committing..." : "Save Configs"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminSettingsModal;