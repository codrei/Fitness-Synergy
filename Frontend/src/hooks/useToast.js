import { useState, useCallback, useRef, useEffect } from "react";

const TOAST_DURATION_MS = 3500;
const EMPTY_TOAST = { show: false, message: "", type: "success" };

export function useToast() {
  const [toast, setToast] = useState(EMPTY_TOAST);
  const timeoutRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setToast(EMPTY_TOAST), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return { toast, showToast };
}
