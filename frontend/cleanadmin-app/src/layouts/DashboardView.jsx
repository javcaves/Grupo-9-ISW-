import { useNavigate } from "react-router-dom";
import { Search, LogOut } from "lucide-react";

import { useAuth } from "../context/AuthContext";

import TabsContent from "../components/tabsContent.jsx";

import { GestionTurnos } from "./gestion_turno.jsx";
import { FormularioTurno } from "./form_turno.jsx";
import { Card } from '../components/Card.jsx';

export default function DashboardView() {

  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  // =========================
  // TABS
  // =========================

  const tabs = [
    {
      label: "Registro Personal",

      content: (
        <div className="grid grid-cols-4 gap-6">
                  <Card
          title = "Hola mundo"
          subtitle = "chao mundo"
          className = "rounded-2xl"
        />
                          <Card
          title = "Hola mundo"
          subtitle = "chao mundo"
          className = "rounded-2xl"
        />
                          <Card
          title = "Hola mundo"
          subtitle = "chao mundo"
          className = "rounded-2xl"
        />

          <div className="col-span-4">
            <GestionTurnos />
          </div>

        </div>
      )
    },

    {
      label: "Actividades",

      content: (
        <div className="space-y-4">

                            <Card
          title = "Hola mundo"
          subtitle = "chao mundo"
          className = "rounded-2xl"
        />
                          <Card
          title = "Hola mundo"
          subtitle = "chao mundo"
          className = "rounded-2xl"
        />
                          <Card
          title = "Hola mundo"
          subtitle = "chao mundo"
          className = "rounded-2xl"
        />
                          <Card
          title = "Hola mundo"
          subtitle = "chao mundo"
          className = "rounded-2xl"
        />

        </div>
      )
    },

    {
      label: "Turnos",

      content: (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <FormularioTurno />
        </div>
      )
    }
  ];

  return (
    <TabsContent
      title="Gestión de Proyectos"
      subtitle="Administra permisos, roles y accesos del sistema"

      tabs={tabs}

      search={
        <div className="flex items-center bg-white border border-gray-200 rounded-full px-5 py-3 shadow-sm w-full max-w-2xl">

          <Search
            size={18}
            className="text-gray-400"
          />

          <input
            type="text"
            placeholder="Buscar usuario..."
            className="bg-transparent outline-none ml-3 w-full text-sm"
          />

        </div>
      }

      userIcon={
        <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold shadow-sm">
          {user?.nombre?.[0] || "U"}
        </div>
      }

      // actionButton={
      //   <button
      //     onClick={handleLogout}
      //     className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 transition-all text-white px-5 py-3 rounded-full shadow-sm"
      //   >
      //     <LogOut size={18} />
      //     Cerrar Sesión
      //   </button>
      // }
    />
  );
}