import { useState, useCallback, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { apiFetch } from "./api";
import bgTexture from "./assets/geomblue.png";

// Eagerly loaded — needed immediately at login + dashboard
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import DashboardView from "./views/DashboardView";

// Code-split — only loaded when the corresponding view is opened.
// Reports + managers pull in heavy deps (charts, xlsx, large tables).
const RevenueReport      = lazy(() => import("./components/RevenueReport"));
const AttendanceReport   = lazy(() => import("./components/AttendanceReport"));
const BranchSalesReport  = lazy(() => import("./components/BranchSalesReport"));
const PlansManager       = lazy(() => import("./components/PlansManager"));
const PromosManager      = lazy(() => import("./components/PromosManager"));
const ExpensesManager    = lazy(() => import("./components/ExpensesManager"));
const ActivityLogView    = lazy(() => import("./views/ActivityLogView"));

// Modals
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
import PhotoCropModal from "./components/PhotoCropModal";
import PostRegPhotoModal from "./components/PostRegPhotoModal";
import WalkInRecommendModal from "./components/WalkInRecommendModal";
import Toast from "./components/Toast";

// Hooks + utilities
import { useTheme } from "./hooks/useTheme";
import { useToast } from "./hooks/useToast";
import { useCurrentTime } from "./hooks/useCurrentTime";
import { useGymData } from "./hooks/useGymData";
import { formatSafeDate, getDaysRemaining } from "./utils/date";
import { printReceipt } from "./utils/receipt";
import {
  WALKIN_FORM_DEFAULT,
  RENEWAL_FORM_DEFAULT,
  MEMBER_FORM_DEFAULT,
} from "./constants/formDefaults";

function App() {
  // ── Auth ──
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("fitness_synergy_token"),
  );
  const [loginForm, setLoginForm] = useState({ user: "", pass: "", error: "" });

  // ── UI shell hooks ──
  const { isDarkMode, theme, toggleTheme } = useTheme();
  const { toasts, showToast, dismiss: dismissToast } = useToast();
  const currentTime = useCurrentTime();

  // ── Navigation / filters ──
  // currentView is no longer state — react-router-dom owns the URL. We keep
  // memberStatusFilter as a transient client-only filter for the stats cards.
  const [memberStatusFilter, setMemberStatusFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Member CRUD modal state ──
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [memberForm, setMemberForm] = useState(MEMBER_FORM_DEFAULT);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
    name: "",
    error: "",
    pending: false,
  });

  // ── Walk-in modal state ──
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInForm, setWalkInForm] = useState(WALKIN_FORM_DEFAULT);
  const [walkInRecommend, setWalkInRecommend] = useState({
    show: false,
    name: "",
    visits: 0,
  });

  // ── Renewal modal state ──
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalMember, setRenewalMember] = useState(null);
  const [renewalForm, setRenewalForm] = useState(RENEWAL_FORM_DEFAULT);
  const [renewalStatus, setRenewalStatus] = useState({ error: "", pending: false });

  // ── Edit-info modal state ──
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [editInfoMember, setEditInfoMember] = useState(null);
  const [infoForm, setInfoForm] = useState({});

  // ── Profile / time-in / installment ──
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberHistory, setMemberHistory] = useState({
    logs: [],
    visits: 0,
    payments: [],
  });
  const [timeInConfirmMember, setTimeInConfirmMember] = useState(null);
  const [installmentPaymentMember, setInstallmentPaymentMember] = useState(null);

  // ── Post-registration photo flow ──
  const [postRegPhotoPrompt, setPostRegPhotoPrompt] = useState(null);
  const [postRegPhotoUpload, setPostRegPhotoUpload] = useState(null);

  // ── Misc tools ──
  const [showTdeeModal, setShowTdeeModal] = useState(false);
  const [showAdminSettingsModal, setShowAdminSettingsModal] = useState(false);
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

  // ── Data layer: members, attendance, plans, promos, stats ──
  const handleAuthExpired = useCallback(() => {
    localStorage.removeItem("fitness_synergy_token");
    setIsLoggedIn(false);
  }, []);
  const handleDataError = useCallback(
    (msg) => showToast(msg, "error"),
    [showToast],
  );
  const {
    members,
    attendanceLogs,
    plans,
    promos,
    stats,
    isLoading,
    fetchData,
  } = useGymData({
    isLoggedIn,
    onAuthExpired: handleAuthExpired,
    onError: handleDataError,
  });

  const clearMemberForm = () => {
    setEditingId(null);
    setMemberForm(MEMBER_FORM_DEFAULT);
  };

  const handleLogout = () => {
    apiFetch("logout.php", { method: "POST" }).catch(() => {});
    localStorage.removeItem("fitness_synergy_token");
    setIsLoggedIn(false);
  };

  // ── Handlers ──
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

      // Parse the JSON body for every response — the API returns
      // { success, error } even on 401/429, and the user needs to see why.
      let res;
      try {
        res = await response.json();
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (response.ok && res.success) {
        localStorage.setItem("fitness_synergy_token", res.token);
        setIsLoggedIn(true);
      } else {
        setLoginForm((prev) => ({
          ...prev,
          error: res.error || "Invalid credentials.",
        }));
      }
    } catch {
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
    } catch {
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
    } catch {
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
          force,
          ...(editingId && { member_id: editingId }),
        }),
      }).then((r) => r.json());

      if (res.success) {
        setShowMemberModal(false);
        fetchData();
        if (!editingId && res.member_id) {
          const savedName = memberForm.name;
          clearMemberForm();
          setPostRegPhotoPrompt({
            memberId: res.member_id,
            memberName: savedName,
          });
        } else {
          clearMemberForm();
          showToast(editingId ? "Member Updated" : "Member Added");
        }
      } else if (res.duplicate_warning) {
        return res;
      } else {
        showToast(res.error || "Submission Failed", "error");
      }
    } catch {
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
    setRenewalStatus({ error: "", pending: false });
    setShowRenewalModal(true);
  };

  const closeRenewalModal = () => {
    setShowRenewalModal(false);
    setRenewalMember(null);
    setRenewalForm(RENEWAL_FORM_DEFAULT);
    setRenewalStatus({ error: "", pending: false });
  };

  const handleRenewal = async (e) => {
    e.preventDefault();
    setRenewalStatus({ error: "", pending: true });
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
        closeRenewalModal();
        fetchData();
        showToast("Membership renewed!");
      } else {
        // Keep modal open and surface the server reason (e.g. outstanding installment).
        setRenewalStatus({ error: res.error || "Renewal failed.", pending: false });
      }
    } catch {
      setRenewalStatus({
        error: "Renewal failed. Check your connection.",
        pending: false,
      });
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
    const bmr =
      tdeeData.gender === "male"
        ? 10 * w + 6.25 * h - 5 * tdeeData.age + 5
        : 10 * w + 6.25 * h - 5 * tdeeData.age - 161;
    setTdeeResult(Math.round(bmr * tdeeData.activity));
  };

  // ── Render: login screen ──
  if (!isLoggedIn) {
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
  }

  // ── Render: authenticated shell ──
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
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        openAddModal={() => {
          clearMemberForm();
          setShowMemberModal(true);
        }}
        openWalkInModal={() => {
          setWalkInForm(WALKIN_FORM_DEFAULT);
          setShowWalkInModal(true);
        }}
        setShowTdeeModal={setShowTdeeModal}
        openAdminModal={() => setShowAdminSettingsModal(true)}
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

        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                padding: 60,
                color: theme.textMuted,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  border: `4px solid ${theme.border}`,
                  borderTop: `4px solid ${theme.primary}`,
                  animation: "spin 0.75s linear infinite",
                }}
              />
              <span style={{ fontSize: 13 }}>Loading view…</span>
            </div>
          }
        >
          <Routes>
            <Route
              path="/"
              element={
                <DashboardView
                  theme={theme}
                  isDarkMode={isDarkMode}
                  currentTime={currentTime}
                  stats={stats}
                  members={members}
                  plans={plans}
                  attendanceLogs={attendanceLogs}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  memberStatusFilter={memberStatusFilter}
                  setMemberStatusFilter={setMemberStatusFilter}
                  getDaysRemaining={getDaysRemaining}
                  confirmTimeIn={(member) => setTimeInConfirmMember(member)}
                  viewProfile={viewProfile}
                  startRenewal={startRenewal}
                  walkInAgain={walkInAgain}
                  convertWalkIn={convertWalkIn}
                  showToast={showToast}
                  handleDelete={(id, name) =>
                    setDeleteConfirm({ show: true, id, name, error: "", pending: false })
                  }
                />
              }
            />
            <Route path="/revenue" element={<Navigate to="/revenue/overview" replace />} />
            <Route path="/revenue/:tab" element={<RevenueRoute theme={theme} />} />
            <Route path="/reports/attendance" element={<AttendanceReport theme={theme} isDarkMode={isDarkMode} />} />
            <Route path="/reports/branch" element={<BranchSalesReport theme={theme} />} />
            <Route path="/plans" element={<PlansManager theme={theme} />} />
            <Route path="/promos" element={<PromosManager theme={theme} />} />
            <Route path="/expenses" element={<ExpensesManager theme={theme} />} />
            <Route path="/activity-log" element={<ActivityLogView theme={theme} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* ── Modals ── */}
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
          onClose={closeRenewalModal}
          errorMessage={renewalStatus.error}
          pending={renewalStatus.pending}
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
          errorMessage={deleteConfirm.error}
          pending={deleteConfirm.pending}
          onCancel={() =>
            setDeleteConfirm({ show: false, id: null, name: "", error: "", pending: false })
          }
          onConfirm={async () => {
            setDeleteConfirm((prev) => ({ ...prev, pending: true, error: "" }));
            try {
              const res = await apiFetch("delete_member.php", {
                method: "POST",
                body: JSON.stringify({ member_id: deleteConfirm.id }),
              }).then((r) => r.json());

              if (res.success) {
                setDeleteConfirm({ show: false, id: null, name: "", error: "", pending: false });
                fetchData();
                showToast("Member deleted.");
              } else {
                // Keep the modal open and surface the server's reason inline.
                setDeleteConfirm((prev) => ({
                  ...prev,
                  pending: false,
                  error: res.error || "Delete failed.",
                }));
              }
            } catch {
              setDeleteConfirm((prev) => ({
                ...prev,
                pending: false,
                error: "Delete failed. Check your connection.",
              }));
            }
          }}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />

      {postRegPhotoPrompt && !postRegPhotoUpload && (
        <PostRegPhotoModal
          theme={theme}
          memberName={postRegPhotoPrompt.memberName}
          onUpload={() => {
            setPostRegPhotoUpload(postRegPhotoPrompt.memberId);
            setPostRegPhotoPrompt(null);
          }}
          onSkip={() => {
            setPostRegPhotoPrompt(null);
            showToast("Member Added");
          }}
        />
      )}

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
        <WalkInRecommendModal
          theme={theme}
          name={walkInRecommend.name}
          visits={walkInRecommend.visits}
          onConvert={() => {
            const savedName = walkInRecommend.name;
            setWalkInRecommend({ show: false, name: "", visits: 0 });
            clearMemberForm();
            setMemberForm((f) => ({ ...f, name: savedName }));
            setShowMemberModal(true);
          }}
          onDismiss={() =>
            setWalkInRecommend({ show: false, name: "", visits: 0 })
          }
        />
      )}
    </div>
  );
}

// Small wrapper: maps the URL :tab segment to RevenueReport's activeTab prop.
// Falls back to "overview" so /revenue alone resolves cleanly.
function RevenueRoute({ theme }) {
  const { tab } = useParams();
  return <RevenueReport theme={theme} activeTab={`revenue-${tab || "overview"}`} />;
}

export default App;
