import React from "react";
import Search from "./search";

export function ListToolbar({ searchValue, onSearchChange, searchPlaceholder = "Buscar...", filters = [], sortLabel, onToggleSort }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Search
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        className="flex-1 min-w-[260px] max-w-none"
        variant="flat"
      />

      {filters.map((f, idx) => (
        <div key={idx} className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{f.label}:</span>
          <select
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none transition-all duration-200 focus:border-violet-400 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
          >
            <option value="">{f.allLabel ?? "Todos"}</option>
            {f.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      ))}

      {sortLabel && (
        <button
          type="button"
          onClick={onToggleSort}
          disabled={!onToggleSort}
          title="Cambiar orden"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-violet-600 px-2 py-2 disabled:hover:text-gray-500 whitespace-nowrap shrink-0"
        >
          <i className={`fas ${onToggleSort ? "fa-arrow-down-wide-short cursor-pointer" : "fa-arrow-down-wide-short"}`} />
          {sortLabel}
        </button>
      )}
    </div>
  );
}