import { useState, useEffect } from "react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import StatsCards from "./components/StatsCards";
import MembersTable from "./components/MembersTable";
import LiveFeed from "./components/LiveFeed";
import AddEditModal from "./components/AddEditModal";
import ProfileModal from "./components/ProfileModal";
import TdeeModal from "./components/TdeeModal";

function App() {
  // --- CORE STATES ---
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState(null);

  // --- NOTIFICATION STATE ---
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    // Automatically hide the notification after 3.5 seconds
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  // --- UI STATES ---
  // Default to Dark Mode because it's a Gym!
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") !== "light",
  );
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTdeeModal, setShowTdeeModal] = useState(false);

  // --- FORM STATES ---
  const [newName, setNewName] = useState("");
  const [newPlan, setNewPlan] = useState("");
  const [editingId, setEditingId] = useState(null);

  // --- PROFILE STATES ---
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberHistory, setMemberHistory] = useState([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // --- TDEE STATES ---
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

  // --- AUTH STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("capuno_auth") === "true",
  );

  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  // --- THEME ENGINE ---
  const theme = {
    bg: isDarkMode ? "#121212" : "#f4f6f8",
    surface: isDarkMode ? "#1e1e1e" : "#ffffff",
    border: isDarkMode ? "#333333" : "#e0e0e0",
    text: isDarkMode ? "#ffffff" : "#333333",
    textMuted: isDarkMode ? "#aaaaaa" : "#888888",
    primary: isDarkMode ? "#caff04" : "#1565c0", // Neon Yellow/Green in Dark Mode
    primaryText: isDarkMode ? "#000000" : "#ffffff",
    danger: isDarkMode ? "#ff5252" : "#d32f2f",
    success: isDarkMode ? "#00e676" : "#2e7d32",
    sidebar: isDarkMode ? "#0a0a0a" : "#102a43",
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  // --- DATA FETCHING ---
  const fetchData = () => {
    fetch("https://capunofitnessgym.infinityfreeapp.com/get_members.php")
      .then((res) => res.json())
      .then((data) => setMembers(data));
    fetch("https://capunofitnessgym.infinityfreeapp.com/get_attendance.php")
      .then((res) => res.json())
      .then((data) => setAttendanceLogs(data));
    fetch("https://capunofitnessgym.infinityfreeapp.com/get_plans.php")
      .then((res) => res.json())
      .then((data) => setPlans(data));
    fetch("https://capunofitnessgym.infinityfreeapp.com/get_stats.php")
      .then((res) => res.json())
      .then((data) => setStats(data));
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  // --- AUTHENTICATION ---
  const handleLogin = (e) => {
    e.preventDefault();
    fetch("https://capunofitnessgym.infinityfreeapp.com/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loginUser, password: loginPass }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("capuno_auth", "true");
          setIsLoggedIn(true);
          setLoginError("");
        } else {
          setLoginError(data.error);
        }
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("capuno_auth");
    setIsLoggedIn(false);
    setLoginUser("");
    setLoginPass("");
  };

  // --- CRUD ACTIONS ---
  const handleTimeIn = (memberId) => {
    fetch("https://capunofitnessgym.infinityfreeapp.com/time_in.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: memberId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showToast("Member successfully timed in!", "success");
          fetchData(); // Refresh the Live Feed and Table
        } else {
          // THIS CATCHES THE DUPLICATE CLICK!
          showToast(`⚠️ ${data.error}`, "error");
        }
      })
      .catch((err) => {
        console.error("Time In Error:", err);
        showToast("Network error. Please try again.", "error");
      });
  };

  const handleTimeOut = (memberId) => {
    fetch("https://capunofitnessgym.infinityfreeapp.com/time_out.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: memberId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success)
          fetchData(); // Refresh the feed and table
        else alert(`Error: ${data.error}`);
      })
      .catch((err) => console.error("Time Out Error:", err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPlan) {
      alert("Please select a plan!");
      return;
    }
    const targetApi = editingId ? "update_member.php" : "add_member.php";
    const payload = {
      full_name: newName,
      plan_id: newPlan,
      ...(editingId && { member_id: editingId }),
    };

    fetch(`https://capunofitnessgym.infinityfreeapp.com/${targetApi}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setShowMemberModal(false);
          cancelEdit();
          fetchData();
        }
      });
  };

  const startEditing = (member) => {
    setEditingId(member.member_id);
    setNewName(member.full_name);
    setNewPlan(member.plan_id);
    setShowMemberModal(true);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setNewName("");
    setNewPlan("");
  };
  const openAddModal = () => {
    cancelEdit();
    setShowMemberModal(true);
  };

  const handleDelete = (memberId, memberName) => {
    if (window.confirm(`Delete ${memberName} permanently?`)) {
      fetch("https://capunofitnessgym.infinityfreeapp.com/delete_member.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) fetchData();
          else alert(`❌ Deletion Failed: ${data.error}`);
        });
    }
  };

  // --- PROFILE & CALCULATIONS ---
  const viewProfile = (member) => {
    setSelectedMember(member);
    fetch(
      `https://capunofitnessgym.infinityfreeapp.com/get_member_attendance.php?id=${member.member_id}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMemberHistory(data.logs);
          setTotalVisits(data.total);
        }
      });
    fetch(
      `https://capunofitnessgym.infinityfreeapp.com/get_member_payments.php?id=${member.member_id}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPaymentHistory(data.payments);
      });
  };

  const closeProfile = () => {
    setSelectedMember(null);
    setMemberHistory([]);
    setPaymentHistory([]);
  };

  const getDaysRemaining = (expDate) => {
    if (!expDate) return "No Expiration";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiration = new Date(expDate + "T00:00:00");
    expiration.setHours(0, 0, 0, 0);

    const daysLeft = Math.round(
      (expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysLeft < 0) {
      return "Expired";
    } else if (daysLeft === 0) {
      return "Expires Today";
    } else {
      return `${daysLeft} day(s) left`;
    }
  };

  const formatSafeDate = (dateStr, includeTime = false) => {
    if (!dateStr)
      return includeTime
        ? new Date().toLocaleString()
        : new Date().toLocaleDateString();
    const d = new Date(dateStr);
    return isNaN(d) || d.getFullYear() <= 1970
      ? includeTime
        ? new Date().toLocaleString()
        : new Date().toLocaleDateString()
      : includeTime
        ? d.toLocaleString()
        : d.toLocaleDateString();
  };

  const printReceipt = (payment, member) => {
    const receiptWindow = window.open("", "_blank", "width=400,height=600");
    const transactionId = `TXN-${new Date().getFullYear()}-${payment.payment_id.toString().padStart(5, "0")}`;
    receiptWindow.document.write(
      `<html><head><title>Receipt</title><style>body{font-family:monospace;padding:20px;text-align:center} .divider{border-bottom:1px dashed #333;margin:15px 0} .row{display:flex;justify-content:space-between;text-align:left}</style></head><body><h2>CAPUNO FITNESS</h2><p>Official Receipt</p><div class="divider"></div><div class="row"><span>Receipt #:</span><strong>${transactionId}</strong></div><div class="row"><span>Date:</span><strong>${formatSafeDate(payment.payment_date, true)}</strong></div><div class="row"><span>Member:</span><strong>${member.full_name}</strong></div><div class="divider"></div><div class="row" style="font-size:18px"><span>TOTAL:</span><strong>₱${parseFloat(payment.amount).toFixed(2)}</strong></div><div class="divider"></div><p>Thank you for grinding!</p></body></html>`,
    );
    receiptWindow.document.close();
    receiptWindow.focus();
    setTimeout(() => {
      receiptWindow.print();
    }, 500);
  };

  const calculateTDEE = (e) => {
    e.preventDefault();
    const calcWeight =
      tdeeData.weightUnit === "lbs"
        ? tdeeData.weight * 0.453592
        : parseFloat(tdeeData.weight);
    const calcHeight =
      tdeeData.heightUnit === "ftin"
        ? parseFloat(tdeeData.heightFt) * 30.48 +
          parseFloat(tdeeData.heightIn) * 2.54
        : parseFloat(tdeeData.heightCm);
    let bmr =
      tdeeData.gender === "male"
        ? 10 * calcWeight + 6.25 * calcHeight - 5 * tdeeData.age + 5
        : 10 * calcWeight + 6.25 * calcHeight - 5 * tdeeData.age - 161;
    setTdeeResult(Math.round(bmr * tdeeData.activity));
  };

  const filteredMembers = members.filter((member) =>
    (member.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ==========================================
  // RENDER: LOGIN GATE
  // ==========================================
  if (!isLoggedIn) {
    return (
      <Login
        theme={theme}
        loginUser={loginUser}
        setLoginUser={setLoginUser}
        loginPass={loginPass}
        setLoginPass={setLoginPass}
        loginError={loginError}
        handleLogin={handleLogin}
      />
    );
  }

  // ==========================================
  // RENDER: MAIN DASHBOARD
  // ==========================================
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: theme.bg,
        color: theme.text,
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 1. SIDEBAR */}
      <Sidebar
        theme={theme}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        openAddModal={openAddModal}
        setShowTdeeModal={setShowTdeeModal}
      />

      <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "28px" }}>Gym Overview</h1>
          <button
            onClick={openAddModal}
            style={{
              padding: "12px 24px",
              backgroundColor: theme.primary,
              color: theme.primaryText,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              boxShadow: `0 4px 14px ${isDarkMode ? "rgba(202, 255, 4, 0.3)" : "rgba(21, 101, 192, 0.3)"}`,
            }}
          >
            + Add New Member
          </button>
        </div>

        {/* 2. STATS CARDS */}
        <StatsCards stats={stats} theme={theme} />

        <div style={{ display: "flex", gap: "20px" }}>
          {/* 3. MEMBERS TABLE */}
          <MembersTable
            theme={theme}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredMembers={filteredMembers}
            getDaysRemaining={getDaysRemaining}
            handleTimeIn={handleTimeIn}
            handleTimeOut={handleTimeOut}
            attendanceLogs={attendanceLogs}
            viewProfile={viewProfile}
            startEditing={startEditing}
            handleDelete={handleDelete}
          />

          {/* 4. LIVE FEED */}
          <LiveFeed theme={theme} attendanceLogs={attendanceLogs} />
        </div>
      </div>

      {/* 5. MODALS */}
      {showMemberModal && (
        <AddEditModal
          theme={theme}
          editingId={editingId}
          cancelEdit={cancelEdit}
          setShowMemberModal={setShowMemberModal}
          handleSubmit={handleSubmit}
          newName={newName}
          setNewName={setNewName}
          newPlan={newPlan}
          setNewPlan={setNewPlan}
          plans={plans}
        />
      )}
      {selectedMember && (
        <ProfileModal
          theme={theme}
          selectedMember={selectedMember}
          closeProfile={closeProfile}
          totalVisits={totalVisits}
          paymentHistory={paymentHistory}
          formatSafeDate={formatSafeDate}
          printReceipt={printReceipt}
          memberHistory={memberHistory}
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
      {/* --- TOAST NOTIFICATION UI --- */}
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
            zIndex: 99999, // Extremely high to stay on top of everything
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {toast.message}
        </div>
      )}
    </div> // <-- This is your final closing div for the app
  );
}
export default App;
