import { useState, useCallback, useRef, useEffect } from "react";

const TOAST_DURATION_MS = 3500;

// Toast queue: showToast() appends; each entry auto-removes after TOAST_DURATION_MS.
// Multiple concurrent toasts stack visually instead of overwriting each other.
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const handle = timeoutsRef.current.get(id);
    if (handle) {
      clearTimeout(handle);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      const handle = setTimeout(() => dismiss(id), TOAST_DURATION_MS);
      timeoutsRef.current.set(id, handle);
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      for (const handle of timeoutsRef.current.values()) clearTimeout(handle);
      timeoutsRef.current.clear();
    },
    [],
  );

  return { toasts, showToast, dismiss };
}
