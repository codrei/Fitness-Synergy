import { useState, useEffect, useMemo, useCallback } from "react";

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") !== "light",
  );

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? "#060D0D" : "#D8F0EE";
  }, [isDarkMode]);

  const theme = useMemo(
    () => ({
      bg: isDarkMode ? "#091212" : "#ECF8F7",
      surface: isDarkMode ? "#111E1E" : "#FFFFFF",
      border: isDarkMode ? "#1C3232" : "#BFE5E3",
      text: isDarkMode ? "#E8F8F7" : "#0B2424",
      textMuted: isDarkMode ? "#6AABA8" : "#427A78",
      primary: isDarkMode ? "#00CCCC" : "#009999",
      primaryText: "#000000",
      danger: isDarkMode ? "#FF5252" : "#C62828",
      success: isDarkMode ? "#00E676" : "#1B6B63",
      sidebar: isDarkMode ? "#060D0D" : "#091A1A",
    }),
    [isDarkMode],
  );

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  return { isDarkMode, theme, toggleTheme };
}
