// src/components/modals/NuevoPersonalModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { FormContainer } from "../Formulario";
import { UsuarioService } from "../../api/usuario.service";
import { ProyectoUsuarioService } from "../../api/proyecto_usuario.service";
import PasswordInput from "../PasswordInput";
import { validarRut } from "../../utils/rut";

// Quien ejecuta con estos roles puede elegir el cargo del nuevo ingreso.
// Cualquier otro rol (ej. ENCARGADO) solo puede sumar EMPLEADO, sin preguntar.
const ROLES_QUE_ELIGEN_CARGO = ["SUPERVISOR", "ADMIN", "ROOT"];

// Mismo patrón que numero en usuario.validations.js (backend): +569XXXXXXXX
const PATRON_NUMERO_CHILENO = /^\+?569[0-9]{8}$/;

// TODO: no tengo usuarioCreateValidation (Joi) del backend — estos campos
// están tomados de la entidad Usuario. Si el schema real difiere en nombres
// u opcionalidad, esto va a fallar con 400 igual que nos pasó con proyecto/
// proyecto_usuario, y hay que alinear los nombres de campo acá.
const FORM_VACIO = {
  rut: "",
  nombre: "",
  apellido: "",
  email: "",
  numero: "",
  password: "",
  observacion: "Personal registrado desde gestión de proyecto.",
};

/**
 * modo: "crear" (default, comportamiento original: crea usuario + lo vincula
 *        al proyecto idProyecto) | "editar" (actualiza un usuario existente,
 *        sin tocar RUT ni contraseña, sin vincular a ningún proyecto).
 * usuario: objeto del usuario a editar (requerido si modo === "editar").
 */
export default function NuevoPersonalModal({
  isOpen,
  onClose,
  idProyecto,
  rolEjecutor,
  onSuccess,
  modo = "crear",
  usuario = null,
}) {
  const esEdicion       = modo === "editar";
  const puedeElegirCargo = ROLES_QUE_ELIGEN_CARGO.includes(rolEjecutor);

  const [form, setForm]           = useState(FORM_VACIO);
  const [cargo, setCargo]         = useState("EMPLEADO");
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    if (esEdicion && usuario) {
      setForm({
        rut:         usuario.rut ?? "",
        nombre:      usuario.nombre ?? "",
        apellido:    usuario.apellido ?? "",
        email:       usuario.email ?? "",
        numero:      usuario.numero ?? "",
        password:    "",
        observacion: usuario.observacion ?? "",
      });
      setCargo(usuario.rol ?? "EMPLEADO");
    } else {
      setForm(FORM_VACIO);
      setCargo("EMPLEADO");
    }

    setError(null);
  }, [isOpen, esEdicion, usuario]);

  const actualizarCampo = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const validar = () => {
    if (!esEdicion) {
      if (!form.rut.trim()) return "El RUT es obligatorio.";
      if (!validarRut(form.rut.trim())) {
        return "El RUT ingresado no es válido. Revisa el número y el dígito verificador (ej: 12345678-9).";
      }
    }

    if (!form.nombre.trim()) return "El nombre es obligatorio.";
    if (!form.apellido.trim()) return "El apellido es obligatorio.";
    if (!form.email.trim()) return "El email es obligatorio.";

    if (!form.numero.trim()) return "El número de contacto es obligatorio.";
    if (!PATRON_NUMERO_CHILENO.test(form.numero.trim())) {
      return "El número debe tener formato chileno, ej: +56912345678.";
    }

    if (!esEdicion) {
      if (!form.password || form.password.length < 6 || form.password.length > 8) {
        return "La contraseña debe tener entre 6 y 8 caracteres.";
      }
    }

    if (!form.observacion.trim()) return "La observación es obligatoria.";
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

    const cargoFinal = esEdicion ? cargo : (puedeElegirCargo ? cargo : "EMPLEADO");

    try {
      if (esEdicion) {
        await UsuarioService.actualizar(usuario.id_usuario, {
          nombre:      form.nombre.trim(),
          apellido:    form.apellido.trim(),
          email:       form.email.trim(),
          numero:      form.numero.trim(),
          observacion: form.observacion.trim(),
          rol:         cargoFinal,
        });

        onSuccess?.();
        onClose();
        return;
      }

      const creado = await UsuarioService.registrar({
        rut: form.rut.trim(),
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        numero: form.numero.trim(),
        password: form.password,
        observacion: form.observacion.trim(),
        rol: cargoFinal,
      });

      // UsuarioService.registrar no desenvuelve la respuesta (igual que .buscar),
      // así que contemplamos ambas formas posibles.
      const idUsuario = creado?.data?.id_usuario ?? creado?.id_usuario;

      if (!idUsuario) {
        throw new Error("El usuario se creó pero no se pudo obtener su ID para vincularlo al proyecto.");
      }

      try {
        await ProyectoUsuarioService.asignarUsuario(idProyecto, {
          id_usuario: idUsuario,
          rol_proy: cargoFinal,
        });
      } catch (errVinculo) {
        console.error("NuevoPersonalModal - vínculo:", errVinculo);
        setError(
          "El usuario se creó, pero no se pudo vincular al proyecto. Búscalo y vincúlalo manualmente."
        );
        setGuardando(false);
        onSuccess?.();
        return;
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("NuevoPersonalModal:", err);
      setError(
        err?.response?.data?.errorDetails ??
        err?.response?.data?.message ??
        (esEdicion ? "Ocurrió un error al actualizar a la persona." : "Ocurrió un error al registrar a la persona.")
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={esEdicion ? "Editar Personal" : "Agregar Personal"}>
      <FormContainer
        title={esEdicion ? "Editar integrante" : "Nuevo integrante"}
        description={
          esEdicion
            ? "Actualiza los datos de este usuario. El RUT no se puede modificar."
            : puedeElegirCargo
              ? "Crea un usuario nuevo y queda vinculado de inmediato a este proyecto."
              : "Crea un empleado nuevo y queda vinculado de inmediato a este proyecto."
        }
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText={guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Agregar"}
      >
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
            <input
              type="text"
              value={form.rut}
              onChange={(e) => actualizarCampo("rut", e.target.value)}
              disabled={esEdicion}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                esEdicion
                  ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "border-gray-300 focus:ring-2 focus:ring-indigo-500"
              }`}
              placeholder="12345678-9"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de contacto</label>
            <input
              type="text"
              value={form.numero}
              onChange={(e) => actualizarCampo("numero", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="+56900000000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => actualizarCampo("nombre", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input
              type="text"
              value={form.apellido}
              onChange={(e) => actualizarCampo("apellido", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => actualizarCampo("email", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {!esEdicion && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña temporal</label>
            <PasswordInput
              value={form.password}
              onChange={(e) => actualizarCampo("password", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Entre 6 y 8 caracteres"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
          <textarea
            value={form.observacion}
            onChange={(e) => actualizarCampo("observacion", e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {esEdicion ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="EMPLEADO">Empleado</option>
              <option value="ENCARGADO">Encargado</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        ) : (
          puedeElegirCargo && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo en el proyecto</label>
              <select
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="EMPLEADO">Empleado</option>
                <option value="ENCARGADO">Encargado</option>
              </select>
            </div>
          )
        )}
      </FormContainer>
    </Modal>
  );
}
