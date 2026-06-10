import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import Admin from "../pages/adminPage";

export default function MainLayout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <ThemeProvider>
      <div className="layout-container">
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px",
            borderBottom: "1px solid var(--border-color)"
          }}
        >
          <div>
            <span>
              Usuario: <strong>{user?.nombre}</strong> ({user?.rol})
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <Admin />
        </main>
      </div>
    </ThemeProvider>
  );
}