import StatsCards from "../components/StatsCards";
import MembersTable from "../components/MembersTable";
import LiveFeed from "../components/LiveFeed";
import ExpiringBanner from "../components/ExpiringBanner";

function DashboardView({
  theme,
  isDarkMode,
  currentTime,
  stats,
  members,
  plans,
  attendanceLogs,
  searchQuery,
  setSearchQuery,
  memberStatusFilter,
  setMemberStatusFilter,
  getDaysRemaining,
  confirmTimeIn,
  viewProfile,
  startRenewal,
  walkInAgain,
  convertWalkIn,
  showToast,
  handleDelete,
}) {
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

  return (
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

      <ExpiringBanner theme={theme} expiringSoon={stats?.expiring_soon} />

      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
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
            onNavigate={(filter) => setMemberStatusFilter(filter)}
          />
          <MembersTable
            theme={theme}
            isDarkMode={isDarkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredMembers={filteredMembers}
            plans={plans}
            getDaysRemaining={getDaysRemaining}
            confirmTimeIn={confirmTimeIn}
            attendanceLogs={attendanceLogs}
            viewProfile={viewProfile}
            startRenewal={startRenewal}
            walkInAgain={walkInAgain}
            convertWalkIn={convertWalkIn}
            showToast={showToast}
            handleDelete={handleDelete}
            externalStatusFilter={memberStatusFilter}
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
  );
}

export default DashboardView;
