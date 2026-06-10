import React from 'react';

export default function Sidebar({ activeMenu, setActiveMenu }) {
    const menuItems = [
        { id: 'proyectos', label: 'Proyectos', icon: 'fa-user-friends' },
        { id: 'personal', label: 'Personal', icon: 'fa-user-shield' },
        { id: 'inventarios', label: 'Inventarios', icon: 'fa-box-open' },
        { id: 'categorias', label: 'Categorías', icon: 'fa-tags' },
        { id: 'reportes', label: 'Reportes', icon: 'fa-chart-line' },
        { id: 'configuracion', label: 'Configuración', icon: 'fa-gear' }
    ];

    return (
        <aside 
            className="w-[280px] h-screen p-6 flex flex-col gap-[14px] relative overflow-hidden backdrop-blur-xl flex-shrink-0 border-r"
            style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)', boxShadow: 'var(--sidebar-shadow-main)' }}
        >
            {/* Resplandor de fondo superior */}
            <div 
                className="absolute inset-0 pointer-events-none" 
                style={{ background: 'var(--sidebar-grad-overlay)' }}
            ></div>

            {/* Tarjeta de Marca (Brand) */}
            <div 
                className="relative z-10 flex items-center gap-[14px] p-[14px_16px] rounded-[20px] mb-6 border"
                style={{ backgroundColor: 'var(--sidebar-bg-brand)', borderColor: 'var(--sidebar-border)', boxShadow: 'var(--sidebar-shadow-brand)' }}
            >
                <div 
                    className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-white text-[1.2rem]"
                    style={{ background: 'var(--sidebar-grad-brand)', boxShadow: 'var(--sidebar-shadow-icon)' }}
                >
                    <i className="fas fa-layer-group"></i>
                </div>
                <div>
                    <h2 className="text-[1.1rem] font-bold mb-1" style={{ color: 'var(--sidebar-text-primary)' }}>CleanAdmin</h2>
                    <span className="text-[0.82rem]" style={{ color: 'var(--sidebar-text-secondary)' }}>Enterprise Panel</span>
                </div>
            </div>

            {/* Título de Sección */}
            <div className="relative z-10 text-[0.78rem] tracking-[2px] uppercase px-2.5 mt-2 mb-1" style={{ color: 'var(--sidebar-text-label)' }}>
                Administración
            </div>

            {/* Items del Menú Dinámicos */}
            {menuItems.map((item) => {
                const isActive = activeMenu === item.id;
                return (
                    <div
                        key={item.id}
                        onClick={() => setActiveMenu && setActiveMenu(item.id)}
                        className={`relative z-10 flex items-center gap-[14px] p-[15px_18px] rounded-[18px] font-medium cursor-pointer transition-all duration-300 border ${isActive ? '' : 'border-transparent hover:translate-x-1'}`}
                        style={{
                            color: isActive ? 'var(--sidebar-text-primary)' : 'var(--sidebar-text-menu)',
                            background: isActive ? 'var(--sidebar-grad-active)' : 'transparent',
                            borderColor: isActive ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                            boxShadow: isActive ? 'var(--sidebar-shadow-active)' : 'none'
                        }}
                    >
                        {/* Indicador brillante de pestaña activa */}
                        {isActive && (
                            <div 
                                className="absolute left-[-1px] top-[12px] bottom-[12px] w-[4px] rounded-full"
                                style={{ backgroundColor: 'var(--sidebar-accent-color)', boxShadow: 'var(--sidebar-glow-active)' }}
                            ></div>
                        )}
                        
                        <i className={`fas ${item.icon} w-[20px] text-center text-[1rem]`}></i>
                        <span>{item.label}</span>
                    </div>
                );
            })}
        </aside>
    );
}