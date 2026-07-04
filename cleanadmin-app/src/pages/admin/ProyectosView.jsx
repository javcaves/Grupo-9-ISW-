// pages/admin/ProyectosView.jsx
import { useState, useEffect } from "react";
import { AuthService } from "../../api/auth.service";
import { ProyectoService } from "../../api/proyecto.service";
import ProyectoHome from "./proyectos/ProyectoHome";
import RegistroPersonalView from "./proyectos/RegistroPersonalView";

const ROLES_SELECTOR = ["ROOT", "ADMIN", "SUPERVISOR"];
const ROLES_DIRECTO  = ["ENCARGADO"];

export default function ProyectosView() {
  const [rol, setRol]                           = useState(null);
  const [proyectoSeleccionado, setProyecto]     = useState(null);
  const [loading, setLoading]                   = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const me   = await AuthService.me();
        const user = me?.data?.user ?? me?.user ?? null;
        if (!user) return;

        setRol(user.rol);

        // ENCARGADO: cargamos su proyecto directamente
        if (ROLES_DIRECTO.includes(user.rol)) {
          const res      = await ProyectoService.listar();
          const lista    = Array.isArray(res) ? res : (res?.data ?? []);
          const proyecto = lista[0] ?? null;
          setProyecto(proyecto);
        }
      } catch (err) {
        console.error("ProyectosView init error:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  // ENCARGADO → directo al proyecto
  if (ROLES_DIRECTO.includes(rol)) {
    if (!proyectoSeleccionado) {
      return (
        <div className="p-6 text-center text-sm text-gray-400">
          No tienes un proyecto asignado actualmente.
        </div>
      );
    }
    return <RegistroPersonalView proyecto={proyectoSeleccionado} onVolver={null} />;
  }

  // ROOT / ADMIN / SUPERVISOR → selector de proyecto
  if (ROLES_SELECTOR.includes(rol)) {
    if (!proyectoSeleccionado) {
      return (
        <ProyectoHome
          rol={rol}
          onSeleccionarProyecto={(p) => setProyecto(p)}
        />
      );
    }
    return (
      <RegistroPersonalView
        proyecto={proyectoSeleccionado}
        onVolver={() => setProyecto(null)}
      />
    );
  }

  return null;
}
