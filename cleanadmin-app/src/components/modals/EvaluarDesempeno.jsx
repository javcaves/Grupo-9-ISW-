import React, { useState } from "react";
import { Modal } from "../Modal";
import { FormContainer } from "../Formulario";
import { EvaluacionService } from "../../api/evaluacion.service";
import { formatearFecha } from "../../utils/formatters";

// Se abre desde una fila de TareasView, sobre la tarea + el empleado asignado a ella
export default function EvaluarDesempeno({ isOpen, onClose, tarea, empleado, actualizarLista }) {
  const [formData, setFormData] = useState({ cumplio: "true", calificacion: "5", comentario: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cumplio = formData.cumplio === "true";

    if (!cumplio && formData.comentario.trim().length < 5) {
      alert("Cuando la tarea no se cumplió, la justificación es obligatoria (mínimo 5 caracteres).");
      return;
    }

    try {
      await EvaluacionService.crear({
        id_tarea: tarea.id_tarea,
        id_empleado: empleado.id_usuario,
        cumplio,
        calificacion: parseInt(formData.calificacion, 10),
        comentario: formData.comentario.trim() || undefined,
      });

      alert("¡Evaluación registrada con éxito!");
      actualizarLista?.();
      onClose();
      setFormData({ cumplio: "true", calificacion: "5", comentario: "" });
    } catch (error) {
      console.error("Error al registrar evaluación:", error);
      alert(`No se pudo registrar la evaluación:\n\n${error.message}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Evaluar Desempeño">
      <FormContainer
        title={`Evaluar a ${empleado?.nombre ?? ""} ${empleado?.apellido ?? ""}`}
        description={`Sobre la tarea: ${tarea?.actividad?.descripcion_esp || "esta tarea"} (${tarea?.fecha ? formatearFecha(tarea.fecha) : ""})`}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText="Registrar Evaluación"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿Cumplió la tarea?</label>
            <select name="cumplio" value={formData.cumplio} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="true">Sí, la cumplió</option>
              <option value="false">No, no la cumplió</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calidad del trabajo (1 a 5)</label>
            <select name="calificacion" value={formData.calificacion} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="5">5 — Excelente</option>
              <option value="4">4 — Bueno</option>
              <option value="3">3 — Regular</option>
              <option value="2">2 — Deficiente</option>
              <option value="1">1 — Muy deficiente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentario {formData.cumplio === "false" && <span className="text-red-600">*</span>}
            </label>
            <textarea
              name="comentario"
              value={formData.comentario}
              onChange={handleChange}
              rows="3"
              required={formData.cumplio === "false"}
              maxLength={500}
              placeholder={formData.cumplio === "false" ? "Explica por qué no se cumplió (obligatorio)" : "Observaciones (opcional)"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{formData.comentario.length}/500 caracteres</p>
          </div>
        </div>
      </FormContainer>
    </Modal>
  );
}
