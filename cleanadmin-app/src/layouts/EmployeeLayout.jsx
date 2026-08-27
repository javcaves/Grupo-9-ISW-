import { Outlet } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";
import EmployeeBottomBar from "../components/EmployeeBottomBar";
import Footer from "../components/Footer";

export default function EmployeeLayout() {
  return (
    <ThemeProvider>

      <div className="min-h-screen bg-gray-100">
        <div className="mx-auto max-w-md min-h-screen flex flex-col">

          <main className="flex-1 pb-20">
            <Outlet />
            <Footer />
          </main>

          <EmployeeBottomBar />

        </div>
      </div>

    </ThemeProvider>
  );
}
