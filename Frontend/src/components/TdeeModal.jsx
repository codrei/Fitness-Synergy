import React from "react";

function TdeeModal({
  theme,
  setShowTdeeModal,
  calculateTDEE,
  tdeeData,
  setTdeeData,
  tdeeResult,
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        style={{
          backgroundColor: theme.surface,
          padding: "30px",
          borderRadius: "12px",
          width: "450px",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${theme.border}`,
            paddingBottom: "15px",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, color: theme.primary }}>TDEE Calculator</h2>
          <button
            onClick={() => setShowTdeeModal(false)}
            style={{
              background: "none",
              border: "none",
              color: theme.textMuted,
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
        <form
          onSubmit={calculateTDEE}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: theme.textMuted }}>
                Gender
              </label>
              <select
                value={tdeeData.gender}
                onChange={(e) =>
                  setTdeeData({ ...tdeeData, gender: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.bg,
                  color: theme.text,
                }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: theme.textMuted }}>
                Age
              </label>
              <input
                type="number"
                required
                value={tdeeData.age}
                onChange={(e) =>
                  setTdeeData({ ...tdeeData, age: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.bg,
                  color: theme.text,
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: theme.textMuted }}>
                Weight Unit
              </label>
              <select
                value={tdeeData.weightUnit}
                onChange={(e) =>
                  setTdeeData({ ...tdeeData, weightUnit: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.bg,
                  color: theme.text,
                }}
              >
                <option value="kg">KG</option>
                <option value="lbs">LBS</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: theme.textMuted }}>
                Weight
              </label>
              <input
                type="number"
                required
                value={tdeeData.weight}
                onChange={(e) =>
                  setTdeeData({ ...tdeeData, weight: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.bg,
                  color: theme.text,
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: theme.textMuted }}>
                Height Unit
              </label>
              <select
                value={tdeeData.heightUnit}
                onChange={(e) =>
                  setTdeeData({ ...tdeeData, heightUnit: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.bg,
                  color: theme.text,
                }}
              >
                <option value="cm">CM</option>
                <option value="ftin">FT/IN</option>
              </select>
            </div>
            {tdeeData.heightUnit === "cm" ? (
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "12px", color: theme.textMuted }}>
                  Height (cm)
                </label>
                <input
                  type="number"
                  required
                  value={tdeeData.heightCm}
                  onChange={(e) =>
                    setTdeeData({ ...tdeeData, heightCm: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    borderRadius: "6px",
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.bg,
                    color: theme.text,
                  }}
                />
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", gap: "5px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: theme.textMuted }}>
                    Ft
                  </label>
                  <input
                    type="number"
                    required
                    value={tdeeData.heightFt}
                    onChange={(e) =>
                      setTdeeData({ ...tdeeData, heightFt: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      borderRadius: "6px",
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.bg,
                      color: theme.text,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: theme.textMuted }}>
                    In
                  </label>
                  <input
                    type="number"
                    required
                    value={tdeeData.heightIn}
                    onChange={(e) =>
                      setTdeeData({ ...tdeeData, heightIn: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      borderRadius: "6px",
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.bg,
                      color: theme.text,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <div>
            <label style={{ fontSize: "12px", color: theme.textMuted }}>
              Activity Level
            </label>
            <select
              value={tdeeData.activity}
              onChange={(e) =>
                setTdeeData({
                  ...tdeeData,
                  activity: parseFloat(e.target.value),
                })
              }
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                borderRadius: "6px",
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.bg,
                color: theme.text,
              }}
            >
              <option value={1.2}>Sedentary (Little exercise)</option>
              <option value={1.375}>Lightly Active (1-3 days)</option>
              <option value={1.55}>Moderately Active (3-5 days)</option>
              <option value={1.725}>Very Active (6-7 days)</option>
              <option value={1.9}>Extra Active (Physical job)</option>
            </select>
          </div>
          <button
            type="submit"
            style={{
              padding: "14px",
              backgroundColor: theme.primary,
              color: theme.primaryText,
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              marginTop: "10px",
            }}
          >
            Calculate Output
          </button>
        </form>
        {tdeeResult > 0 && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              backgroundColor: theme.bg,
              border: `1px solid ${theme.primary}`,
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                margin: "0 0 15px 0",
                color: theme.primary,
                fontSize: "20px",
              }}
            >
              Maintenance: {tdeeResult} kcal
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                fontSize: "14px",
              }}
            >
              <div>
                <strong style={{ color: theme.textMuted }}>Cutting</strong>
                <br />
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {tdeeResult - 500}
                </span>
              </div>
              <div>
                <strong style={{ color: theme.textMuted }}>Bulking</strong>
                <br />
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {tdeeResult + 500}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TdeeModal;
