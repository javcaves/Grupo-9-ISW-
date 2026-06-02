import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GestionTurnos } from "./gestion_turno.jsx";
import { FormularioTurno } from "./form_turno.jsx";

export default function MainLayout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div>
      {/* Barra o indicador superior estructural */}
      <header style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #ccc" }}>
        <div>
          <span>Usuario: <strong>{user?.nombre}</strong> ({user?.rol})</span>
        </div>
        <button onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </header>

      {/* Contenedor principal donde se inyectan las vistas de las URLs (/dashboard, etc.) */}
      <main style={{ padding: "20px" }}>
        <Outlet />
        <GestionTurnos />
      </main>
    </div>
  );
}