import { Outlet } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";
import EmployeeBottomBar from "../components/EmployeeBottomBar";

export default function EmployeeLayout() {
  return (
    <ThemeProvider>

      <div className="min-h-screen bg-gray-100">
        <div className="mx-auto max-w-md min-h-screen">

          <main className="pb-20">
            <Outlet />
          </main>

          <EmployeeBottomBar />

        </div>
      </div>

    </ThemeProvider>
  );
}