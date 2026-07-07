// src/components/modals/VincularPersonalModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { FormContainer } from "../Formulario";
import { ProyectoUsuarioService } from "../../api/proyecto_usuario.service";
import SelectorUsuariosPorCargo from "./SelectorUsuariosPorCargo";

// Mismo criterio que en NuevoPersonalModal: quien tiene estos roles puede
// vincular cualquiera de los 3 cargos. ENCARGADO solo puede vincular EMPLEADO
// (reflejado también en el backend: proyecto_usuario.service.js lo rechaza
// igual si se intenta saltar esta restricción desde el cliente).
const ROLES_QUE_ELIGEN_CARGO = ["SUPERVISOR", "ADMIN", "ROOT"];

const ROLES_INFO = {
  EMPLEADO:   { label: "Empleados" },
  SUPERVISOR: { label: "Supervisores" },
  ENCARGADO:  { label: "Encargados" },
};

export default function VincularPersonalModal({
  isOpen,
  onClose,
  idProyecto,
  rolEjecutor,
  usuariosVinculados = [], // usuarios ya asignados a este proyecto (para excluirlos de la lista)
  onSuccess,
}) {
  const rolesDisponibles = ROLES_QUE_ELIGEN_CARGO.includes(rolEjecutor)
    ? ["EMPLEADO", "SUPERVISOR", "ENCARGADO"]
    : ["EMPLEADO"];

  const [rolActivo, setRolActivo]   = useState(rolesDisponibles[0]);
  const [seleccion, setSeleccion]   = useState({ EMPLEADO: [], SUPERVISOR: [], ENCARGADO: [] });
  const [guardando, setGuardando]   = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setRolActivo(rolesDisponibles[0]);
    setSeleccion({ EMPLEADO: [], SUPERVISOR: [], ENCARGADO: [] });
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const idsYaVinculados = usuariosVinculados.map((u) => u.id_usuario);

  const toggle = (rol, idUsuario) => {
    setSeleccion((s) => {
      const lista = s[rol];
      return {
        ...s,
        [rol]: lista.includes(idUsuario)
          ? lista.filter((id) => id !== idUsuario)
          : [...lista, idUsuario],
      };
    });
  };

  const totalSeleccionados = Object.values(seleccion).reduce((acc, l) => acc + l.length, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalSeleccionados === 0) {
      setError("Selecciona al menos una persona para vincular.");
      return;
    }

    setGuardando(true);
    setError(null);

    const idsAAsignar = Object.values(seleccion).flat();

    const resultados = await Promise.allSettled(
      idsAAsignar.map((idUsuario) =>
        ProyectoUsuarioService.asignarUsuario(idProyecto, { id_usuario: idUsuario })
      )
    );

    const fallidos = resultados.filter((r) => r.status === "rejected");

    setGuardando(false);

    if (fallidos.length === idsAAsignar.length) {
      const primerError = fallidos[0]?.reason?.message;
      setError(primerError || "No se pudo vincular a ninguna de las personas seleccionadas.");
      return;
    }

    if (fallidos.length > 0) {
      setError(
        `Se vinculó a ${idsAAsignar.length - fallidos.length} de ${idsAAsignar.length} personas. Revisa el listado: alguna podría ya estar vinculada.`
      );
      onSuccess?.();
      return;
    }

    onSuccess?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vincular Personal Existente">
      <FormContainer
        title="Vincular Personal Existente"
        description="Busca personas ya registradas en el sistema y vincúlalas a este proyecto. Esto no crea usuarios nuevos."
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText={guardando ? "Vinculando..." : `Vincular${totalSeleccionados > 0 ? ` (${totalSeleccionados})` : ""}`}
      >
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {rolesDisponibles.length > 1 && (
          <div className="flex gap-1 border-b border-gray-200 mb-1">
            {rolesDisponibles.map((rol) => (
              <button
                key={rol}
                type="button"
                onClick={() => setRolActivo(rol)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  rolActivo === rol
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {ROLES_INFO[rol].label}
                {seleccion[rol].length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-indigo-100 text-indigo-700 text-xs">
                    {seleccion[rol].length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {rolesDisponibles.map((rol) => (
          <div key={rol} className={rolActivo === rol ? "" : "hidden"}>
            <SelectorUsuariosPorCargo
              cargo={rol}
              etiqueta={ROLES_INFO[rol].label}
              seleccionados={seleccion[rol]}
              onToggle={(idUsuario) => toggle(rol, idUsuario)}
              excluirIds={idsYaVinculados}
              minimo={0}
            />
          </div>
        ))}
      </FormContainer>
    </Modal>
  );
}
