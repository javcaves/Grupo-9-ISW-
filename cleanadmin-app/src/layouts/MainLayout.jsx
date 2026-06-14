import { ThemeProvider } from "../context/ThemeContext";
import Admin from "../pages/adminPage";

export default function MainLayout() {
  return (
    <ThemeProvider>
      <div className="layout-container">
        <main className="flex-1 overflow-hidden">
          <Admin />
        </main>
      </div>
    </ThemeProvider>
  );
}
