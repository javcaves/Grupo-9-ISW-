// src/context/ToastContext.jsx
import { createContext, useContext, useState, useCallback, useRef } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, type = "info", duracionMs = 5000) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duracionMs > 0) {
      setTimeout(() => remove(id), duracionMs);
    }
    return id;
  }, [remove]);

  const toast = {
    success: (message, duracionMs) => show(message, "success", duracionMs),
    error:   (message, duracionMs) => show(message, "error", duracionMs ?? 7000),
    info:    (message, duracionMs) => show(message, "info", duracionMs),
    warning: (message, duracionMs) => show(message, "warning", duracionMs),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        style={{
          position: "fixed",
          top: "1.25rem",
          right: "1.25rem",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          maxWidth: "min(400px, calc(100vw - 2.5rem))",
        }}
      >
        {toasts.map((t) => (
          <Toast key={t.id} type={t.type} message={t.message} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast() debe usarse dentro de <ToastProvider>.");
  }
  return ctx;
}
