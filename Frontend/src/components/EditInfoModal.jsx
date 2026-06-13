import React from "react";
import {
  PHONE_PATTERN_STR,
  sanitizePhoneInput,
  isValidPhilippinePhone,
} from "../utils/phone";

function EditInfoModal({ theme, infoForm, setInfoForm, onSubmit, onClose }) {
  const update = (field, value) =>
    setInfoForm((f) => ({ ...f, [field]: value }));

  const labelStyle = {
    fontSize: "12px",
    color: theme.textMuted,
    textTransform: "uppercase",
    fontWeight: "bold",
    display: "block",
    marginBottom: "5px",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.bg,
    color: theme.text,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1100,
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        style={{
          backgroundColor: theme.surface,
          padding: "30px",
          borderRadius: "12px",
          width: "min(95vw, 500px)",
          maxHeight: "90vh",
          overflowY: "auto",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px" }}>Edit Member Info</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={infoForm.name}
                onChange={(e) => update("name", e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Contact Number</label>
              <input
                type="tel"
                inputMode="numeric"
                pattern={PHONE_PATTERN_STR}
                maxLength={11}
                title="Must be exactly 11 digits starting with 09"
                value={infoForm.contactNumber}
                onChange={(e) =>
                  update("contactNumber", sanitizePhoneInput(e.target.value))
                }
                placeholder="09171234567"
                style={inputStyle}
              />
              {infoForm.contactNumber &&
                !isValidPhilippinePhone(infoForm.contactNumber) && (
                  <div style={{ fontSize: 11, color: theme.danger, marginTop: 4 }}>
                    Must be 11 digits starting with 09
                  </div>
                )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Complete Address</label>
            <input
              type="text"
              value={infoForm.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="House No., Street, Barangay, City"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Facebook / Social Media (Optional)</label>
            <input
              type="text"
              value={infoForm.facebook}
              onChange={(e) => update("facebook", e.target.value)}
              placeholder="facebook.com/username or @handle"
              style={inputStyle}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input
                type="date"
                value={infoForm.dob}
                onChange={(e) => update("dob", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Gender</label>
              <select
                value={infoForm.gender}
                onChange={(e) => update("gender", e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Gender...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label style={labelStyle}>Age</label>
              <input
                type="number"
                min="1"
                max="120"
                value={infoForm.age}
                onChange={(e) => update("age", e.target.value)}
                placeholder="e.g., 25"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Occupation</label>
              <input
                type="text"
                value={infoForm.occupation}
                onChange={(e) => update("occupation", e.target.value)}
                placeholder="Profession"
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label style={labelStyle}>Contract ID #</label>
              <input
                type="text"
                value={infoForm.contractId}
                readOnly
                style={{
                  ...inputStyle,
                  opacity: 0.6,
                  cursor: "default",
                  backgroundColor: theme.surface,
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label style={labelStyle}>Emergency Contact Name</label>
              <input
                type="text"
                value={infoForm.emergencyContactName}
                onChange={(e) => update("emergencyContactName", e.target.value)}
                placeholder="Full Name"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Emergency Contact #</label>
              <input
                type="text"
                value={infoForm.emergencyContactNumber}
                onChange={(e) =>
                  update("emergencyContactNumber", e.target.value)
                }
                placeholder="Phone number"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Discount section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label style={labelStyle}>Discount / Promo Group</label>
              <select
                value={infoForm.discountType}
                onChange={(e) =>
                  setInfoForm((f) => ({
                    ...f,
                    discountType: e.target.value,
                    discountId: e.target.value === "None" ? "" : f.discountId,
                    discountIdType:
                      e.target.value === "None" ? "" : f.discountIdType,
                    discountSchoolName:
                      e.target.value !== "Student" ? "" : f.discountSchoolName,
                  }))
                }
                style={inputStyle}
              >
                <option value="None">Regular (No Promo)</option>
                <option value="Student">Student Promo</option>
                <option value="Senior">Senior Citizen Promo</option>
              </select>
            </div>
            {infoForm.discountType !== "None" && (
              <div>
                <label style={labelStyle}>ID Type</label>
                <select
                  value={infoForm.discountIdType}
                  onChange={(e) => update("discountIdType", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select ID Type...</option>
                  <option value="School ID">School ID</option>
                  <option value="Senior Citizen ID">Senior Citizen ID</option>
                  <option value="PWD ID">PWD ID</option>
                  <option value="Government ID">Government ID</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
          </div>

          {infoForm.discountType !== "None" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  infoForm.discountType === "Student" ? "1fr 1fr" : "1fr",
                gap: "15px",
              }}
            >
              <div>
                <label style={labelStyle}>
                  {infoForm.discountType === "Student"
                    ? "Student ID Number"
                    : "Senior Citizen ID Number"}
                </label>
                <input
                  type="text"
                  value={infoForm.discountId}
                  onChange={(e) => update("discountId", e.target.value)}
                  placeholder="Enter ID number"
                  style={inputStyle}
                />
              </div>
              {infoForm.discountType === "Student" && (
                <div>
                  <label style={labelStyle}>School Name</label>
                  <input
                    type="text"
                    value={infoForm.discountSchoolName}
                    onChange={(e) =>
                      update("discountSchoolName", e.target.value)
                    }
                    placeholder="e.g., University of Santo Tomas"
                    style={inputStyle}
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            style={{
              padding: "16px",
              backgroundColor: theme.primary,
              color: theme.primaryText,
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditInfoModal;
