import React, { useState, useEffect, useMemo } from "react";

// Deriva un valor ordenable de la celda. Prioridad:
// 1. col.sortAccessor(item)  -> control fino por columna
// 2. item[col.key]           -> valor directo
// Si el valor es un objeto (relaciones típicas de esta app: item, emisor,
// proyecto), intenta un campo de nombre razonable para poder ordenar por
// texto en vez de por "[object Object]".
const valorOrdenable = (item, col) => {
  const raw = col.sortAccessor ? col.sortAccessor(item) : item[col.key];
  if (raw == null) return raw;
  if (typeof raw === "object") {
    if (raw.nombre != null) return `${raw.nombre} ${raw.apellido ?? ""}`.trim();
    if (raw.nombre_proy != null) return raw.nombre_proy;
    if (raw.item_sugerido != null) return raw.item_sugerido;
    return "";
  }
  return raw;
};

const esOrdenable = (col) => col.key !== "actions" && col.sortable !== false;

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

  // Orden por columna. index = posición de la columna en `columns`
  // (no la key, para tolerar columnas que compartan key). dir null =
  // sin orden activo -> se respeta el orden que ya trae `data`.
  const [orden, setOrden] = useState({ index: null, dir: null });

  const cambiarOrden = (idx, col) => {
    if (!esOrdenable(col)) return;
    setPaginaActual(1);
    setOrden((prev) => {
      if (prev.index !== idx) return { index: idx, dir: "asc" };
      if (prev.dir === "asc")  return { index: idx, dir: "desc" };
      return { index: null, dir: null }; // tercer click: vuelve al orden por defecto
    });
  };

  const datosOrdenados = useMemo(() => {
    if (orden.index == null || !orden.dir) return data;
    const col = columns[orden.index];
    if (!col) return data;

    const arr = [...data];
    arr.sort((a, b) => {
      const va = valorOrdenable(a, col);
      const vb = valorOrdenable(b, col);

      // nulos siempre al final, sin importar la dirección
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;

      let cmp;
      if (typeof va === "number" && typeof vb === "number") {
        cmp = va - vb;
      } else {
        cmp = String(va).localeCompare(String(vb), "es", { numeric: true, sensitivity: "base" });
      }
      return orden.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [data, orden, columns]);

  const totalPaginas = Math.max(1, Math.ceil(datosOrdenados.length / pageSize));

  useEffect(() => {
    setPaginaActual((actual) => Math.min(actual, totalPaginas));
  }, [totalPaginas]);

  const datosPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * pageSize;
    return datosOrdenados.slice(inicio, inicio + pageSize);
  }, [datosOrdenados, paginaActual, pageSize]);

  const mostrarPaginacion = datosOrdenados.length > pageSize;
  const desde = datosOrdenados.length === 0 ? 0 : (paginaActual - 1) * pageSize + 1;
  const hasta = Math.min(paginaActual * pageSize, datosOrdenados.length);

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
              {columns.map((col, idx) => {
                const ordenable = esOrdenable(col);
                const activa = orden.index === idx;
                return (
                  <th
                    key={idx}
                    onClick={ordenable ? () => cambiarOrden(idx, col) : undefined}
                    className={`text-left py-4 px-5 text-sm font-semibold ${col.width ? `w-[${col.width}]` : ""} ${col.className || ""} ${ordenable ? "cursor-pointer select-none" : ""}`}
                    style={{ color: "var(--table-header-text)" }}
                    title={ordenable ? "Ordenar por esta columna" : undefined}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.icon && <i className={`fas ${col.icon} text-violet-500`} />}
                      {col.label}
                      {ordenable && (
                        <i
                          className={`fas text-[10px] ${
                            activa
                              ? (orden.dir === "asc" ? "fa-sort-up" : "fa-sort-down")
                              : "fa-sort opacity-30"
                          }`}
                        />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {datosOrdenados.length === 0 ? (
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
            Mostrando <strong>{desde}-{hasta}</strong> de <strong>{datosOrdenados.length}</strong> resultados
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
