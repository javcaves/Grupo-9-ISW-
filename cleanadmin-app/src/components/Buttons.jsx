import React from 'react';

export default function ButtonTemplate({
  text,
  icon: Icon,
  className = "",
  onClick,
  disabled = false
}) {
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
        ${className}
      `}
      style={{
        background: "var(--button-bg)",
        color: "var(--button-text)",
        borderColor: "var(--button-border)",
        boxShadow: "var(--button-shadow)"
      }}
    >
      {Icon && <Icon size={18} />}
      <span>{text}</span>
    </button>
  );
}