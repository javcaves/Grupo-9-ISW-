import React, { useState, useEffect } from 'react';
import { FormContainer } from '../components/Formulario.jsx';
import { TurnoService } from '../api/turno.service';
import { ProyectoUsuarioService } from '../api/proyecto_usuario.service';

export const FormularioTurno = ({ onSuccess, idProyecto, turno = null }) => {
  const isEditing = Boolean(turno);
  const [turnoData, setTurnoData] = useState({ 
    nombre: '', 
    ingreso: '', 
    salida: '', 
    descripcion: '',
    empleados: [] // Inicializamos como array vacío, pero lo convertiremos a string para el input
  });
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (turno) {
      const empleadosIniciales = (turno.turnoEmpleados || turno.empleados || [])
        .map((item) => item?.id_empleado ?? item?.empleado?.id_usuario ?? item?.id_usuario ?? item?.id ?? null)
        .filter(Boolean);

      setTurnoData({
        nombre: turno.nombre || '',
        ingreso: turno.hora_ingreso || '',
        salida: turno.hora_salida || '',
        descripcion: turno.descripcion || '',
        empleados: empleadosIniciales,
      });
      return;
    }

    setTurnoData({
      nombre: '',
      ingreso: '',
      salida: '',
      descripcion: '',
      empleados: [],
    });
  }, [turno]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoadingUsuarios(true);
      try {
        if (!idProyecto) {
          setUsuariosDisponibles([]);
          return;
        }

        const data = await ProyectoUsuarioService.listarUsuarios(idProyecto);
        setUsuariosDisponibles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setUsuariosDisponibles([]);
      } finally {
        setLoadingUsuarios(false);
      }
    };

    fetchUsuarios();
  }, [idProyecto]);

  const toggleEmpleado = (id) => {
    setTurnoData(prev => {
      const isSelected = prev.empleados.includes(id);
      if (isSelected) {
        return { ...prev, empleados: prev.empleados.filter(e => e !== id) };
      } else {
        return { ...prev, empleados: [...prev.empleados, id] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!isEditing && turnoData.empleados.length === 0) {
        throw new Error("Debes seleccionar al menos un empleado de la lista.");
      }

      if (isEditing) {
        const payload = {
          nombre: turnoData.nombre,
          hora_ingreso: turnoData.ingreso,
          hora_salida: turnoData.salida,
          descripcion: turnoData.descripcion,
        };

        await TurnoService.actualizar(turno.id_turno, payload);

        const empleadosActuales = new Set((turno.turnoEmpleados || turno.empleados || [])
          .map((item) => item?.id_empleado ?? item?.empleado?.id_usuario ?? item?.id_usuario ?? item?.id ?? null)
          .filter(Boolean));
        const empleadosDeseados = new Set(turnoData.empleados);

        const paraAgregar = [...empleadosDeseados].filter((id) => !empleadosActuales.has(id));
        const paraQuitar = [...empleadosActuales].filter((id) => !empleadosDeseados.has(id));

        for (const idEmpleado of paraAgregar) {
          await TurnoService.agregarEmpleado(turno.id_turno, idEmpleado);
        }

        for (const idEmpleado of paraQuitar) {
          await TurnoService.eliminarEmpleado(turno.id_turno, idEmpleado);
        }
      } else {
        const empleadosArray = turnoData.empleados.map(id => ({ id_empleado: id }));

        const payload = {
          id_proyecto: Number(idProyecto) || Number(turnoData.id_proyecto) || 1,
          nombre: turnoData.nombre,
          hora_ingreso: turnoData.ingreso,
          hora_salida: turnoData.salida,
          descripcion: turnoData.descripcion,
          empleados: empleadosArray
        };

        await TurnoService.crear(payload);
      }

      setSuccess(isEditing ? "Turno actualizado correctamente." : "Turno creado correctamente.");
      onSuccess?.(); // Cierra el modal
    } catch (err) {
      setError(err?.message || "No se pudo guardar el turno.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* Lado Izquierdo: Formulario */}
      <div>
        <FormContainer
          title={isEditing ? "Editar Turno" : "Crear Nuevo Turno"}
          description={isEditing ? "Modifica los datos del turno sin reescribir toda la información desde cero." : "Configura los horarios y detalles del nuevo turno."}
          submitText={loading ? (isEditing ? "Guardando..." : "Creando...") : (isEditing ? "Guardar Cambios" : "Crear Turno")}
          onSubmit={handleSubmit}
          onCancel={() => onSuccess?.()}
        >
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              {success}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Turno</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: Turno Mañana"
              value={turnoData.nombre}
              onChange={(e) => setTurnoData({...turnoData, nombre: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Ingreso</label>
              <input 
                type="time" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={turnoData.ingreso}
                onChange={(e) => setTurnoData({...turnoData, ingreso: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Salida</label>
              <input 
                type="time" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={turnoData.salida}
                onChange={(e) => setTurnoData({...turnoData, salida: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea 
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: Turno de guardia nocturna..."
              value={turnoData.descripcion}
              onChange={(e) => setTurnoData({...turnoData, descripcion: e.target.value})}
            />
          </div>
        </FormContainer>
      </div>

      {/* Lado Derecho: Lista de Usuarios Disponibles */}
      <div className="flex flex-col bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden" style={{ minHeight: '500px', maxHeight: '650px' }}>
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Empleados del Proyecto</h2>
          <p className="text-sm text-gray-500 mt-1">Solo se muestran los empleados que pertenecen a este proyecto.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {loadingUsuarios ? (
            <p className="text-gray-500 text-center py-4">Cargando usuarios...</p>
          ) : usuariosDisponibles.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay empleados disponibles para este proyecto.</p>
          ) : (
            usuariosDisponibles.map(usuario => {
              const userId = usuario.id_usuario || usuario.id;
              const isSelected = turnoData.empleados.includes(userId);
              return (
                <div 
                  key={userId} 
                  onClick={() => toggleEmpleado(userId)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                    isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">{usuario.nombres || usuario.nombre} {usuario.apellidos || usuario.apellido}</p>
                    <p className="text-xs text-gray-500">{usuario.rol || 'Sin Rol'} | RUT: {usuario.rut || 'N/A'}</p>
                  </div>
                  <div>
                    <input 
                      type="checkbox" 
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded pointer-events-none" 
                      checked={isSelected} 
                      readOnly
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};