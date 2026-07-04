import React, { useState } from "react";
import { Modal } from "../Modal";
import { FormContainer } from "../Formulario";
import { CalificacionService } from "../../api/calificacion.service";

export default function OtorgarCalificacion({
  isOpen,
  onClose,
  empleados,
  categoriasCriticas,
  actualizarLista,
}) {
  const [formData, setFormData] = useState({
    id_empleado: "",
    id_categoria: "",
    fecha_otorgamiento: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await CalificacionService.otorgar(formData);

      alert("¡Certificación otorgada al empleado con éxito!");
      actualizarLista();
      onClose();
      setFormData({
        id_empleado: "",
        id_categoria: "",
        fecha_otorgamiento: "",
      });
    } catch (error) {
      console.error("Error al otorgar calificación:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Certificaciones del Personal"
    >
      <FormContainer
        title="Otorgar Calificación"
        description="Registra la competencia de un empleado para realizar actividades críticas."
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText="Registrar Calificación"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empleado
            </label>
            <select
              name="id_empleado"
              value={formData.id_empleado}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecciona al empleado...</option>
              {empleados?.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} {emp.apellido}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría Crítica
            </label>
            <select
              name="id_categoria"
              value={formData.id_categoria}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecciona la categoría...</option>
              {categoriasCriticas?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Otorgamiento
            </label>
            <input
              type="date"
              name="fecha_otorgamiento"
              value={formData.fecha_otorgamiento}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </FormContainer>
    </Modal>
  );
}
