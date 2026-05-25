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
import ConfirmModal from "./components/ConfirmModal";
import bgTexture from "./assets/geomblue.png";
import { apiFetch } from "./api";

const MEMBER_FORM_DEFAULT = {
  name: "",
  plan: "",
  bonusDays: 0,
  customPrice: "",
  address: "",
  contactNumber: "",
  dob: "",
  gender: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  contractId: "",
  discountType: "None",
  discountId: "",
  cashAmount: 0,
  gcashAmount: 0,
  mayaAmount: 0,
  debitAmount: 0,
  creditAmount: 0,
};

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
    !!localStorage.getItem("fitness_synergy_token"),
  );
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") !== "light",
  );
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTdeeModal, setShowTdeeModal] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [editingId, setEditingId] = useState(null);
  const [memberForm, setMemberForm] = useState(MEMBER_FORM_DEFAULT);
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

  const clearMemberForm = () => {
    setEditingId(null);
    setMemberForm(MEMBER_FORM_DEFAULT);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const endpoints = [
        "get_members",
        "get_attendance",
        "get_plans",
        "get_stats",
      ];
      const responses = await Promise.all(
        endpoints.map((e) => apiFetch(`${e}.php`)),
      );

      if (responses.some((r) => r.status === 401)) {
        localStorage.removeItem("fitness_synergy_token");
        setIsLoggedIn(false);
        return;
      }

      const results = await Promise.all(
        responses.map((res) => {
          if (!res.ok) throw new Error(`Server error: ${res.status}`);
          return res.json();
        }),
      );
      setMembers(results[0] || []);
      setAttendanceLogs(results[1] || []);
      setPlans(results[2] || []);
      setStats(results[3] || null);
    } catch (err) {
      showToast("Failed to load data. Check server connection.", "error");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginForm((p) => ({ ...p, error: "" }));
    try {
      const response = await apiFetch("login.php", {
        method: "POST",
        body: JSON.stringify({
          username: loginForm.user,
          password: loginForm.pass,
        }),
      });
      if (!response.ok) throw new Error("Server offline");
      const res = await response.json();
      if (res.success) {
        localStorage.setItem("fitness_synergy_token", res.token);
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
      const res = await apiFetch(`time_${action}.php`, {
        method: "POST",
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
    if (!memberForm.plan) return alert("Please select a plan!");

    try {
      const target = editingId ? "update_member" : "add_member";
      const res = await apiFetch(`${target}.php`, {
        method: "POST",
        body: JSON.stringify({
          full_name: memberForm.name,
          plan_id: memberForm.plan,
          bonus_days: memberForm.bonusDays,
          custom_price: memberForm.customPrice,
          address: memberForm.address,
          contact_number: memberForm.contactNumber,
          dob: memberForm.dob,
          gender: memberForm.gender,
          occupation: memberForm.occupation,
          emergency_contact_name: memberForm.emergencyContactName,
          emergency_contact_number: memberForm.emergencyContactNumber,
          contract_id: memberForm.contractId,
          discount_type: memberForm.discountType,
          discount_id: memberForm.discountId,
          cash_amount: memberForm.cashAmount,
          gcash_amount: memberForm.gcashAmount,
          maya_amount: memberForm.mayaAmount,
          debit_amount: memberForm.debitAmount,
          credit_amount: memberForm.creditAmount,
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
        apiFetch(`get_member_attendance.php?id=${member.member_id}`).then((r) => r.json()),
        apiFetch(`get_member_payments.php?id=${member.member_id}`).then((r) => r.json()),
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
          apiFetch("logout.php", { method: "POST" }).catch(() => {});
          localStorage.removeItem("fitness_synergy_token");
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <main style={{ flex: 1, padding: "30px", overflowY: "auto", position: "relative" }}>
        {isLoading && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 100,
            display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center", gap: "16px",
            backgroundColor: "rgba(0,0,0,0.25)", backdropFilter: "blur(2px)",
          }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "50%",
              border: `4px solid ${theme.border}`,
              borderTop: `4px solid ${theme.primary}`,
              animation: "spin 0.75s linear infinite",
            }} />
            <span style={{ color: theme.text, fontWeight: "bold", fontSize: "14px" }}>
              Loading data...
            </span>
          </div>
        )}
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
                <StatsCards stats={stats} theme={theme} isDarkMode={isDarkMode} />
                <MembersTable
                  theme={theme}
                  isDarkMode={isDarkMode}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filteredMembers={filteredMembers}
                  getDaysRemaining={getDaysRemaining}
                  handleTimeIn={(id) => handleAttendance(id, "in")}
                  handleTimeOut={(id) => handleAttendance(id, "out")}
                  attendanceLogs={attendanceLogs}
                  viewProfile={viewProfile}
                  handleDelete={(id, name) => {
                    setDeleteConfirm({ show: true, id, name });
                  }}
                  startEditing={(m) => {
                    setEditingId(m.member_id);
                    setMemberForm({
                      name: m.full_name,
                      plan: m.plan_id,
                      bonusDays: 0,
                      customPrice: "",
                      address: m.address || "",
                      contactNumber: m.contact_number || "",
                      dob: m.dob || "",
                      gender: m.gender || "",
                      occupation: m.occupation || "",
                      emergencyContactName: m.emergency_contact_name || "",
                      emergencyContactNumber: m.emergency_contact_number || "",
                      contractId: m.contract_id || "",
                      discountType: m.discount_type || "None",
                      discountId: m.discount_id || "",
                      cashAmount: 0,
                      gcashAmount: 0,
                      mayaAmount: 0,
                      debitAmount: 0,
                      creditAmount: 0,
                    });
                    setShowMemberModal(true);
                  }}
                />
              </div>
              <div style={{ width: "350px", flexShrink: 0 }}>
                <LiveFeed
                  theme={theme}
                  isDarkMode={isDarkMode}
                  attendanceLogs={attendanceLogs}
                />
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
          plans={plans}
          memberForm={memberForm}
          setMemberForm={setMemberForm}
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

      {deleteConfirm.show && (
        <ConfirmModal
          theme={theme}
          name={deleteConfirm.name}
          onCancel={() => setDeleteConfirm({ show: false, id: null, name: "" })}
          onConfirm={() => {
            apiFetch("delete_member.php", {
              method: "POST",
              body: JSON.stringify({ member_id: deleteConfirm.id }),
            })
              .then(fetchData)
              .catch(() => showToast("Delete failed", "error"));
            setDeleteConfirm({ show: false, id: null, name: "" });
          }}
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
