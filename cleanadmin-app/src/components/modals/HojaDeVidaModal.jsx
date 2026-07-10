// src/components/modals/HojaDeVidaModal.jsx
import React, { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { HojaDeVidaService } from "../../api/hojaDeVida.service";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const NIVEL_CONFIG = {
  "Excelente":        { color: "text-emerald-600", bg: "bg-emerald-50", ring: "stroke-emerald-500" },
  "Bueno":            { color: "text-blue-600",    bg: "bg-blue-50",    ring: "stroke-blue-500" },
  "Regular":          { color: "text-amber-600",   bg: "bg-amber-50",   ring: "stroke-amber-500" },
  "Necesita Mejorar": { color: "text-red-600",     bg: "bg-red-50",     ring: "stroke-red-500" },
};

function formatearFecha(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-CL");
}

// Círculo de puntaje simple en SVG, sin librerías externas
function PuntajeCircular({ puntaje, nivel }) {
  const cfg = NIVEL_CONFIG[nivel] ?? { color: "text-gray-400", bg: "bg-gray-50", ring: "stroke-gray-300" };
  const radio = 46;
  const circunferencia = 2 * Math.PI * radio;
  const progreso = puntaje != null ? (puntaje / 100) * circunferencia : 0;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-[120px] h-[120px]">
        <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
          <circle cx="55" cy="55" r={radio} fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="55" cy="55" r={radio} fill="none"
            className={cfg.ring}
            strokeWidth="10"
            strokeDasharray={circunferencia}
            strokeDashoffset={circunferencia - progreso}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${cfg.color}`}>{puntaje ?? "—"}</span>
          <span className="text-[10px] text-gray-400">/ 100</span>
        </div>
      </div>
      <span className={`mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
        {nivel ?? "Sin datos suficientes"}
      </span>
    </div>
  );
}

function BarraComponente({ label, valor }) {
  const pct = valor ?? 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500 font-medium">{label}</span>
        <span className="font-semibold text-slate-700">{valor != null ? `${valor}/100` : "Sin datos"}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function HojaDeVidaModal({ isOpen, onClose, empleado, idProyecto = null }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  async function cargar() {
    if (!empleado?.id_usuario) return;
    setLoading(true);
    setError(null);
    try {
      const res = idProyecto
        ? await HojaDeVidaService.obtenerPorProyecto(idProyecto, empleado.id_usuario)
        : await HojaDeVidaService.obtenerGlobal(empleado.id_usuario);
      setData(res?.data ?? res ?? null);
    } catch (err) {
      console.error("Error al cargar hoja de vida:", err);
      setError(err.message || "No se pudo cargar la hoja de vida");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (isOpen) cargar(); }, [isOpen, empleado?.id_usuario, idProyecto]);

  function exportarPDF() {
    if (!data) return;
    const doc = new jsPDF();
    const nombreCompleto = `${data.informacionPersonal?.nombre ?? ""} ${data.informacionPersonal?.apellido ?? ""}`.trim();

    doc.setFontSize(16);
    doc.text("Hoja de Vida Laboral", 14, 18);
    doc.setFontSize(11);
    doc.text(nombreCompleto, 14, 26);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`RUT: ${data.informacionPersonal?.rut ?? "—"}`, 14, 32);
    if (data.proyecto) {
      doc.text(`Proyecto: ${data.proyecto.nombre}`, 14, 37);
    } else {
      doc.text("Alcance: General (todos los proyectos)", 14, 37);
    }
    doc.text(`Generado: ${new Date().toLocaleDateString("es-CL")}`, 14, 42);

    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text(`Puntaje General: ${data.puntaje?.final ?? "—"}/100 (${data.puntaje?.nivel ?? "Sin datos"})`, 14, 52);

    autoTable(doc, {
      startY: 58,
      head: [["Componente", "Puntaje"]],
      body: [
        ["Calificación", data.puntaje?.calificacion != null ? `${data.puntaje.calificacion}/100` : "Sin datos"],
        ["Asistencia",   data.puntaje?.asistencia != null ? `${data.puntaje.asistencia}/100` : "Sin datos"],
      ],
      theme: "grid",
      styles: { fontSize: 9 },
    });

    const asis = data.asistencias ?? {};
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Resumen de Asistencia", "Cantidad"]],
      body: [
        ["Presente", asis.asistido ?? 0],
        ["Atraso", asis.atraso ?? 0],
        ["Falta justificada", asis.faltaJustificada ?? 0],
        ["Falta injustificada", asis.faltaInjustificada ?? 0],
        ["Retiro anticipado", asis.retirado ?? 0],
        ["En espera / pendiente", asis.enEspera ?? 0],
        ["Total registros", asis.total ?? 0],
      ],
      theme: "grid",
      styles: { fontSize: 9 },
    });

    const categorias = data.evaluaciones?.porCategoria ?? [];
    if (categorias.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [["Categoría", "Promedio", "Evaluaciones", "% Cumplimiento"]],
        body: categorias.map((c) => [c.categoria, c.promedio, c.totalEvaluaciones, `${c.tasaCumplimiento}%`]),
        theme: "grid",
        styles: { fontSize: 9 },
      });
    }

    const ultimas = data.evaluaciones?.resumen?.ultimas ?? [];
    if (ultimas.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [["Fecha", "Tarea", "Calificación", "Cumplió", "Evaluador"]],
        body: ultimas.map((e) => [
          formatearFecha(e.fecha),
          e.tarea,
          e.calificacion,
          e.cumplio ? "Sí" : "No",
          e.evaluador,
        ]),
        theme: "grid",
        styles: { fontSize: 8 },
      });
    }

    const nombreArchivo = `hoja_de_vida_${data.informacionPersonal?.rut ?? empleado.id_usuario}${idProyecto ? "_proyecto" : "_general"}.pdf`;
    doc.save(nombreArchivo);
  }

  const titulo = `Hoja de Vida — ${empleado?.nombre ?? ""} ${empleado?.apellido ?? ""}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo} variant="wide">
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 text-center py-10">{error}</p>
      ) : !data ? (
        <p className="text-sm text-gray-400 italic text-center py-10">Sin datos disponibles.</p>
      ) : (
        <div className="space-y-6">
          {data.proyecto && (
            <div className="text-xs font-semibold text-violet-600 bg-violet-50 inline-block px-3 py-1 rounded-full">
              <i className="fas fa-diagram-project mr-1" /> {data.proyecto.nombre}
            </div>
          )}

          {/* ── Puntaje general ── */}
          <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 rounded-2xl p-5">
            <PuntajeCircular puntaje={data.puntaje?.final} nivel={data.puntaje?.nivel} />
            <div className="flex-1 w-full space-y-3">
              <BarraComponente label="Calificación (50%)" valor={data.puntaje?.calificacion} />
              <BarraComponente label="Asistencia (50%)" valor={data.puntaje?.asistencia} />
            </div>
          </div>

          {/* ── Stats rápidas ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-green-600">{data.asistencias?.asistido ?? 0}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Presente</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-amber-600">{data.asistencias?.atraso ?? 0}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Atrasos</div>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-red-500">{data.asistencias?.faltaInjustificada ?? 0}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Faltas injust.</div>
            </div>
            <div className="bg-slate-100 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-slate-600">{data.evaluaciones?.resumen?.total ?? 0}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Evaluaciones</div>
            </div>
          </div>

          {/* ── Desempeño por categoría ── */}
          {data.evaluaciones?.porCategoria?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Desempeño por categoría</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="text-left px-3 py-2">Categoría</th>
                      <th className="text-center px-3 py-2">Promedio</th>
                      <th className="text-center px-3 py-2">Evaluaciones</th>
                      <th className="text-center px-3 py-2">% Cumplimiento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.evaluaciones.porCategoria.map((c) => (
                      <tr key={c.categoria}>
                        <td className="px-3 py-2 font-medium text-slate-700">{c.categoria}</td>
                        <td className="px-3 py-2 text-center">{c.promedio}</td>
                        <td className="px-3 py-2 text-center">{c.totalEvaluaciones}</td>
                        <td className="px-3 py-2 text-center">{c.tasaCumplimiento}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Últimas evaluaciones ── */}
          {data.evaluaciones?.resumen?.ultimas?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Últimas evaluaciones</h3>
              <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden max-h-[30vh] overflow-y-auto">
                {data.evaluaciones.resumen.ultimas.map((e) => (
                  <li key={e.id_evaluacion} className="px-4 py-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{e.tarea}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {formatearFecha(e.fecha)} · Evaluado por {e.evaluador}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${e.cumplio ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                          {e.cumplio ? "Cumplió" : "No cumplió"}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-600">Calidad: {e.calificacion}/5</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between pt-5">
        <button
          onClick={exportarPDF}
          disabled={!data}
          className="px-4 py-2 text-sm font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <i className="fas fa-file-pdf mr-2" /> Exportar PDF
        </button>
        <button onClick={onClose} className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
