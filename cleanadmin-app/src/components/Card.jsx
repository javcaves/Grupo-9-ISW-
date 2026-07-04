import React from "react";

export const Card = ({
  children,
  title,
  subtitle,
  icon,
  className = "",
  hoverable = true,
  headerAction = null,
  decorator = null,
  onClick = null,        // ← AÑADIDO
}) => {
  return (
    <div
      className={`
        rounded-2xl
        overflow-hidden
        backdrop-blur-xl
        transition-all
        duration-300
        ${hoverable ? "hover:-translate-y-1" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: hoverable ? "var(--card-shadow-hover)" : "var(--card-shadow)",
      }}
      onClick={onClick}   // ← AÑADIDO
    >
      {decorator && decorator}

      {(title || subtitle || icon || headerAction) && (
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: "1px solid var(--card-divider)" }}
        >
          <div className="flex items-center gap-3">
            {icon && (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(to bottom right, var(--card-icon-bg-from), var(--card-icon-bg-to))",
                  color: "var(--card-icon-text)",
                }}
              >
                <i className={`fas ${icon} text-lg`}></i>
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold" style={{ color: "var(--card-title)" }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm mt-0.5" style={{ color: "var(--card-subtitle)" }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
        </div>
      )}

      <div className="p-5">{children}</div>
    </div>
  );
};
