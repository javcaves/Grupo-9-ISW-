import { createContext, useContext, useState, useEffect } from "react";
import { AuthService } from "../api/auth.service";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // 1. Cargar sesión inicial
  // =========================
  useEffect(() => {

    async function checkSession() {

      try {

        const response = await AuthService.me();

        console.log("🔐 Auth.me completo:", response);
        console.log("👤 Usuario:", response.user);
        console.log("📛 Nombre:", response.user?.nombre);
        console.log("🆔 Rut:", response.user?.rut);
        console.log("🎭 Rol:", response.user?.rol);

        if (response?.success && response?.user) {
          setUser(response.user);
        } else {
          setUser(null);
        }

      } catch (error) {
        console.error("❌ Error al verificar sesión:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkSession();

  }, []);

  // =========================
  // 2. Login (manual update)
  // =========================
  const loginUser = (userData) => {
    setUser(userData);
  };

  // =========================
  // 3. Logout real
  // =========================
  const logoutUser = async () => {

    try {
      await AuthService.logout();
    } catch (error) {
      console.error("❌ Error logout backend:", error);
    } finally {
      setUser(null);
    }
  };

  // =========================
  // 4. Derivado (NO estado duplicado)
  // =========================
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}