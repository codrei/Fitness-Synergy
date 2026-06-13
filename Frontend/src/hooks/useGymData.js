import { useState, useCallback, useEffect } from "react";
import { apiFetch } from "../api";

const ENDPOINTS = ["get_members", "get_attendance", "get_plans", "get_stats", "get_promos"];

// Centralised data layer: owns the 5 dashboard collections and the
// shared `fetchData` action. On a 401 it calls onAuthExpired so the
// shell can clear the token + bump the user back to the login screen.
export function useGymData({ isLoggedIn, onAuthExpired, onError }) {
  const [members, setMembers] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [promos, setPromos] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const responses = await Promise.all(
        ENDPOINTS.map((e) => apiFetch(`${e}.php`)),
      );

      if (responses.some((r) => r.status === 401)) {
        onAuthExpired?.();
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
      console.error("Fetch error:", err);
      onError?.("Failed to load data. Check server connection.");
    } finally {
      setIsLoading(false);
    }
  }, [onAuthExpired, onError]);

  useEffect(() => {
    if (isLoggedIn) fetchData();
    // fetchData is stable via useCallback; intentionally tied to login state only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return {
    members,
    attendanceLogs,
    plans,
    promos,
    stats,
    isLoading,
    fetchData,
  };
}
