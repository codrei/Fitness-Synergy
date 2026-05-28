import { useState, useEffect, useMemo } from "react";
import RevenueReport from "./components/RevenueReport";
import PlansManager from "./components/PlansManager";
import PromosManager from "./components/PromosManager";
import ExpensesManager from "./components/ExpensesManager";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import StatsCards from "./components/StatsCards";
import MembersTable from "./components/MembersTable";
import LiveFeed from "./components/LiveFeed";
import AddEditModal from "./components/AddEditModal";
import WalkInModal from "./components/WalkInModal";
import ProfileModal from "./components/ProfileModal";
import RenewalModal from "./components/RenewalModal";
import EditInfoModal from "./components/EditInfoModal";
import TimeInConfirmModal from "./components/TimeInConfirmModal";
import InstallmentPaymentModal from "./components/InstallmentPaymentModal";
import TdeeModal from "./components/TdeeModal";
import ConfirmModal from "./components/ConfirmModal";
import AdminSettingsModal from "./components/AdminSettingsModal";
import PhotoCropModal from "./components/PhotoCropModal"; // 1. IMPORT NEW MODAL
import bgTexture from "./assets/geomblue.png";
import { apiFetch } from "./api";
import AttendanceReport from "./components/AttendanceReport";

const WALKIN_FORM_DEFAULT = {
  guestName: "",
  guestAge: "",
  guestContact: "",
  guestAddress: "",
  customPrice: "",
  paymentMethod: "Cash",
  referenceNumber: "",
};

const RENEWAL_FORM_DEFAULT = {
  planId: "",
  promoId: "",
  customPrice: "",
  bonusDays: 0,
  isInstallment: false,
  installmentTotal: "",
  paymentMethod: "Cash",
  paymentAmount: "",
  referenceNumber: "",
};

const MEMBER_FORM_DEFAULT = {
  name: "",
  plan: "",
  promoId: "",
  bonusDays: 0,
  customPrice: "",
  isInstallment: false,
  installmentTotal: "",
  address: "",
  contactNumber: "",
  facebook: "",
  dob: "",
  age: "",
  gender: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  discountType: "None",
  discountId: "",
  discountIdType: "",
  discountSchoolName: "",
  paymentMethod: "Cash",
  paymentAmount: "",
  referenceNumber: "",
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
  const [promos, setPromos] = useState([]);
  const [stats, setStats] = useState(null);
  const [installmentPaymentMember, setInstallmentPaymentMember] =
    useState(null);
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
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
    name: "",
  });
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInForm, setWalkInForm] = useState(WALKIN_FORM_DEFAULT);
  const [walkInRecommend, setWalkInRecommend] = useState({
    show: false,
    name: "",
    visits: 0,
  });
  const [showTdeeModal, setShowTdeeModal] = useState(false);
  const [showAdminSettingsModal, setShowAdminSettingsModal] = useState(false); // 2. STATE FOR MODAL
  const [postRegPhotoPrompt, setPostRegPhotoPrompt] = useState(null);
  const [postRegPhotoUpload, setPostRegPhotoUpload] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [editingId, setEditingId] = useState(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalMember, setRenewalMember] = useState(null);
  const [renewalForm, setRenewalForm] = useState(RENEWAL_FORM_DEFAULT);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [editInfoMember, setEditInfoMember] = useState(null);
  const [infoForm, setInfoForm] = useState({});
  const [timeInConfirmMember, setTimeInConfirmMember] = useState(null);
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

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? "#050a14" : "#dce6f0";
  }, [isDarkMode]);

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
        "get_promos",
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
      setPromos(Array.isArray(results[4]) ? results[4] : []);
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
        error:
          "Cannot connect to server. Please check your internet connection.",
      }));
    }
  };

  const handleTimeIn = async (memberId) => {
    try {
      const res = await apiFetch("time_in.php", {
        method: "POST",
        body: JSON.stringify({ member_id: memberId }),
      }).then((r) => r.json());

      if (res.success) {
        showToast("Member successfully timed in!");
        fetchData();
      } else {
        showToast(res.error, "error");
      }
    } catch (err) {
      showToast("Attendance Server Error", "error");
    }
  };

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("add_walkin.php", {
        method: "POST",
        body: JSON.stringify({
          guest_name: walkInForm.guestName,
          guest_age: walkInForm.guestAge,
          guest_contact: walkInForm.guestContact,
          guest_address: walkInForm.guestAddress,
          custom_price: walkInForm.customPrice,
          payment_method: walkInForm.paymentMethod,
          reference_number: walkInForm.referenceNumber,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setShowWalkInModal(false);
        setWalkInForm(WALKIN_FORM_DEFAULT);
        fetchData();
        showToast("Walk-in registered!");
        if (res.recommend_membership) {
          setWalkInRecommend({
            show: true,
            name: res.guest_name,
            visits: res.visit_count,
          });
        }
      } else {
        showToast(res.error || "Walk-in registration failed", "error");
      }
    } catch (err) {
      showToast("Walk-in registration failed", "error");
    }
  };

  const handleSubmit = async (e, force = false) => {
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
          is_installment: memberForm.isInstallment ? 1 : 0,
          installment_total: memberForm.installmentTotal,
          address: memberForm.address,
          contact_number: memberForm.contactNumber,
          facebook: memberForm.facebook,
          dob: memberForm.dob,
          age: memberForm.age !== "" ? parseInt(memberForm.age) : null,
          gender: memberForm.gender,
          occupation: memberForm.occupation,
          emergency_contact_name: memberForm.emergencyContactName,
          emergency_contact_number: memberForm.emergencyContactNumber,
          discount_type: memberForm.discountType,
          discount_id: memberForm.discountId,
          discount_id_type: memberForm.discountIdType,
          discount_school_name: memberForm.discountSchoolName,
          payment_method: memberForm.paymentMethod,
          payment_amount: memberForm.paymentAmount,
          reference_number: memberForm.referenceNumber,
          force: force,
          ...(editingId && { member_id: editingId }),
        }),
      }).then((r) => r.json());

      if (res.success) {
        setShowMemberModal(false);
        fetchData();
        if (!editingId && res.member_id) {
          const savedName = memberForm.name;
          clearMemberForm();
          setPostRegPhotoPrompt({ memberId: res.member_id, memberName: savedName });
        } else {
          clearMemberForm();
          showToast(editingId ? "Member Updated" : "Member Added");
        }
      } else if (res.duplicate_warning) {
        return res;
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
        apiFetch(`get_member_attendance.php?id=${member.member_id}`).then((r) =>
          r.json(),
        ),
        apiFetch(`get_member_payments.php?id=${member.member_id}`).then((r) =>
          r.json(),
        ),
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

  const startRenewal = (member) => {
    setRenewalMember(member);
    setRenewalForm({ ...RENEWAL_FORM_DEFAULT, planId: member.plan_id || "" });
    setShowRenewalModal(true);
  };

  const handleRenewal = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("renew_member.php", {
        method: "POST",
        body: JSON.stringify({
          member_id: renewalMember.member_id,
          plan_id: renewalForm.planId,
          custom_price: renewalForm.customPrice,
          bonus_days: renewalForm.bonusDays,
          is_installment: renewalForm.isInstallment ? 1 : 0,
          installment_total: renewalForm.installmentTotal,
          payment_method: renewalForm.paymentMethod,
          payment_amount: renewalForm.paymentAmount,
          reference_number: renewalForm.referenceNumber,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setShowRenewalModal(false);
        setRenewalMember(null);
        setRenewalForm(RENEWAL_FORM_DEFAULT);
        fetchData();
        showToast("Membership renewed!");
      } else {
        showToast(res.error || "Renewal failed", "error");
      }
    } catch {
      showToast("Renewal failed", "error");
    }
  };

  const handleInstallmentPaymentSuccess = () => {
    setInstallmentPaymentMember(null);
    showToast("Installment payment recorded!");
    if (selectedMember) viewProfile(selectedMember);
  };

  const openEditInfo = (member) => {
    setEditInfoMember(member);
    setInfoForm({
      name: member.full_name || "",
      contactNumber: member.contact_number || "",
      address: member.address || "",
      facebook: member.facebook || "",
      dob: member.dob || "",
      age: member.age || "",
      gender: member.gender || "",
      occupation: member.occupation || "",
      contractId: member.contract_id || "",
      emergencyContactName: member.emergency_contact_name || "",
      emergencyContactNumber: member.emergency_contact_number || "",
      discountType: member.discount_type || "None",
      discountId: member.discount_id || "",
      discountIdType: member.discount_id_type || "",
      discountSchoolName: member.discount_school_name || "",
    });
    setShowEditInfoModal(true);
  };

  const handleEditInfo = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("update_member_info.php", {
        method: "POST",
        body: JSON.stringify({
          member_id: editInfoMember.member_id,
          full_name: infoForm.name,
          contact_number: infoForm.contactNumber,
          address: infoForm.address,
          facebook: infoForm.facebook,
          dob: infoForm.dob,
          age: infoForm.age !== "" ? parseInt(infoForm.age) : null,
          gender: infoForm.gender,
          occupation: infoForm.occupation,
          emergency_contact_name: infoForm.emergencyContactName,
          emergency_contact_number: infoForm.emergencyContactNumber,
          discount_type: infoForm.discountType,
          discount_id: infoForm.discountId,
          discount_id_type: infoForm.discountIdType,
          discount_school_name: infoForm.discountSchoolName,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setShowEditInfoModal(false);
        setEditInfoMember(null);
        fetchData();
        showToast("Member info updated!");
      } else {
        showToast(res.error || "Update failed", "error");
      }
    } catch {
      showToast("Update failed", "error");
    }
  };

  const walkInAgain = (walkin) => {
    const today = new Date().toISOString().slice(0, 10);
    if (walkin.last_visit === today) {
      showToast(`${walkin.full_name} has already walked in today.`, "error");
      return;
    }
    setWalkInForm({
      ...WALKIN_FORM_DEFAULT,
      guestName: walkin.full_name || "",
      guestContact: walkin.contact_number || "",
    });
    setShowWalkInModal(true);
  };

  const convertWalkIn = (walkin) => {
    clearMemberForm();
    setMemberForm((f) => ({
      ...f,
      name: walkin.full_name || "",
      contactNumber: walkin.contact_number || "",
    }));
    setShowMemberModal(true);
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

  const printReceipt = (payment, member) => {
    const rows = payment.payment_method
      ? `<tr><td>${payment.payment_method}</td><td>₱${parseFloat(payment.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td></tr>`
      : "";

    const bonusDays = parseInt(payment.bonus_days || 0, 10);
    const bonusRow = bonusDays > 0
      ? `<tr><td>Bonus Days</td><td>+${bonusDays} day${bonusDays > 1 ? "s" : ""} (FREE)</td></tr>`
      : "";

    const requiresSignature = ["Bank Transfer", "Credit Card", "Debit Card"].includes(payment.payment_method);
    const signatureBlock = requiresSignature
      ? `<hr>
         <div style="font-size:11px;margin-top:6px">
           <strong>SIGNATURE REQUIRED</strong><br>
           By signing below, the client confirms this ${payment.payment_method} transaction.<br><br>
           <div style="border-bottom:1px solid #000;margin-top:28px;width:100%"></div>
           <div style="display:flex;justify-content:space-between;font-size:10px;margin-top:3px">
             <span>Client Signature</span><span>Date</span>
           </div>
         </div>`
      : "";

    const printedAt = new Date();
    const html = `<!DOCTYPE html><html><head><title>Receipt</title>
    <style>
      body { font-family: monospace; width: 320px; margin: 20px auto; font-size: 13px; }
      h2 { text-align: center; margin: 0; font-size: 16px; }
      .sub { text-align: center; color: #555; font-size: 11px; margin-bottom: 12px; }
      hr { border: none; border-top: 1px dashed #999; margin: 10px 0; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 3px 0; }
      td:last-child { text-align: right; }
      .total { font-weight: bold; font-size: 15px; }
      .footer { text-align: center; margin-top: 14px; font-size: 11px; color: #777; }
    </style></head><body>
    <h2>FITNESS SYNERGY LIPA</h2>
    <div class="sub">Official Payment Receipt</div>
    <hr>
    <table>
      <tr><td>Receipt #</td><td>${payment.payment_id}</td></tr>
      <tr><td>Date</td><td>${new Date(payment.payment_date).toLocaleDateString()}</td></tr>
      <tr><td>Time</td><td>${printedAt.toLocaleTimeString()}</td></tr>
      <tr><td>Member</td><td>${member.full_name}</td></tr>
      ${member.address ? `<tr><td>Address</td><td style="text-align:right;max-width:160px;word-break:break-word">${member.address}</td></tr>` : ""}
      <tr><td>Plan</td><td>${payment.plan_name || member.plan_name || "—"}</td></tr>
      ${bonusRow}
      ${member.discount_type && member.discount_type !== "None" ? `<tr><td>Discount</td><td>${member.discount_type}</td></tr>` : ""}
    </table>
    <hr>
    <table>${rows || '<tr><td colspan="2">—</td></tr>'}</table>
    <hr>
    <table><tr class="total"><td>TOTAL PAID</td><td>₱${parseFloat(payment.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td></tr></table>
    ${payment.reference_number ? `<hr><div style="font-size:11px">Ref #: ${payment.reference_number}</div>` : ""}
    ${signatureBlock}
    <div class="footer">Thank you for choosing Fitness Synergy Lipa!<br>Keep this receipt for your records.</div>
    </body></html>`;

    const w = window.open("", "_blank", "width=400,height=600");
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
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
        openWalkInModal={() => {
          setWalkInForm(WALKIN_FORM_DEFAULT);
          setShowWalkInModal(true);
        }}
        setShowTdeeModal={setShowTdeeModal}
        openAdminModal={() => setShowAdminSettingsModal(true)} // 3. INJECT OPEN ACTION INTO SIDEBAR
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <main
        style={{
          flex: 1,
          padding: "30px",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {isLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "16px",
              backgroundColor: "rgba(0,0,0,0.25)",
              backdropFilter: "blur(2px)",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                border: `4px solid ${theme.border}`,
                borderTop: `4px solid ${theme.primary}`,
                animation: "spin 0.75s linear infinite",
              }}
            />
            <span
              style={{
                color: theme.text,
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Loading data...
            </span>
          </div>
        )}
        {currentView.startsWith("revenue") ? (
          <RevenueReport theme={theme} activeTab={currentView} />
        ) : currentView === "attendance-report" ? (
          <AttendanceReport theme={theme} isDarkMode={isDarkMode} />
        ) : currentView === "plans" ? (
          <PlansManager theme={theme} />
        ) : currentView === "promos" ? (
          <PromosManager theme={theme} />
        ) : currentView === "expenses" ? (
          <ExpensesManager theme={theme} />
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
                Fitness Synergy Lipa Dashboard
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
                <StatsCards
                  stats={stats}
                  theme={theme}
                  isDarkMode={isDarkMode}
                />
                <MembersTable
                  theme={theme}
                  isDarkMode={isDarkMode}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filteredMembers={filteredMembers}
                  getDaysRemaining={getDaysRemaining}
                  confirmTimeIn={(member) => setTimeInConfirmMember(member)}
                  attendanceLogs={attendanceLogs}
                  viewProfile={viewProfile}
                  startRenewal={startRenewal}
                  walkInAgain={walkInAgain}
                  convertWalkIn={convertWalkIn}
                  showToast={showToast}
                  handleDelete={(id, name) => {
                    setDeleteConfirm({ show: true, id, name });
                  }}
                />
              </div>
              <div
                className="live-feed-panel"
                style={{ width: "350px", flexShrink: 0 }}
              >
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
          promos={promos}
          memberForm={memberForm}
          setMemberForm={setMemberForm}
        />
      )}

      {showWalkInModal && (
        <WalkInModal
          theme={theme}
          onClose={() => setShowWalkInModal(false)}
          handleWalkInSubmit={handleWalkInSubmit}
          walkInForm={walkInForm}
          setWalkInForm={setWalkInForm}
        />
      )}

      {timeInConfirmMember && (
        <TimeInConfirmModal
          theme={theme}
          member={timeInConfirmMember}
          getDaysRemaining={getDaysRemaining}
          onConfirm={() => {
            handleTimeIn(timeInConfirmMember.member_id);
            setTimeInConfirmMember(null);
          }}
          onClose={() => setTimeInConfirmMember(null)}
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
          printReceipt={printReceipt}
          memberHistory={memberHistory.logs}
          onEditInfo={(member) => {
            setSelectedMember(null);
            openEditInfo(member);
          }}
          onPhotoUpdate={(url) => {
            setSelectedMember((m) => ({ ...m, photo_url: url }));
            fetchData();
          }}
          onAddInstallmentPayment={(member) =>
            setInstallmentPaymentMember(member)
          }
        />
      )}

      {installmentPaymentMember && (
        <InstallmentPaymentModal
          theme={theme}
          member={installmentPaymentMember}
          paymentHistory={memberHistory.payments}
          onSuccess={handleInstallmentPaymentSuccess}
          onClose={() => setInstallmentPaymentMember(null)}
        />
      )}
      {showRenewalModal && renewalMember && (
        <RenewalModal
          theme={theme}
          member={renewalMember}
          plans={plans}
          promos={promos}
          renewalForm={renewalForm}
          setRenewalForm={setRenewalForm}
          onSubmit={handleRenewal}
          onClose={() => {
            setShowRenewalModal(false);
            setRenewalMember(null);
            setRenewalForm(RENEWAL_FORM_DEFAULT);
          }}
        />
      )}

      {showEditInfoModal && editInfoMember && (
        <EditInfoModal
          theme={theme}
          infoForm={infoForm}
          setInfoForm={setInfoForm}
          onSubmit={handleEditInfo}
          onClose={() => {
            setShowEditInfoModal(false);
            setEditInfoMember(null);
          }}
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

      {/* 4. RENDER NEW ADMIN SETTINGS MODAL AT THE BOTTOM */}
      {showAdminSettingsModal && (
        <AdminSettingsModal
          theme={theme}
          onClose={() => setShowAdminSettingsModal(false)}
          showToast={showToast}
          onLogout={() => {
            apiFetch("logout.php", { method: "POST" }).catch(() => {});
            localStorage.removeItem("fitness_synergy_token");
            setShowAdminSettingsModal(false);
            setIsLoggedIn(false);
          }}
        />
      )}

      {deleteConfirm.show && (
        <ConfirmModal
          theme={theme}
          name={deleteConfirm.name}
          onCancel={() => setDeleteConfirm({ show: false, id: null, name: "" })}
          onConfirm={async () => {
            try {
              const res = await apiFetch("delete_member.php", {
                method: "POST",
                body: JSON.stringify({ member_id: deleteConfirm.id }),
              }).then((r) => r.json());
              setDeleteConfirm({ show: false, id: null, name: "" });
              if (res.success) fetchData();
              else showToast(res.error || "Delete failed", "error");
            } catch {
              showToast("Delete failed. Check your connection.", "error");
            }
          }}
        />
      )}

      {/* Post-registration photo prompt */}
      {postRegPhotoPrompt && !postRegPhotoUpload && (
        <div
          onClick={() => {
            setPostRegPhotoPrompt(null);
            showToast("Member Added");
          }}
          style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.82)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 1300, backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.surface, borderRadius: "16px",
              padding: "36px 32px", width: "380px", textAlign: "center",
              border: `1px solid ${theme.border}`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
            }}
          >
            <h2 style={{ margin: "0 0 6px", fontSize: "20px", color: theme.text }}>
              Registration Complete!
            </h2>
            <p style={{ margin: "0 0 6px", fontWeight: "bold", color: theme.primary, fontSize: "15px" }}>
              {postRegPhotoPrompt.memberName}
            </p>
            <p style={{ margin: "0 0 24px", color: theme.textMuted, fontSize: "13px", lineHeight: 1.5 }}>
              Add a profile photo now so staff can verify identity at the front desk.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => {
                  setPostRegPhotoUpload(postRegPhotoPrompt.memberId);
                  setPostRegPhotoPrompt(null);
                }}
                style={{
                  padding: "13px", backgroundColor: theme.primary,
                  color: theme.primaryText, border: "none", borderRadius: "8px",
                  cursor: "pointer", fontWeight: "bold", fontSize: "14px",
                }}
              >
                Upload Photo Now
              </button>
              <button
                onClick={() => {
                  setPostRegPhotoPrompt(null);
                  showToast("Member Added");
                }}
                style={{
                  padding: "11px", backgroundColor: "transparent",
                  color: theme.textMuted, border: `1px solid ${theme.border}`,
                  borderRadius: "8px", cursor: "pointer", fontSize: "13px",
                }}
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-registration photo upload */}
      {postRegPhotoUpload && (
        <PhotoCropModal
          theme={theme}
          memberId={postRegPhotoUpload}
          onSuccess={() => {
            setPostRegPhotoUpload(null);
            fetchData();
            showToast("Member Added & Photo Uploaded");
          }}
          onClose={() => {
            setPostRegPhotoUpload(null);
            showToast("Member Added");
          }}
        />
      )}

      {walkInRecommend.show && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              backgroundColor: theme.surface,
              borderRadius: "16px",
              padding: "36px",
              width: "420px",
              textAlign: "center",
              border: `1px solid ${theme.border}`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "20px",
                color: theme.primary,
              }}
            >
              Loyal Walk-in Guest!
            </h2>
            <p
              style={{ color: theme.text, margin: "0 0 6px", fontSize: "15px" }}
            >
              Si <strong>{walkInRecommend.name}</strong> ay bumisita na ng{" "}
              <strong>{walkInRecommend.visits}</strong> beses bilang walk-in.
            </p>
            <p
              style={{
                color: theme.textMuted,
                margin: "0 0 24px",
                fontSize: "13px",
              }}
            >
              Alukin siyang kumuha ng Regular Membership para makatipid!
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  setWalkInRecommend({ show: false, name: "", visits: 0 });
                  clearMemberForm();
                  setMemberForm((f) => ({ ...f, name: walkInRecommend.name }));
                  setShowMemberModal(true);
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: theme.primary,
                  color: theme.primaryText,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Gawan ng Membership
              </button>
              <button
                onClick={() =>
                  setWalkInRecommend({ show: false, name: "", visits: 0 })
                }
                style={{
                  padding: "12px 20px",
                  border: `1px solid ${theme.border}`,
                  borderRadius: "8px",
                  backgroundColor: "transparent",
                  color: theme.text,
                  cursor: "pointer",
                }}
              >
                Sige mamaya na
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
