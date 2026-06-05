import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Admin from "../pages/admin/adminPage";
import DashboardView from './DashboardView'

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
      </header>

      {/* Contenedor principal donde se inyectan las vistas de las URLs (/dashboard, etc.) */}
      <main className="flex-1 overflow-hidden">
        <DashboardView />
        <Admin />
      </main>
    </div>
  );
}
