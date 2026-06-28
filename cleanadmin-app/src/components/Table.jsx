import React from "react";

export const Table = ({
  columns,
  data,
  onRowClick,
  onEdit,
  onDelete,
  emptyMessage = "no hay datos disponibles",
  className = "",
}) => {
  const handleEdit   = (e, item) => { e.stopPropagation(); if (onEdit)   onEdit(item);   };
  const handleDelete = (e, item) => { e.stopPropagation(); if (onDelete) onDelete(item); };

  return (
    <div
      className={`overflow-hidden transition-all duration-300 rounded-2xl ${className}`}
      style={{
        background: "var(--table-bg)",
        border:     "1px solid var(--table-border)",
        boxShadow:  "var(--table-shadow)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">

          {/* Header */}
          <thead>
            <tr
              style={{
                background:   "linear-gradient(to right, var(--table-header-from), var(--table-header-to))",
                borderBottom: "1px solid var(--table-header-border)",
              }}
            >
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`text-left py-4 px-5 text-sm font-semibold ${col.width ? `w-[${col.width}]` : ""} ${col.className || ""}`}
                  style={{ color: "var(--table-header-text)" }}
                >
                  {col.icon && <i className={`fas ${col.icon} mr-2 text-violet-500`} />}
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12"
                  style={{ color: "var(--table-empty-text)" }}
                >
                  <i className="fas fa-inbox text-4xl mb-3 block opacity-30" />
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-all duration-200 hover:translate-x-0.5 ${onRowClick ? "cursor-pointer" : ""}`}
                  style={{ borderBottom: "1px solid var(--table-row-border)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--table-row-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="py-3.5 px-5 text-sm"
                      style={{ color: "var(--table-row-text)" }}
                    >
                      {col.key === "actions" ? (
                        <div className="flex items-center gap-2">
                          {onEdit && (
                            <button
                              onClick={(e) => handleEdit(e, item)}
                              className="p-2 rounded-xl transition-all duration-200"
                              style={{ color: "var(--table-action-text)" }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "var(--table-action-edit-hover-bg)";
                                e.currentTarget.style.color      = "var(--table-action-edit-hover-text)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color      = "var(--table-action-text)";
                              }}
                            >
                              <i className="fas fa-edit text-sm" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={(e) => handleDelete(e, item)}
                              className="p-2 rounded-xl transition-all duration-200"
                              style={{ color: "var(--table-action-text)" }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "var(--table-action-del-hover-bg)";
                                e.currentTarget.style.color      = "var(--table-action-del-hover-text)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color      = "var(--table-action-text)";
                              }}
                            >
                              <i className="fas fa-trash-alt text-sm" />
                            </button>
                          )}
                        </div>
                      ) : col.render ? (
                        col.render(item[col.key], item)
                      ) : (
                        <span className={col.cellClassName}>{item[col.key]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
