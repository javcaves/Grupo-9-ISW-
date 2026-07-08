import React, { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { CalificacionService } from "../../api/calificacion.service";

// Gestiona qué empleados están calificados para una categoría que "requiere_calificacion".
// Se abre desde CategoriasView, sobre una categoría puntual.
export default function GestionarCalificaciones({ isOpen, onClose, categoria, empleados, actualizarLista }) {
  const [calificados, setCalificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idEmpleadoNuevo, setIdEmpleadoNuevo] = useState("");

  async function cargar() {
    if (!categoria?.id_cat) return;
    setLoading(true);
    try {
      const res = await CalificacionService.listarPorCategoria(categoria.id_cat);
      setCalificados(res?.data ?? res ?? []);
    } catch (error) {
      console.error("Error al cargar calificados:", error);
      setCalificados([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      setIdEmpleadoNuevo("");
      cargar();
    }
  }, [isOpen, categoria?.id_cat]);

  const idsYaCalificados = new Set(calificados.map(c => c.empleado?.id_usuario));
  const empleadosDisponibles = (empleados ?? [])
    .filter(e => e.rol === "EMPLEADO")
    .filter(e => !idsYaCalificados.has(e.id_usuario));

  const handleAgregar = async () => {
    if (!idEmpleadoNuevo) return;
    try {
      await CalificacionService.otorgar({
        id_cat: categoria.id_cat,
        id_empleado: parseInt(idEmpleadoNuevo, 10),
      });
      setIdEmpleadoNuevo("");
      cargar();
      actualizarLista?.();
    } catch (error) {
      console.error("Error al otorgar calificación:", error);
      alert(`No se pudo otorgar la calificación:\n\n${error.message}`);
    }
  };

  const handleRevocar = async (calificacion) => {
    if (!confirm(`¿Quitar la calificación de ${calificacion.empleado?.nombre} ${calificacion.empleado?.apellido} para "${categoria?.nombre}"?`)) return;
    try {
      await CalificacionService.revocar(calificacion.id_calificacion);
      cargar();
      actualizarLista?.();
    } catch (error) {
      console.error("Error al revocar calificación:", error);
      alert(`No se pudo revocar:\n\n${error.message}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Personal Calificado — ${categoria?.nombre ?? ""}`}>
      <div className="space-y-5">
        <p className="text-sm text-gray-500">
          Solo los empleados calificados aquí podrán ser asignados a tareas de actividades de esta categoría.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Otorgar a un nuevo empleado</label>
          <div className="flex gap-2">
            <select
              value={idEmpleadoNuevo}
              onChange={(e) => setIdEmpleadoNuevo(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Selecciona un empleado...</option>
              {empleadosDisponibles.map(emp => (
                <option key={emp.id_usuario} value={emp.id_usuario}>{emp.nombre} {emp.apellido}</option>
              ))}
            </select>
            <button
              onClick={handleAgregar}
              disabled={!idEmpleadoNuevo}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-40"
            >
              Otorgar
            </button>
          </div>
          {empleadosDisponibles.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">Todos los empleados disponibles ya están calificados para esta categoría.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Empleados calificados actualmente</label>
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
            </div>
          ) : calificados.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Todavía ningún empleado está calificado para esta categoría.</p>
          ) : (
            <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
              {calificados.map(c => (
                <li key={c.id_calificacion} className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">
                    {c.empleado?.nombre} {c.empleado?.apellido}
                  </span>
                  <button
                    onClick={() => handleRevocar(c)}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline"
                  >
                    Revocar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
