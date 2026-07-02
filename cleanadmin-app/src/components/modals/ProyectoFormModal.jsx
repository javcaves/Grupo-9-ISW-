// src/components/modals/ProyectoFormModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { FormContainer } from "../Formulario";
import { ProyectoService } from "../../api/proyecto.service";
import { ProyectoUsuarioService } from "../../api/proyecto_usuario.service";
import SelectorUsuariosPorCargo from "./SelectorUsuariosPorCargo";

const ESTADOS = [
  { value: "EN_PREPARACION", label: "En Preparación" },
  { value: "EN_CURSO",       label: "En Curso" },
  { value: "FINALIZADO",     label: "Finalizado" },
];

// Debe reflejar el mismo patrón que proyecto.validations.js (proyectoCreateValidation.nombre)
const PATRON_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

const FORM_VACIO = {
  nombre: "",
  min_emp: "",
  max_emp: "",
  ubicacion: "",
  fecha_inicio: "",
  fecha_termino: "",
  estado: "EN_PREPARACION",
};

export default function ProyectoFormModal({ isOpen, onClose, modo, proyecto, onSuccess }) {
  const esEdicion = modo === "editar";

  const [form, setForm]                       = useState(FORM_VACIO);
  const [supervisoresSel, setSupervisoresSel] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setForm(
      esEdicion && proyecto
        ? {
            // El GET devuelve la entidad tal cual (nombre_proy), pero el
            // PUT/POST validan contra "nombre" — por eso el mapeo acá.
            nombre: proyecto.nombre_proy ?? "",
            min_emp: proyecto.min_emp ?? "",
            max_emp: proyecto.max_emp ?? "",
            ubicacion: proyecto.ubicacion ?? "",
            fecha_inicio: proyecto.fecha_inicio ? String(proyecto.fecha_inicio).slice(0, 10) : "",
            fecha_termino: proyecto.fecha_termino ? String(proyecto.fecha_termino).slice(0, 10) : "",
            estado: proyecto.estado ?? "EN_PREPARACION",
          }
        : FORM_VACIO
    );
    setSupervisoresSel([]);
  }, [isOpen, modo, proyecto]);

  const actualizarCampo = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const toggleSupervisor = (idUsuario) => {
    setSupervisoresSel((sel) =>
      sel.includes(idUsuario) ? sel.filter((id) => id !== idUsuario) : [...sel, idUsuario]
    );
  };

  const validar = () => {
    const nombre = form.nombre.trim();
    if (!nombre) return "El nombre del proyecto es obligatorio.";
    if (nombre.length < 2) return "El nombre debe tener al menos 2 caracteres.";
    if (!PATRON_NOMBRE.test(nombre)) return "El nombre solo puede contener letras y espacios.";

    if (!form.ubicacion.trim() || form.ubicacion.trim().length < 5) {
      return "La ubicación debe tener al menos 5 caracteres.";
    }

    if (form.min_emp === "" || form.max_emp === "") return "Debes indicar el rango de empleados.";
    if (Number(form.min_emp) <= 0) return "El mínimo de empleados debe ser mayor a 0.";
    if (Number(form.max_emp) < Number(form.min_emp)) return "El máximo no puede ser menor que el mínimo.";

    if (!form.fecha_inicio) return "La fecha de inicio es obligatoria.";
    if (form.fecha_termino && form.fecha_termino < form.fecha_inicio) {
      return "La fecha de término no puede ser anterior a la de inicio.";
    }

    if (!esEdicion && supervisoresSel.length === 0) return "Debes asignar al menos 1 supervisor.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msgError = validar();
    if (msgError) {
      setError(msgError);
      return;
    }

    setGuardando(true);
    setError(null);

    const datos = {
      nombre: form.nombre.trim(),
      min_emp: Number(form.min_emp),
      max_emp: Number(form.max_emp),
      ubicacion: form.ubicacion.trim(),
      fecha_inicio: form.fecha_inicio,
      estado: form.estado,
      ...(form.fecha_termino ? { fecha_termino: form.fecha_termino } : {}),
    };

    try {
      if (esEdicion) {
        await ProyectoService.actualizar(proyecto.id_proyecto, datos);
      } else {
        const creado = await ProyectoService.crear(datos);
        const idProyecto = creado?.id_proyecto ?? creado?.data?.id_proyecto;

        if (!idProyecto) {
          throw new Error("El proyecto se creó pero no se pudo obtener su ID para asignar supervisores.");
        }

        // El backend valida "supervisores" en el schema pero el service lo ignora,
        // así que la asignación se hace aparte, después de crear el proyecto.
        const asignaciones = supervisoresSel.map((idUsuario) =>
          ProyectoUsuarioService.asignarUsuario(idProyecto, {
            id_usuario: idUsuario,
            rol: "SUPERVISOR",
          })
        );

        const resultados = await Promise.allSettled(asignaciones);
        const todasFallaron = resultados.every((r) => r.status === "rejected");

        if (todasFallaron) {
          setError(
            "El proyecto se creó, pero no se pudo asignar ningún supervisor. Asígnalo desde la gestión de usuarios del proyecto."
          );
          setGuardando(false);
          onSuccess?.();
          return;
        }
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("ProyectoFormModal:", err);
      setError(
        err?.response?.data?.errorDetails ??
        err?.response?.data?.message ??
        "Ocurrió un error al guardar el proyecto."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={esEdicion ? "Editar Proyecto" : "Nuevo Proyecto"}>
      <FormContainer
        title={esEdicion ? "Editar Proyecto" : "Nuevo Proyecto"}
        description={
          esEdicion
            ? "Actualiza la información del proyecto."
            : "Completa los datos del proyecto y asigna al menos un supervisor."
        }
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText={guardando ? "Guardando..." : "Guardar"}
      >
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del proyecto</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => actualizarCampo("nombre", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej: Proyecto Retail Norte"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mín. empleados</label>
            <input
              type="number"
              min="1"
              value={form.min_emp}
              onChange={(e) => actualizarCampo("min_emp", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Máx. empleados</label>
            <input
              type="number"
              min="1"
              value={form.max_emp}
              onChange={(e) => actualizarCampo("max_emp", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
          <input
            type="text"
            value={form.ubicacion}
            onChange={(e) => actualizarCampo("ubicacion", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej: Santiago, Chile"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
            <input
              type="date"
              value={form.fecha_inicio}
              onChange={(e) => actualizarCampo("fecha_inicio", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha término (opcional)</label>
            <input
              type="date"
              value={form.fecha_termino}
              onChange={(e) => actualizarCampo("fecha_termino", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={form.estado}
            onChange={(e) => actualizarCampo("estado", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ESTADOS.map((op) => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
        </div>

        {!esEdicion && (
          <SelectorUsuariosPorCargo
            cargo="SUPERVISOR"
            etiqueta="Supervisores"
            seleccionados={supervisoresSel}
            onToggle={toggleSupervisor}
          />
        )}
      </FormContainer>
    </Modal>
  );
}