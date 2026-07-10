import React from 'react';

export default function ButtonTemplate({
  text,
  icon: Icon,
  className = "",
  variant = "primary",
  onClick,
  disabled = false
}) {
  //Solo el primary se ve morado
  const esPrimario = variant === "primary";

  const estiloBase = esPrimario
    ? {
        background: "var(--button-bg)",
        color: "var(--button-text)",
        borderColor: "var(--button-border)",
        boxShadow: "var(--button-shadow)",
      }
    : undefined;

  const claseVariante =
    variant === "secondary" ? "btn-secondary" :
    variant === "accent" ? "btn-accent" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-5 py-2.5
        rounded-xl
        font-semibold
        flex items-center
        justify-center
        gap-2
        cursor-pointer
        border
        transition-all
        duration-200
        hover:-translate-y-0.5
        active:scale-95
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${claseVariante}
        ${className}
      `}
      style={estiloBase}
    >
      {Icon && <Icon size={18} />}
      <span>{text}</span>
    </button>
  );
}