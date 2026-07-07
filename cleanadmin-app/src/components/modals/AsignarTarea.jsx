import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { AsignacionService } from '../../api/asignacion.service';
import { formatearFechaHora } from '../../utils/formatters';

const ESTADOS_ASIGNABLES = ['PLANIFICADA', 'ASIGNADA', 'EN_PROCESO'];

function empleadoActualDe(tarea) {
  const asignaciones = tarea?.asignaciones ?? [];
  if (!asignaciones.length) return null;
  const ultima = [...asignaciones].sort(
    (a, b) => new Date(b.hora_asignacion) - new Date(a.hora_asignacion)
  )[0];
  return ultima?.empleado ?? null;
}

export default function AsignarTarea({ isOpen, onClose, tareasPendientes, empleados, tareaPreseleccionada, actualizarLista }) {
  const [formData, setFormData] = useState({ id_tarea: '', id_empleado: '' });

  useEffect(() => {
    if (isOpen && tareaPreseleccionada) {
      const empleadoActual = empleadoActualDe(tareaPreseleccionada);
      setFormData({
        id_tarea: String(tareaPreseleccionada.id_tarea ?? ''),
        id_empleado: empleadoActual ? String(empleadoActual.id_usuario) : '',
      });
    } else if (isOpen && !tareaPreseleccionada) {
      setFormData({ id_tarea: '', id_empleado: '' });
    }
  }, [isOpen, tareaPreseleccionada]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const tareasSeleccionables = tareaPreseleccionada
    ? tareasPendientes?.filter(t => t.id_tarea === tareaPreseleccionada.id_tarea)
    : tareasPendientes?.filter(t => ESTADOS_ASIGNABLES.includes(t.estado));
  const tareaActual = tareaPreseleccionada
    ?? tareasPendientes?.find(t => String(t.id_tarea) === String(formData.id_tarea));
  const yaTieneEmpleado = !!empleadoActualDe(tareaActual);
  const tipoAsignacionAutomatico = yaTieneEmpleado ? 'REASIGNADA' : 'PROGRAMADA';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_tarea || !formData.id_empleado) {
      alert("Debes seleccionar una tarea y un empleado antes de continuar.");
      return;
    }

    const datosProcesados = {
      id_tarea: parseInt(formData.id_tarea, 10),
      id_empleado: parseInt(formData.id_empleado, 10),
      tipo_asignacion: tipoAsignacionAutomatico,
    };

    try {
      await AsignacionService.crear(datosProcesados);

      alert(yaTieneEmpleado ? "¡Tarea reasignada con éxito!" : "¡Empleado asignado a la tarea con éxito!");
      actualizarLista();
      onClose();
      setFormData({ id_tarea: '', id_empleado: '' });
    } catch (error) {
      console.error("Fallo al asignar:", error);
      alert(`Asignación rechazada por el sistema:\n\n${error.message}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={yaTieneEmpleado ? "Reasignación de Personal" : "Asignación de Personal"}>
      <FormContainer
        title={yaTieneEmpleado ? "Reasignar Tarea" : "Asignar Tarea a Empleado"}
        description={
          tareaPreseleccionada
            ? `${yaTieneEmpleado ? "Vas a reasignar" : "Vas a asignar"}: ${tareaPreseleccionada?.actividad?.descripcion_esp || "esta tarea"}. Elige el empleado responsable.`
            : "Selecciona una tarea y asígnala al personal adecuado."
        }
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText={yaTieneEmpleado ? "Confirmar Reasignación" : "Confirmar Asignación"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tarea</label>
            <select
              name="id_tarea"
              value={formData.id_tarea}
              onChange={handleChange}
              required
              disabled={!!tareaPreseleccionada}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${tareaPreseleccionada ? "bg-gray-100 text-gray-500" : ""}`}
            >
              <option value="">Seleccione una tarea...</option>
              {tareasSeleccionables?.map(tarea => (
                <option key={tarea.id_tarea} value={tarea.id_tarea}>{tarea.actividad?.descripcion_esp || "Sin nombre"} | {formatearFechaHora(tarea.fecha, tarea.hora)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
            <select name="id_empleado" value={formData.id_empleado} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Selecciona empleado...</option>
              {empleados?.filter(emp => emp.rol === 'EMPLEADO').map(emp => (
                <option key={emp.id_usuario} value={emp.id_usuario}>{emp.nombre} {emp.apellido}</option>
              ))}
            </select>
          </div>
        </div>
      </FormContainer>
    </Modal>
  );
}