// src/components/modals/SelectorUsuariosPorCargo.jsx
import { useEffect, useState } from "react";
import { UsuarioService } from "../../api/usuario.service";

// UsuarioService.buscar() no desenvuelve la respuesta como ProyectoService,
// así que contemplamos array plano, { data: [...] } (paginado), o AxiosResponse crudo.
function extraerListado(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
}

/**
 * Selector de usuarios filtrados por cargo (rol).
 *
 * TODO: el badge "vinculado a N proyecto(s)" asume que cada usuario viene
 * con un campo `proyectos_activos` (o similar) desde el backend. Si
 * `buscarUsuarios` todavía no devuelve ese dato, el badge no se muestra
 * y hay que ajustar `campoVinculacion` cuando el backend lo entregue.
 */
export default function SelectorUsuariosPorCargo({
  cargo,                       // ej: "SUPERVISOR"
  seleccionados,                // array de id_usuario
  onToggle,                    // (idUsuario) => void
  campoVinculacion = "proyectos_en_curso", // nombre del campo que trae el conteo
  etiqueta,                     // texto del label, ej: "Supervisores"
  minimo = 1,
  excluirIds = [],               // ids que no deben listarse (ya vinculados a este proyecto)
}) {
  const [usuarios, setUsuarios]     = useState([]);
  const [cargando, setCargando]     = useState(false);
  const [error, setError]           = useState(null);
  const [busqueda, setBusqueda]     = useState("");

  useEffect(() => {
    if (!cargo) return;
    setCargando(true);
    setError(null);
    UsuarioService.listar({ rol: cargo })
      .then((res) => setUsuarios(extraerListado(res)))
      .catch((err) => {
        console.error("SelectorUsuariosPorCargo:", err);
        setError(`No se pudo cargar la lista de usuarios con cargo ${cargo}.`);
      })
      .finally(() => setCargando(false));
  }, [cargo]);

  const usuariosDisponibles = excluirIds.length
    ? usuarios.filter((u) => !excluirIds.includes(u.id_usuario))
    : usuarios;

  const usuariosFiltrados = busqueda.trim()
    ? usuariosDisponibles.filter((u) => {
        const texto = busqueda.toLowerCase();
        const nombreCompleto = `${u.nombre ?? u.nombre_completo ?? ""} ${u.apellido ?? ""}`.toLowerCase();
        const rut = (u.rut ?? "").toLowerCase();
        return nombreCompleto.includes(texto) || rut.includes(texto);
      })
    : usuariosDisponibles;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {etiqueta ?? `Usuarios (${cargo})`}{" "}
        {minimo > 0 && (
          <>
            <span className="text-red-500">*</span>{" "}
            <span className="text-xs font-normal text-gray-400">
              (mínimo {minimo})
            </span>
          </>
        )}
      </label>

      {usuariosDisponibles.length > 5 && (
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o RUT..."
          className="w-full mb-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {cargando ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : usuariosFiltrados.length === 0 ? (
        <p className="text-sm text-gray-400">
          {usuariosDisponibles.length === 0 && usuarios.length > 0
            ? `Todos los usuarios con cargo ${cargo} ya están vinculados a este proyecto.`
            : `No hay usuarios con cargo ${cargo} disponibles.`}
        </p>
      ) : (
        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
          {usuariosFiltrados.map((u) => {
            const vinculaciones = u[campoVinculacion];
            return (
              <label
                key={u.id_usuario}
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={seleccionados.includes(u.id_usuario)}
                    onChange={() => onToggle(u.id_usuario)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="flex flex-col">
                    <span>
                      {u.nombre ?? u.nombre_completo ?? `Usuario #${u.id_usuario}`}
                      {u.apellido ? ` ${u.apellido}` : ""}
                    </span>
                    {u.rut && (
                      <span className="text-xs text-gray-400">{u.rut}</span>
                    )}
                  </span>
                </span>

                {typeof vinculaciones === "number" && (
  <span
    className={`text-xs px-2 py-0.5 rounded-full ${
      vinculaciones === 0
        ? "bg-gray-100 text-gray-400"
        : "bg-amber-100 text-amber-700"
    }`}
    title={`En ${vinculaciones} proyecto(s) en curso`}
  >
    {vinculaciones === 0 ? "Sin proyecto en curso" : `${vinculaciones} en curso`}
  </span>
)}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}