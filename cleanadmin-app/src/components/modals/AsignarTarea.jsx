import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { AsignacionService } from '../../api/asignacion.service';
import { TareaService } from '../../api/tareas.service';
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

export default function AsignarTarea({ isOpen, onClose, tareasPendientes, tareaPreseleccionada, actualizarLista }) {
  const [formData, setFormData] = useState({ id_tarea: '', id_empleado: '' });
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
  const [cargandoEmpleados, setCargandoEmpleados] = useState(false);
  const [errorEmpleados, setErrorEmpleados] = useState('');

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

  // Cada vez que cambia la tarea seleccionada, consultamos al backend qué
  // empleados están efectivamente disponibles (turno vigente para la fecha
  // y hora de esa tarea), en vez de mostrar a todo el personal del proyecto.
  useEffect(() => {
    const idTarea = formData.id_tarea;
    if (!isOpen || !idTarea) {
      setEmpleadosDisponibles([]);
      return;
    }

    let cancelado = false;
    setCargandoEmpleados(true);
    setErrorEmpleados('');

    TareaService.obtenerEmpleadosDisponibles(idTarea)
      .then((data) => {
        if (cancelado) return;
        const lista = data?.data ?? data ?? [];
        setEmpleadosDisponibles(Array.isArray(lista) ? lista : []);
      })
      .catch((error) => {
        if (cancelado) return;
        console.error("Error al obtener empleados disponibles:", error);
        setEmpleadosDisponibles([]);
        setErrorEmpleados("No se pudo obtener el personal disponible para el turno de esta tarea.");
      })
      .finally(() => {
        if (!cancelado) setCargandoEmpleados(false);
      });

    return () => { cancelado = true; };
  }, [isOpen, formData.id_tarea]);

  // Si el empleado que estaba pre-seleccionado (por ejemplo, al reasignar)
  // ya no figura entre los disponibles para la tarea actual, se limpia la
  // selección para evitar enviar una asignación inválida.
  useEffect(() => {
    if (!formData.id_empleado) return;
    if (cargandoEmpleados) return;
    const sigueDisponible = empleadosDisponibles.some(
      (emp) => String(emp.id_usuario) === String(formData.id_empleado)
    );
    if (!sigueDisponible) {
      setFormData((prev) => ({ ...prev, id_empleado: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empleadosDisponibles, cargandoEmpleados]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const tareasSeleccionables = tareaPreseleccionada
    ? tareasPendientes?.filter(t => t.id_tarea === tareaPreseleccionada.id_tarea)
    : tareasPendientes?.filter(t => ESTADOS_ASIGNABLES.includes(t.estado));
  const tareaActual = tareaPreseleccionada
    ?? tareasPendientes?.find(t => String(t.id_tarea) === String(formData.id_tarea));
  const yaTieneEmpleado = !!empleadoActualDe(tareaActual);
  const tipoAsignacionAutomatico = yaTieneEmpleado ? 'REASIGNADA' : 'PROGRAMADA';

  const empleadoActual = empleadoActualDe(tareaActual);
  // Aseguramos que el empleado ya asignado (en caso de reasignación) siga
  // apareciendo como opción aunque, por ejemplo, ya no calce exactamente
  // con el turno (para no "perderlo" de la vista al reasignar).
  const opcionesEmpleado = empleadoActual && !empleadosDisponibles.some(e => e.id_usuario === empleadoActual.id_usuario)
    ? [empleadoActual, ...empleadosDisponibles]
    : empleadosDisponibles;

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
            <select
              name="id_empleado"
              value={formData.id_empleado}
              onChange={handleChange}
              required
              disabled={!formData.id_tarea || cargandoEmpleados}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">
                {!formData.id_tarea
                  ? "Selecciona primero una tarea..."
                  : cargandoEmpleados
                    ? "Cargando personal disponible..."
                    : opcionesEmpleado.length === 0
                      ? "Sin personal disponible en ese turno"
                      : "Selecciona empleado..."}
              </option>
              {opcionesEmpleado?.map(emp => (
                <option key={emp.id_usuario} value={emp.id_usuario}>{emp.nombre} {emp.apellido}</option>
              ))}
            </select>
            <p className="text-xs mt-1" style={{ color: "var(--card-subtitle, #6b7280)" }}>
              Solo se muestran empleados que tienen un turno vigente durante la fecha y hora de la tarea.
            </p>
            {errorEmpleados && (
              <p className="text-xs mt-1 text-red-500">{errorEmpleados}</p>
            )}
            {!cargandoEmpleados && !errorEmpleados && formData.id_tarea && opcionesEmpleado.length === 0 && (
              <p className="text-xs mt-1 text-amber-600">
                No hay empleados con turno asignado para el horario de esta tarea.
              </p>
            )}
          </div>
        </div>
      </FormContainer>
    </Modal>
  );
}
