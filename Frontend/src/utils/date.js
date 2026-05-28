export const formatSafeDate = (dateStr, includeTime = false) => {
  if (!dateStr) {
    return includeTime
      ? new Date().toLocaleString()
      : new Date().toLocaleDateString();
  }
  const d = new Date(dateStr);
  if (isNaN(d) || d.getFullYear() <= 1970) {
    return includeTime
      ? new Date().toLocaleString()
      : new Date().toLocaleDateString();
  }
  return includeTime ? d.toLocaleString() : d.toLocaleDateString();
};

export const getDaysRemaining = (expDate) => {
  if (!expDate) return "No Expiration";
  const today = new Date().setHours(0, 0, 0, 0);
  const expiration = new Date(expDate + "T00:00:00").setHours(0, 0, 0, 0);
  const daysLeft = Math.round((expiration - today) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "Expired";
  if (daysLeft === 0) return "Expires Today";
  return `${daysLeft} day(s) left`;
};
