import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";

// Guardián para rutas privadas
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-bg text-admin-text-main">
        <p className="font-medium">Verificando sesión activa...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Guardián para rutas públicas (Evita que un usuario ya logueado vuelva al Login)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta raíz redirige dinámicamente según el estado del usuario */}
          <Route path="/" element={<RootRedirect />} />

          {/* Login protegido por el guardián público */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* Rutas del Sistema protegidas por el guardián privado */}
          <Route 
            path="/*" 
            element={
              <PrivateRoute>
                <Routes>
                  <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<div className="p-4 text-admin-text-main">Bienvenido al Dashboard</div>} />
                    <Route path="/usuarios" element={<div className="p-4 text-admin-text-main">Gestión de Usuarios</div>} />
                  </Route>
                </Routes>
              </PrivateRoute>
            } 
          />

          {/* Cualquier otra ruta rota vuelve al pivote central */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}