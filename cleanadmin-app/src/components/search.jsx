import React from 'react';

export default function Search({ placeholder = "Buscar...", value, onChange, onSearch }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && onSearch) {
            onSearch(value);
        }
    };

return (
    <div className="relative w-[280px] max-w-full">
    <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="
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
            focus:shadow-[0_0_0_4px_rgba(124,58,237,0.12)]"/>
        <i className="
            fas fa-search
            absolute
            left-[16px]
            top-1/2
            -translate-y-1/2
            text-slate-400
            transition-colors
            duration-300
            peer-focus:text-violet-600"></i>
    </div>
    );
}