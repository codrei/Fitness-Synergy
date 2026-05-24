import { useState, useEffect, useMemo } from "react";
import RevenueReport from "./components/RevenueReport";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import StatsCards from "./components/StatsCards";
import MembersTable from "./components/MembersTable";
import LiveFeed from "./components/LiveFeed";
import AddEditModal from "./components/AddEditModal";
import ProfileModal from "./components/ProfileModal";
import TdeeModal from "./components/TdeeModal";
import bgTexture from "./assets/geomblue.png";

const API_BASE = "http://localhost:8080";

const formatSafeDate = (dateStr, includeTime = false) => {
  if (!dateStr)
    return includeTime
      ? new Date().toLocaleString()
      : new Date().toLocaleDateString();
  const d = new Date(dateStr);
  if (isNaN(d) || d.getFullYear() <= 1970)
    return includeTime
      ? new Date().toLocaleString()
      : new Date().toLocaleDateString();
  return includeTime ? d.toLocaleString() : d.toLocaleDateString();
};

const getDaysRemaining = (expDate) => {
  if (!expDate) return "No Expiration";
  const today = new Date().setHours(0, 0, 0, 0);
  const expiration = new Date(expDate + "T00:00:00").setHours(0, 0, 0, 0);
  const daysLeft = Math.round((expiration - today) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "Expired";
  if (daysLeft === 0) return "Expires Today";
  return `${daysLeft} day(s) left`;
};

function App() {
  const [members, setMembers] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("fitness_synergy_auth") === "true",
  );
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") !== "light",
  );
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTdeeModal, setShowTdeeModal] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [editingId, setEditingId] = useState(null);

  // Basic Info States
  const [newName, setNewName] = useState("");
  const [newPlan, setNewPlan] = useState("");
  const [bonusDays, setBonusDays] = useState(0);
  const [customPrice, setCustomPrice] = useState("");

  // NEW STAGES: Profile Data States
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");
  const [contractId, setContractId] = useState("");
  const [discountType, setDiscountType] = useState("None");
  const [discountId, setDiscountId] = useState("");
  const [cashAmount, setCashAmount] = useState(0);
  const [gcashAmount, setGcashAmount] = useState(0);
  const [mayaAmount, setMayaAmount] = useState(0);
  const [debitAmount, setDebitAmount] = useState(0);
  const [creditAmount, setCreditAmount] = useState(0);

  const [selectedMember, setSelectedMember] = useState(null);
  const [memberHistory, setMemberHistory] = useState({
    logs: [],
    visits: 0,
    payments: [],
  });
  const [tdeeData, setTdeeData] = useState({
    gender: "male",
    age: 25,
    weightUnit: "kg",
    weight: 70,
    heightUnit: "cm",
    heightCm: 170,
    heightFt: 5,
    heightIn: 7,
    activity: 1.2,
  });
  const [tdeeResult, setTdeeResult] = useState(0);
  const [loginForm, setLoginForm] = useState({ user: "", pass: "", error: "" });
  const [currentTime, setCurrentTime] = useState(new Date());

  const theme = useMemo(
    () => ({
      bg: isDarkMode ? "#081018" : "#f5f5f5",
      surface: isDarkMode ? "#1e1e1e" : "#ffffff",
      border: isDarkMode ? "#333333" : "#e0e0e0",
      text: isDarkMode ? "#ffffff" : "#333333",
      textMuted: isDarkMode ? "#9fb3c8" : "#666666",
      primary: isDarkMode ? "#00bfff" : "#1565c0",
      primaryText: isDarkMode ? "#000000" : "#ffffff",
      danger: isDarkMode ? "#ff5252" : "#d32f2f",
      success: isDarkMode ? "#00e676" : "#2e7d32",
      sidebar: isDarkMode ? "#07131f" : "#102a43",
    }),
    [isDarkMode],
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3500,
    );
  };

  // Helper resetting states when modal closes or saves successfully
  const clearMemberForm = () => {
    setEditingId(null);
    setNewName("");
    setNewPlan("");
    setBonusDays(0);
    setCustomPrice("");
    setAddress("");
    setContactNumber("");
    setDob("");
    setGender("");
    setOccupation("");
    setEmergencyContactName("");
    setEmergencyContactNumber("");
    setContractId("");
    setDiscountType("None");
    setDiscountId("");
    setCashAmount(0);
    setGcashAmount(0);
    setMayaAmount(0);
    setDebitAmount(0);
    setCreditAmount(0);
  };

  const fetchData = async () => {
    try {
      const endpoints = [
        "get_members",
        "get_attendance",
        "get_plans",
        "get_stats",
      ];
      const results = await Promise.all(
        endpoints.map((e) =>
          fetch(`${API_BASE}/${e}.php`).then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          }),
        ),
      );
      setMembers(results[0] || []);
      setAttendanceLogs(results[1] || []);
      setPlans(results[2] || []);
      setStats(results[3] || null);
    } catch (err) {
      console.error("Fetch error (Server might be offline):", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginForm((p) => ({ ...p, error: "" }));
    try {
      const response = await fetch(`${API_BASE}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginForm.user,
          password: loginForm.pass,
        }),
      });
      if (!response.ok) throw new Error("Server offline");
      const res = await response.json();
      if (res.success) {
        localStorage.setItem("fitness_synergy_auth", "true");
        setIsLoggedIn(true);
      } else {
        setLoginForm((prev) => ({
          ...prev,
          error: res.error || "Invalid Credentials",
        }));
      }
    } catch (err) {
      setLoginForm((prev) => ({
        ...prev,
        error: "Cannot connect to local server (Port 8080).",
      }));
    }
  };

  const handleAttendance = async (memberId, action) => {
    try {
      const res = await fetch(`${API_BASE}/time_${action}.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId }),
      }).then((r) => r.json());

      if (res.success) {
        showToast(`Member successfully timed ${action}!`);
        fetchData();
      } else {
        showToast(res.error, "error");
      }
    } catch (err) {
      showToast("Attendance Server Error", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPlan) return alert("Please select a plan!");

    try {
      const target = editingId ? "update_member" : "add_member";
      const res = await fetch(`${API_BASE}/${target}.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: newName,
          plan_id: newPlan,
          bonus_days: bonusDays,
          custom_price: customPrice,
          address: address,
          contact_number: contactNumber,
          dob: dob,
          gender: gender,
          occupation: occupation,
          emergency_contact_name: emergencyContactName,
          emergency_contact_number: emergencyContactNumber,
          contract_id: contractId,
          discount_type: discountType,
          discount_id: discountId,
          cash_amount: cashAmount,
          gcash_amount: gcashAmount,
          maya_amount: mayaAmount,
          debit_amount: debitAmount,
          credit_amount: creditAmount,
          ...(editingId && { member_id: editingId }),
        }),
      }).then((r) => r.json());

      if (res.success) {
        setShowMemberModal(false);
        clearMemberForm();
        fetchData();
        showToast(editingId ? "Member Updated" : "Member Added");
      } else {
        showToast(res.error || "Submission Failed", "error");
      }
    } catch (err) {
      showToast("Submission Failed", "error");
    }
  };

  const viewProfile = async (member) => {
    setSelectedMember(member);
    try {
      const [att, pay] = await Promise.all([
        fetch(
          `${API_BASE}/get_member_attendance.php?id=${member.member_id}`,
        ).then((r) => r.json()),
        fetch(
          `${API_BASE}/get_member_payments.php?id=${member.member_id}`,
        ).then((r) => r.json()),
      ]);
      setMemberHistory({
        logs: att.logs || [],
        visits: att.total || 0,
        payments: pay.payments || [],
      });
    } catch (err) {
      console.error("Profile Fetch error:", err);
    }
  };

  const calculateTDEE = (e) => {
    e.preventDefault();
    const w =
      tdeeData.weightUnit === "lbs"
        ? tdeeData.weight * 0.453592
        : parseFloat(tdeeData.weight);
    const h =
      tdeeData.heightUnit === "ftin"
        ? tdeeData.heightFt * 30.48 + tdeeData.heightIn * 2.54
        : parseFloat(tdeeData.heightCm);
    let bmr =
      tdeeData.gender === "male"
        ? 10 * w + 6.25 * h - 5 * tdeeData.age + 5
        : 10 * w + 6.25 * h - 5 * tdeeData.age - 161;
    setTdeeResult(Math.round(bmr * tdeeData.activity));
  };

  const filteredMembers = members.filter((m) =>
    (m.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentTime.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  if (!isLoggedIn)
    return (
      <Login
        theme={theme}
        loginUser={loginForm.user}
        setLoginUser={(val) => setLoginForm((p) => ({ ...p, user: val }))}
        loginPass={loginForm.pass}
        setLoginPass={(val) => setLoginForm((p) => ({ ...p, pass: val }))}
        loginError={loginForm.error}
        handleLogin={handleLogin}
      />
    );

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        color: theme.text,
        fontFamily: "sans-serif",
        overflow: "hidden",
        backgroundColor: isDarkMode
          ? "rgba(5,10,20,0.88)"
          : "rgba(240,248,255,0.82)",
        backgroundImage: `url(${bgTexture})`,
        backgroundBlendMode: "overlay",
        backgroundSize: "cover",
      }}
    >
      <Sidebar
        theme={theme}
        isDarkMode={isDarkMode}
        toggleTheme={() => {
          setIsDarkMode(!isDarkMode);
          localStorage.setItem("theme", !isDarkMode ? "dark" : "light");
        }}
        handleLogout={() => {
          localStorage.removeItem("fitness_synergy_auth");
          setIsLoggedIn(false);
        }}
        openAddModal={() => {
          clearMemberForm();
          setShowMemberModal(true);
        }}
        setShowTdeeModal={setShowTdeeModal}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <main style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        {currentView.startsWith("revenue") ? (
          <RevenueReport theme={theme} activeTab={currentView} />
        ) : (
          <>
            <header
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              <h1 style={{ margin: 0, fontSize: "28px" }}>
                Fitness Synergy Dashboard
              </h1>
              <div
                style={{
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: theme.text,
                    letterSpacing: "0.5px",
                  }}
                >
                  {formattedTime}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: theme.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginTop: "4px",
                  }}
                >
                  {formattedDate}
                </span>
              </div>
            </header>

            <div
              style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <StatsCards stats={stats} theme={theme} />
                <MembersTable
                  theme={theme}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filteredMembers={filteredMembers}
                  getDaysRemaining={getDaysRemaining}
                  handleTimeIn={(id) => handleAttendance(id, "in")}
                  handleTimeOut={(id) => handleAttendance(id, "out")}
                  attendanceLogs={attendanceLogs}
                  viewProfile={viewProfile}
                  handleDelete={(id, name) => {
                    if (window.confirm(`Delete ${name}?`)) {
                      fetch(`${API_BASE}/delete_member.php`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ member_id: id }),
                      })
                        .then(fetchData)
                        .catch(() => showToast("Delete failed", "error"));
                    }
                  }}
                  startEditing={(m) => {
                    setEditingId(m.member_id);
                    setNewName(m.full_name);
                    setNewPlan(m.plan_id);
                    setAddress(m.address || "");
                    setContactNumber(m.contact_number || "");
                    setDob(m.dob || "");
                    setGender(m.gender || "");
                    setOccupation(m.occupation || "");
                    setEmergencyContactName(m.emergency_contact_name || "");
                    setEmergencyContactNumber(m.emergency_contact_number || "");
                    setContractId(m.contract_id || "");
                    setDiscountType(m.discount_type || "None");
                    setDiscountId(m.discount_id || "");
                    setShowMemberModal(true);
                  }}
                />
              </div>
              <div style={{ width: "350px", flexShrink: 0 }}>
                <LiveFeed theme={theme} attendanceLogs={attendanceLogs} />
              </div>
            </div>
          </>
        )}
      </main>

      {showMemberModal && (
        <AddEditModal
          theme={theme}
          editingId={editingId}
          cancelEdit={clearMemberForm}
          setShowMemberModal={setShowMemberModal}
          handleSubmit={handleSubmit}
          newName={newName}
          setNewName={setNewName}
          newPlan={newPlan}
          setNewPlan={setNewPlan}
          plans={plans}
          bonusDays={bonusDays}
          setBonusDays={setBonusDays}
          customPrice={customPrice}
          setCustomPrice={setCustomPrice}
          address={address}
          setAddress={setAddress}
          contactNumber={contactNumber}
          setContactNumber={setContactNumber}
          dob={dob}
          setDob={setDob}
          gender={gender}
          setGender={setGender}
          occupation={occupation}
          setOccupation={setOccupation}
          emergencyContactName={emergencyContactName}
          setEmergencyContactName={setEmergencyContactName}
          emergencyContactNumber={emergencyContactNumber}
          setEmergencyContactNumber={setEmergencyContactNumber}
          contractId={contractId}
          setContractId={setContractId}
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountId={discountId}
          setDiscountId={setDiscountId}
          cashAmount={cashAmount}
          setCashAmount={setCashAmount}
          gcashAmount={gcashAmount}
          setGcashAmount={setGcashAmount}
          mayaAmount={mayaAmount}
          setMayaAmount={setMayaAmount}
          debitAmount={debitAmount}
          setDebitAmount={setDebitAmount}
          creditAmount={creditAmount}
          setCreditAmount={setCreditAmount}
        />
      )}

      {selectedMember && (
        <ProfileModal
          theme={theme}
          selectedMember={selectedMember}
          closeProfile={() => setSelectedMember(null)}
          totalVisits={memberHistory.visits}
          paymentHistory={memberHistory.payments}
          formatSafeDate={formatSafeDate}
          memberHistory={memberHistory.logs}
        />
      )}
      {showTdeeModal && (
        <TdeeModal
          theme={theme}
          setShowTdeeModal={setShowTdeeModal}
          calculateTDEE={calculateTDEE}
          tdeeData={tdeeData}
          setTdeeData={setTdeeData}
          tdeeResult={tdeeResult}
        />
      )}

      {toast.show && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            backgroundColor:
              toast.type === "error" ? theme.danger : theme.success,
            color: "white",
            padding: "16px 24px",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
            zIndex: 99999,
            fontWeight: "bold",
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
