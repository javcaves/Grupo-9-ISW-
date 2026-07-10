import React from 'react';

export default function Sidebar({ activeMenu, setActiveMenu }) {
    const menuItems = [
        { id: 'proyectos', label: 'Proyectos', icon: 'fa-user-friends' },
        { id: 'personal', label: 'Personal', icon: 'fa-user-shield' },
        { id: 'inventarios', label: 'Inventarios', icon: 'fa-box-open' },
        { id: 'categorias', label: 'Categorías', icon: 'fa-tags' },
        { id: 'reportes', label: 'Reportes', icon: 'fa-chart-line' }
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
    <div className="relative z-10 flex flex-col items-center pt-2 pb-5 mb-1 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <img 
            src="/logo_grande.png" 
            alt="CleanAdmin" 
            className="h-25 w-auto object-contain drop-shadow-sm"
        />
    </div>

    {/* Título de Sección */}
    <div className="relative z-10 text-[0.78rem] tracking-[2px] uppercase px-2.5 mt-1 mb-1" style={{ color: 'var(--sidebar-text-label)' }}>
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