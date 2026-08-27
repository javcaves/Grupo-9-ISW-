import { ThemeProvider } from "../context/ThemeContext";
import Admin from "../pages/adminPage";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <ThemeProvider>
      <div className="layout-container flex flex-col min-h-screen">
        <main className="flex-1">
          <Admin />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
