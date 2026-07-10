import React, { useState, useEffect, useMemo } from "react";

export const Table = ({
  columns,
  data,
  onRowClick,
  onEdit,
  onDelete,
  editTitle = "Editar",
  deleteTitle = "Eliminar",
  extraActions = [],
  emptyMessage = "no hay datos disponibles",
  className = "",
  pageSize = 8,
}) => {
  const handleEdit   = (e, item) => { e.stopPropagation(); if (onEdit)   onEdit(item);   };
  const handleDelete = (e, item) => { e.stopPropagation(); if (onDelete) onDelete(item); };

  const [paginaActual, setPaginaActual] = useState(1);

  const totalPaginas = Math.max(1, Math.ceil(data.length / pageSize));

  useEffect(() => {
    setPaginaActual((actual) => Math.min(actual, totalPaginas));
  }, [totalPaginas]);

  const datosPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * pageSize;
    return data.slice(inicio, inicio + pageSize);
  }, [data, paginaActual, pageSize]);

  const mostrarPaginacion = data.length > pageSize;
  const desde = data.length === 0 ? 0 : (paginaActual - 1) * pageSize + 1;
  const hasta = Math.min(paginaActual * pageSize, data.length);

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
      <div className="overflow-x-auto thin-scrollbar">
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
              datosPagina.map((item, idx) => (
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
                        <div className="flex items-center gap-1">
                          {extraActions.map((action, actionIdx) => {
                            const visible = !action.show || action.show(item);
                            return (
                              <button
                                key={actionIdx}
                                onClick={visible ? (e) => { e.stopPropagation(); action.onClick(item); } : undefined}
                                title={visible ? action.title : undefined}
                                tabIndex={visible ? 0 : -1}
                                className={`p-1.5 rounded-xl transition-all duration-200 ${visible ? "" : "opacity-0 pointer-events-none"}`}
                                style={{ color: "var(--table-action-text)" }}
                                onMouseEnter={(e) => {
                                  if (!visible) return;
                                  e.currentTarget.style.background = action.hoverBg   || "var(--table-action-edit-hover-bg)";
                                  e.currentTarget.style.color      = action.hoverText || "var(--table-action-edit-hover-text)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "transparent";
                                  e.currentTarget.style.color      = "var(--table-action-text)";
                                }}
                              >
                                <i className={`fas ${action.icon} text-sm`} />
                              </button>
                            );
                          })}
                          {onEdit && (
                            <button
                              onClick={(e) => handleEdit(e, item)}
                              title={editTitle}
                              className="p-1.5 rounded-xl transition-all duration-200"
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
                              title={deleteTitle}
                              className="p-1.5 rounded-xl transition-all duration-200"
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

      {/* Paginación */}
      {mostrarPaginacion && (
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5"
          style={{ borderTop: "1px solid var(--table-row-border)" }}
        >
          <span className="text-xs" style={{ color: "var(--table-header-text)" }}>
            Mostrando <strong>{desde}-{hasta}</strong> de <strong>{data.length}</strong> resultados
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed"
              style={{ color: "var(--table-header-text)", border: "1px solid var(--table-header-border)" }}
              onMouseEnter={(e) => { if (paginaActual !== 1) e.currentTarget.style.background = "var(--table-row-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              aria-label="Página anterior"
            >
              <i className="fas fa-chevron-left text-xs" />
            </button>

            <span className="text-xs px-2 font-medium" style={{ color: "var(--table-row-text)" }}>
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              type="button"
              onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed"
              style={{ color: "var(--table-header-text)", border: "1px solid var(--table-header-border)" }}
              onMouseEnter={(e) => { if (paginaActual !== totalPaginas) e.currentTarget.style.background = "var(--table-row-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              aria-label="Página siguiente"
            >
              <i className="fas fa-chevron-right text-xs" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
