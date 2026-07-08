import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
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
  // FIX: sin useCallback, esta función era una referencia nueva en cada
  // render de AuthProvider (aunque acá casi no importaba, ya que este
  // provider rara vez re-renderiza por sí solo; se deja por consistencia
  // y para que el value memoizado de abajo funcione de verdad).
  const loginUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  // =========================
  // 3. Logout real
  // =========================
  const logoutUser = useCallback(async () => {

    try {
      await AuthService.logout();
    } catch (error) {
      console.error("❌ Error logout backend:", error);
    } finally {
      setUser(null);
    }

  }, []);

  // =========================
  // 4. Derivado (NO estado duplicado)
  // =========================
  const isAuthenticated = !!user;

  // FIX: value memoizado. AuthProvider envuelve TODA la app (incluso
  // fuera del BrowserRouter), así que cualquier objeto nuevo acá se
  // propaga como re-render a absolutamente todo. Con useMemo, solo se
  // recrea si user/loading realmente cambiaron.
  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      loginUser,
      logoutUser,
    }),
    [user, isAuthenticated, loading, loginUser, logoutUser]
  );

  return (
    <AuthContext.Provider value={value}>
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
