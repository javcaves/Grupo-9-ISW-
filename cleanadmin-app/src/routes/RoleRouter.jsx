import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import MainLayout from "../layouts/MainLayout";
import EmployeeLayout from "../layouts/EmployeeLayout";

// Vistas empleado
import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import EmployeeAsistencia from "../pages/employee/EmployeeAsistencia";
import EmployeeTareas from "../pages/employee/EmployeeTareas";
import EmployeeHistorial from "../pages/employee/EmployeeHistorial";

export default function RoleRouter() {
  const { user } = useAuth();

  // EMPLEADO
  if (user?.rol === "EMPLEADO") {
    return (
      <Routes>
        <Route element={<EmployeeLayout />}>
          <Route
            path="/dashboard"
            element={<EmployeeDashboard />}
          />

          <Route
            path="/asistencia"
            element={<EmployeeAsistencia />}
          />

          <Route
            path="/tareas"
            element={<EmployeeTareas />}
          />

          <Route
            path="/historial"
            element={<EmployeeHistorial />}
          />

          {/* Cualquier ruta inválida vuelve al inicio del empleado */}
          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Route>
      </Routes>
    );
  }

  // ADMIN / SUPERVISOR / OTROS
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path="/dashboard"
          element={
            <div className="p-4 text-admin-text-main">
              Bienvenido al Dashboard
            </div>
          }
        />

        <Route
          path="/usuarios"
          element={
            <div className="p-4 text-admin-text-main">
              Gestión de Usuarios
            </div>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Route>
    </Routes>
  );
}