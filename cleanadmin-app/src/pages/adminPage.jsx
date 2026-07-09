// pages/AdminPage.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar   from "../components/sidebar";
import TopBar    from "../components/topBar";
import Search    from "../components/search";
import { ADMIN_CONFIG } from "../data/adminConfig";

import ProyectosView  from "./admin/ProyectosView";
import PersonalView   from "./admin/PersonalView";
import InventariosView from "./admin/InventariosView";
import CategoriasView from "./admin/CategoriasView";
import ReportesView from "./admin/ReportesView";

// Módulos que todavía usan tabs hardcodeadas del TopBar
const TABS_CONFIG = {
  personal:      ADMIN_CONFIG.personal?.topBar?.tabs      ?? [],
  inventarios:   ADMIN_CONFIG.inventarios?.topBar?.tabs   ?? [],
  categorias:    ADMIN_CONFIG.categorias?.topBar?.tabs    ?? [],
  reportes:      ADMIN_CONFIG.reportes?.topBar?.tabs      ?? [],
};

const TOPBAR_CONFIG = {
  personal:    ADMIN_CONFIG.personal?.topBar    ?? {},
  inventarios: ADMIN_CONFIG.inventarios?.topBar ?? {},
  categorias:  ADMIN_CONFIG.categorias?.topBar  ?? {},
  reportes:    ADMIN_CONFIG.reportes?.topBar    ?? {},
};

export default function AdminPage() {
  const { user, logoutUser } = useAuth();
  const [activeMenu, setActiveMenu] = useState("proyectos");
  const [activeTab,  setActiveTab]  = useState("");

  const esEncargado = user?.rol === 'ENCARGADO';

  // Proyectos maneja su propio TopBar interno — no pasamos tabs ni config hardcodeada
  const esProyectos = activeMenu === "proyectos";

  const topBarProps = esProyectos
    ? {
        title:    "Proyectos",
        subtitle: "Gestión operativa por proyecto",
        tabs:     [],          // sin tabs: ProyectosView las maneja internamente
      }
    : {
        ...(TOPBAR_CONFIG[activeMenu] ?? {}),
        tabs:      TABS_CONFIG[activeMenu] ?? [],
        activeTab,
        setActiveTab,
      };

  return (
    <div className="flex h-screen" style={{ background: "var(--bg-color)" }}>
      {!esEncargado && (
        <Sidebar activeMenu={activeMenu} setActiveMenu={(menu) => {
          setActiveMenu(menu);
          setActiveTab(""); // reset tab al cambiar módulo
        }} />
      )}

      <main className="flex-1 flex flex-col overflow-auto p-7">
        <TopBar
          {...topBarProps}
          onLogout={logoutUser}
          search={<Search />}
          user={user}
        />

        <div className="mt-8">
          {activeMenu === "proyectos"   && <ProyectosView />}
          {activeMenu === "personal"    && <PersonalView   activeTab={activeTab} />}
          {activeMenu === "inventarios" && <InventariosView activeTab={activeTab} />}
          {activeMenu === "categorias"  && <CategoriasView  activeTab={activeTab} />}
          {activeMenu === "reportes" && <ReportesView />}
        </div>
      </main>
    </div>
  );
}
