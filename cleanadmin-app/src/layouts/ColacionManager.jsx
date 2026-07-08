import React, { useState, useEffect } from 'react';
import { TurnoService } from '../api/turno.service';

export const ColacionManager = ({ turno, onSuccess }) => {
  const [empleados, setEmpleados] = useState([]);
  const [loadingIds, setLoadingIds] = useState({});
  const [errorIds, setErrorIds] = useState({});
  const [successIds, setSuccessIds] = useState({});
  const [globalError, setGlobalError] = useState(null);

  useEffect(() => {
    if (turno && (turno.turnoEmpleados || turno.empleados)) {
      const items = (turno.turnoEmpleados || turno.empleados || []).map(item => {
        // Manejar estructura anidada de TurnoEmpleado
        const empleadoData = item.empleado || item;
        const id_empleado = item.id_empleado || empleadoData.id_usuario || empleadoData.id;

        return {
          id_empleado,
          nombres: empleadoData.nombres || empleadoData.nombre || 'Sin nombre',
          apellidos: empleadoData.apellidos || empleadoData.apellido || '',
          rut: empleadoData.rut || 'N/A',
          inicio_colacion: item.inicio_colacion || '',
          fin_colacion: item.fin_colacion || '',
          trabaja_feriados: item.trabaja_feriados || false
        };
      });
      setEmpleados(items);
    }
  }, [turno]);

  const handleTimeChange = (id_empleado, field, value) => {
    setEmpleados(prev => prev.map(e => {
      if (e.id_empleado === id_empleado) {
        return { ...e, [field]: value };
      }
      return e;
    }));
    // Limpiar mensajes al editar
    if (errorIds[id_empleado]) setErrorIds(prev => ({ ...prev, [id_empleado]: null }));
    if (successIds[id_empleado]) setSuccessIds(prev => ({ ...prev, [id_empleado]: null }));
    if (globalError) setGlobalError(null);
  };

  const handleSave = async (empleado) => {
    // Si llena uno de los dos campos de colación, debe llenar el otro
    if ((empleado.inicio_colacion || empleado.fin_colacion) && (!empleado.inicio_colacion || !empleado.fin_colacion)) {
      setErrorIds(prev => ({ ...prev, [empleado.id_empleado]: 'Ambos horarios son requeridos para colación.' }));
      return;
    }

    setLoadingIds(prev => ({ ...prev, [empleado.id_empleado]: true }));
    setErrorIds(prev => ({ ...prev, [empleado.id_empleado]: null }));
    setSuccessIds(prev => ({ ...prev, [empleado.id_empleado]: null }));
    setGlobalError(null);

    try {
      const promesas = [];

      // Si ambos están definidos, guardar colación
      if (empleado.inicio_colacion && empleado.fin_colacion) {
        promesas.push(TurnoService.configurarColacion(turno.id_turno, empleado.id_empleado, {
          inicio_colacion: empleado.inicio_colacion,
          fin_colacion: empleado.fin_colacion
        }));
      }

      // Siempre guardar el estado de feriados
      promesas.push(TurnoService.configurarFeriados(turno.id_turno, empleado.id_empleado, empleado.trabaja_feriados));

      await Promise.all(promesas);

      setSuccessIds(prev => ({ ...prev, [empleado.id_empleado]: 'Horario guardado' }));
      // Optional: hide success message after 3 seconds
      setTimeout(() => {
        setSuccessIds(prev => ({ ...prev, [empleado.id_empleado]: null }));
      }, 3000);

    } catch (err) {
      setErrorIds(prev => ({ ...prev, [empleado.id_empleado]: err?.message || 'Error al guardar.' }));
    } finally {
      setLoadingIds(prev => ({ ...prev, [empleado.id_empleado]: false }));
    }
  };

  if (!empleados.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        No hay empleados asignados a este turno.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 rounded-xl">
      <div className="mb-4">
        <p className="text-sm text-slate-600">
          Configura los horarios de colación y obligación en feriados para cada empleado del turno <strong>{turno.nombre}</strong>.
          Recuerda que no puede haber horarios sin cobertura (al menos 1 empleado debe estar disponible).
        </p>
      </div>

      {globalError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
          {globalError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3">
        {empleados.map(emp => (
          <div key={emp.id_empleado} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            {/* Info Empleado */}
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">{emp.nombres} {emp.apellidos}</span>
              <span className="text-xs text-slate-500">RUT: {emp.rut}</span>
            </div>

            {/* Controles */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Inicio</label>
                  <input
                    type="time"
                    className="px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-violet-500 focus:border-violet-500"
                    value={emp.inicio_colacion}
                    onChange={(e) => handleTimeChange(emp.id_empleado, 'inicio_colacion', e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fin</label>
                  <input
                    type="time"
                    className="px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-violet-500 focus:border-violet-500"
                    value={emp.fin_colacion}
                    onChange={(e) => handleTimeChange(emp.id_empleado, 'fin_colacion', e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">¿Feriados?</label>
                  <div className="flex items-center justify-center mt-1.5">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500 cursor-pointer"
                      checked={emp.trabaja_feriados}
                      onChange={(e) => handleTimeChange(emp.id_empleado, 'trabaja_feriados', e.target.checked)}
                      title="Marcar si el empleado debe trabajar en días feriados"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSave(emp)}
                disabled={loadingIds[emp.id_empleado]}
                className="mt-4 sm:mt-0 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {loadingIds[emp.id_empleado] ? 'Guardando...' : 'Guardar'}
              </button>
            </div>

            {/* Mensajes de feedback por empleado */}
            {(errorIds[emp.id_empleado] || successIds[emp.id_empleado]) && (
              <div className="w-full sm:w-auto mt-2 sm:mt-0 text-sm">
                {errorIds[emp.id_empleado] && (
                  <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-medium block">
                    {errorIds[emp.id_empleado]}
                  </span>
                )}
                {successIds[emp.id_empleado] && (
                  <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-medium block">
                    {successIds[emp.id_empleado]}
                  </span>
                )}
              </div>
            )}

          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onSuccess?.()}
          className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-semibold rounded-lg transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
