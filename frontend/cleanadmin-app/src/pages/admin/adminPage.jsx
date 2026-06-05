import React, { useState } from 'react';
import Sidebar from '../../components/sidebar';
import TopBar from '../../components/topBar';
import LayoutContent from '../../layouts/LayoutContent';

export default function Admin() {
  const [activeMenu, setActiveMenu] = useState('proyectos');
  const [activeTab, setActiveTab] = useState('Registro Personal');

  // Aquí centralizas la lógica de qué mostrar según el menú
  return (
    <div className="flex h-screen">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      <div className="flex-1 flex flex-col overflow-auto p-7">
        <TopBar 
          title="Gestión de Proyectos" 
          subtitle="Administra permisos y accesos"
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          tabs={[{label: 'Registro Personal'}, {label: 'Actividades'}]}
        />

        <LayoutContent 
          header={{ title: "Administración", subtitle: "Control total" }}
          actions={[ /* botones aquí */ ]}
          table={null}
        />
      </div>
    </div>
  );
}