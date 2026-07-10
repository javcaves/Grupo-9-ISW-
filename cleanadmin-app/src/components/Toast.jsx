// src/components/Toast.jsx
import { useEffect, useState } from "react";

const ESTILOS_POR_TIPO = {
  success: { color: "#22c55e", bg: "rgba(34, 197, 94, 0.14)", borde: "rgba(34, 197, 94, 0.35)" },
  error:   { color: "#ef4444", bg: "rgba(239, 68, 68, 0.14)", borde: "rgba(239, 68, 68, 0.35)" },
  warning: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.14)", borde: "rgba(245, 158, 11, 0.35)" },
  info:    { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.14)", borde: "rgba(139, 92, 246, 0.35)" },
};

function Icono({ tipo }) {
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (tipo === "success") return <svg {...props}><path d="M20 6 9 17l-5-5" /></svg>;
  if (tipo === "error") return <svg {...props}><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>;
  if (tipo === "warning") return <svg {...props}><path d="M12 9v4M12 17h.01" /><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /></svg>;
  return <svg {...props}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>;
}

/**
 * Un toast individual. Se anima de entrada y permite cerrarse a mano
 * (además de que ToastContext ya lo saca solo pasado un tiempo).
 */
export default function Toast({ type = "info", message, onClose }) {
  const [visible, setVisible] = useState(false);
  const estilo = ESTILOS_POR_TIPO[type] ?? ESTILOS_POR_TIPO.info;

  useEffect(() => {
    // dispara la animación de entrada en el siguiente frame
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 150);
  };

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.65rem",
        padding: "0.85rem 1rem",
        borderRadius: "0.9rem",
        background: "var(--bg-card, #1e293b)",
        border: `1px solid ${estilo.borde}`,
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        backdropFilter: "blur(12px)",
        transform: visible ? "translateX(0)" : "translateX(20px)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.2s ease, opacity 0.2s ease",
      }}
    >
      <div style={{ color: estilo.color, flexShrink: 0, marginTop: "0.1rem" }}>
        <Icono tipo={type} />
      </div>

      <p
        style={{
          flex: 1,
          fontSize: "0.85rem",
          lineHeight: 1.45,
          color: "var(--text-primary, #f1f5f9)",
          whiteSpace: "pre-line",
          margin: 0,
        }}
      >
        {message}
      </p>

      <button
        onClick={handleClose}
        aria-label="Cerrar notificación"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          marginLeft: "0.25rem",
          cursor: "pointer",
          color: "var(--text-secondary, #94a3b8)",
          flexShrink: 0,
          lineHeight: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
