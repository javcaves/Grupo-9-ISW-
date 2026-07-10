import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Login from "./pages/Login";
import RoleRouter from "./routes/RoleRouter";
import { NotificacionesProvider } from "./context/NotificacionesContext";

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

// Guardián para rutas públicas
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function RootRedirect() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Todo lo autenticado pasa por RoleRouter */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <NotificacionesProvider>   {/* <-- nuevo */}
                    <RoleRouter />
                  </NotificacionesProvider>  {/* <-- nuevo */}
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}