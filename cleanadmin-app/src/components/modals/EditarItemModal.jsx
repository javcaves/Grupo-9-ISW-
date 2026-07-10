import React, { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { FormContainer } from "../Formulario";
import { ItemsService } from "../../api/items.service";

const TIPOS_ITEM = [
  "MAQUINARIA",
  "HERRAMIENTA",
  "UTENSILIO",
  "PRODUCTO",
];

const UNIDADES_MEDIDA = [
  "LITROS",
  "UNIDADES",
  "KILOS",
  "SACOS",
  "BOLSAS",
  "METROS",
];

const TIPOS_CONTROL = [
  "CONSUMO",
  "PRESTAMO",
];

const FORM_INICIAL = {
  nombre: "",
  descripcion: "",
  tipo: "",
  unidad_medida: "",
  control: "",
};


export default function EditarItemModal({
  isOpen,
  onClose,
  item,
  actualizarLista,
}) {

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);


  useEffect(() => {
    if (!isOpen || !item) return;

    setFormData({
      nombre: item.nombre ?? "",
      descripcion: item.descripcion ?? "",
      tipo: item.tipo ?? "",
      unidad_medida: item.unidad_medida ?? "",
      control: item.control ?? "",
    });

  }, [isOpen, item]);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleClose = () => {
    setFormData(FORM_INICIAL);
    onClose();
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setGuardando(true);

    try {

      await ItemsService.actualizar(
        item.id_item,
        {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          tipo: formData.tipo,
          unidad_medida: formData.unidad_medida,
          control: formData.control,
        }
      );

      actualizarLista?.();
      handleClose();

    } catch(error) {

      console.error(
        "EditarItemModal:",
        error
      );

      const detalle =
        error?.response?.data?.errorDetails ||
        error?.response?.data?.message ||
        error?.message;

      alert(
        detalle ||
        "No se pudo actualizar el item."
      );

    } finally {
      setGuardando(false);
    }
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Item"
    >

      <FormContainer
        title="Editar item de catálogo"
        description="Actualiza la información general del item."
        onSubmit={handleSubmit}
        onCancel={handleClose}
        submitText={
          guardando
          ? "Guardando..."
          : "Guardar cambios"
        }
      >

        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre
            </label>

            <input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>


          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción
            </label>

            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>


          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo
            </label>

            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {TIPOS_ITEM.map((t)=>(
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium mb-1">
              Unidad de medida
            </label>

            <select
              name="unidad_medida"
              value={formData.unidad_medida}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {UNIDADES_MEDIDA.map((u)=>(
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium mb-1">
              Control
            </label>

            <select
              name="control"
              value={formData.control}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {TIPOS_CONTROL.map((c)=>(
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>


        </div>

      </FormContainer>

    </Modal>
  );
}