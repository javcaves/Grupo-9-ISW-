import React, { useState } from 'react';
import Sidebar from '../../components/sidebar'; 
import TopBar from '../../components/topBar';
import Search from '../../components/search';

export default function AdminPage({ children }) {

    const [activeMenu, setActiveMenu] = useState('proyectos');
    const [activeTab, setActiveTab] = useState('Registro Personal');
    const [searchValue, setSearchValue] = useState('');

  // Lógica dinámica
    const getHeaderContent = () => {
        switch(activeMenu) {
            case 'proyectos':
                return {
                title: "Hospital Las Higueras",
                subtitle: "Gestión operativa y asignación de trabajos diarios",
                // Solo Proyectos tiene estas pestañas
                tabs: [
                    { label: 'Registro Personal' },
                    { label: 'Actividades' },
                    { label: 'Inventario' },
                    { label: 'Turno' }
                ]
                };
            case 'categorias':
                return {
                title: "Categorías",
                subtitle: "Gestión del catálogo global de operaciones e higiene",
                tabs: [] // Array vacío para que desaparezcan las pestañas
                };
            case 'personal':
                return {
                title: "Gestión de Personal",
                subtitle: "Administración global de usuarios y roles",
                tabs: []
                };
            case 'inventarios':
                return {
                title: "Gestión de Inventario",
                subtitle: "Administración global de inventario",
                tabs: []
                };
            case 'reportes':
                return {
                title: "Gestión de Reportes",
                subtitle: "Administración global de reportes",
                tabs: []
                };
            case 'configuracion':
                return {
                title: "Gestión de Configuraciones",
                subtitle: "Administración global de configuraciones",
                tabs: []
                };
        }
    };

    const currentHeader = getHeaderContent();

    const handleSearch = (query) => {
        console.log(" Buscando en BD el término:", query);
    };

    return (
    <div className="flex h-screen w-full overflow-hidden relative text-slate-900 bg-slate-50">

        <div 
            className="absolute inset-0 z-0 pointer-events-none" 
            style={{
            background: `radial-gradient(circle at top left, rgba(124,58,237,0.10), transparent 25%),
                        radial-gradient(circle at bottom right, rgba(59,130,246,0.08), transparent 20%),
                        linear-gradient(135deg,#f8fafc,#eef2ff,#f1f5f9)`
            }}>
        </div>

    {/* SIDEBAR */}
    <div className="z-10 h-full flex-shrink-0">
        <Sidebar 
            activeMenu={activeMenu} 
            setActiveMenu={setActiveMenu} />
    </div>

    {/* CONTENIDO PRINCIPAL */}
    <main className="flex-1 flex flex-col p-8 overflow-y-auto z-10 relative">
        
        {/* TOPBAR */}
        <TopBar 
            title={currentHeader.title}
            subtitle={currentHeader.subtitle}
            tabs={currentHeader.tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={() => console.log("Cerrar Sesión")}
            
            /* Search */
            search={
                <Search 
                placeholder={`Buscar en ${currentHeader.title.toLowerCase()}...`}
                value={searchValue}
                onChange={setSearchValue}
                onSearch={handleSearch}/>
            }

            userIcon={
                <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold shadow-sm cursor-pointer">
                CB
                </div>
            }
        />

    {/* ESPACIO PARA EL CONTENIDO CENTRAL*/}
        <div className="mt-8 flex-1">
            {children || (
                <div className="p-8 rounded-3xl bg-white/70 border border-slate-900/5 shadow-xl backdrop-blur-xl h-full     border-dashed border-2 border-slate-300 flex items-center justify-center text-slate-400">
                <p>Aquí irá el contenido central dinámico de <strong>{activeMenu}</strong>.</p>
                </div>
            )}
        </div>

        </main>
    </div>
    );
}