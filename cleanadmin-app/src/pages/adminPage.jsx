import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Importación de configuraciones
import { ADMIN_CONFIG } from '../data/adminConfig';
import { PROYECTOS_CONFIG } from '../data/proyectosConfig';

// Importación de componentes base
import Sidebar from '../components/sidebar';
import TopBar from '../components/topBar';
import Search from '../components/search';

// Importación de vistas modulares
import ProyectosView from './admin/ProyectosView';
import PersonalView from './admin/PersonalView';
import InventariosView from './admin/InventariosView';
import CategoriasView from './admin/CategoriasView';

export default function AdminPage() {
  const { user, logoutUser } = useAuth();
  const [activeMenu, setActiveMenu] = useState('proyectos');
  const [activeTab, setActiveTab] = useState('Registro Personal');

  const currentConfig =
    (activeMenu === 'proyectos'
      ? PROYECTOS_CONFIG
      : ADMIN_CONFIG[activeMenu]) || {
      topBar: {},
      content: {}
    };

  return (
    <div
      className="flex h-screen"
      style={{
        background: 'var(--bg-color)'
      }}
    >
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <main className="flex-1 flex flex-col overflow-auto p-7">
        <TopBar
          {...currentConfig.topBar}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={logoutUser}
          search={<Search />}
          user={user}
        />

        <div className="mt-8">
          {activeMenu === 'proyectos' && (
            <ProyectosView
              activeTab={activeTab}
            />
          )}

          {activeMenu === 'personal' && <PersonalView />}

          {activeMenu === 'inventarios' && <InventariosView />}

          {activeMenu === 'categorias' && <CategoriasView />}
        </div>
      </main>
    </div>
  );
}