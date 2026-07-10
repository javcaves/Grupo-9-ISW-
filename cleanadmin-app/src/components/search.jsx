import React from 'react';

export default function Search({ placeholder = "Buscar...", value, onChange, onSearch, className = "w-[280px] max-w-full", variant = "pill" }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && onSearch) {
            onSearch(value);
        }
    };

    const estiloInput = variant === "flat"
        ? `
            peer
            w-full
            py-2
            pr-3
            pl-9
            rounded-lg
            bg-white
            border
            border-gray-300
            text-slate-900
            text-sm
            outline-none
            transition-all
            duration-200
            placeholder:text-slate-400
            focus:border-violet-400
            focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]`
        : `
            peer
            w-full
            py-[14px]
            pr-[18px]
            pl-[46px]
            rounded-2xl
            bg-white/90
            border
            border-slate-900/5
            text-slate-900
            text-[0.95rem]
            shadow-[0_6px_18px_rgba(15,23,42,0.04)]
            outline-none
            transition-all
            duration-300
            placeholder:text-slate-400
            focus:bg-white
            focus:border-violet-600
            focus:shadow-[0_0_0_4px_rgba(124,58,237,0.12)]`;

    const posicionIcono = variant === "flat" ? "left-3" : "left-[16px]";

return (
    <div className={`relative ${className}`}>
    <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={estiloInput}/>
        <i className={`
            fas fa-search
            absolute
            ${posicionIcono}
            top-1/2
            -translate-y-1/2
            text-slate-400
            text-sm
            transition-colors
            duration-300
            peer-focus:text-violet-600`}></i>
    </div>
    );
}