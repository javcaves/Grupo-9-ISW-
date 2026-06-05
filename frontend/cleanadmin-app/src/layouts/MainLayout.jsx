import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Admin from "../pages/admin/adminPage";

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
<<<<<<< Updated upstream
      <main className="flex-1 overflow-hidden">
        <Admin />
=======
<<<<<<< HEAD
      <main style={{ padding: "20px" }}>
        <Outlet />
        <DashboardView/>
=======
      <main className="flex-1 overflow-hidden">
        <Admin />
>>>>>>> daea703ac2e29ce420bfa123df61bf46e17b7bcb
>>>>>>> Stashed changes
      </main>
    </div>
  );
}