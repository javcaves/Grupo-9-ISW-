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
    <aside className="
        w-[280px]
        h-screen
        bg-white/75
        border-r border-slate-900/5
        shadow-[10px_0_30px_rgba(15,23,42,0.04)]
        px-[18px] py-[24px]
        flex
        flex-col
        gap-[14px]
        relative
        overflow-hidden
        backdrop-blur-[14px]
        flex-shrink-0">
      {/* Resplandor de fondo superior (Gradient Overlay) */}
    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(124,58,237,0.08),transparent)]"></div>

      {/* Tarjeta de Marca (Brand) */}
    <div className="
        relative z-10
        flex items-center gap-[14px]
        p-[14px_16px]
        rounded-[20px]
        bg-white/80
        border border-slate-900/5
        shadow-[0_8px_24px_rgba(15,23,42,0.05)]
        mb-[10px]">
            <div className="
                w-[52px] h-[52px]
                rounded-[16px]
                bg-gradient-to-br from-violet-600 to-blue-500
                flex items-center justify-center
                text-white text-[1.2rem]
                shadow-[0_10px_20px_rgba(124,58,237,0.25)]">
                <i className="fas fa-layer-group"></i>
            </div>
        <div>
            <h2 className="text-[1.1rem] font-bold text-slate-900 mb-1">CleanAdmin</h2>
            <span className="text-slate-500 text-[0.82rem]">Enterprise Panel</span>
        </div>
    </div>

      {/* Título de Sección */}
    <div className="relative z-10 text-slate-400 
    text-[0.78rem] tracking-[2px] uppercase px-[10px] mt-[8px]">
        Administración
    </div>

      {/* Items del Menú Dinámicos */}
    {menuItems.map((item) => {
        const isActive = activeMenu === item.id;

        return (
            <div
            key={item.id}
            onClick={() => setActiveMenu && setActiveMenu(item.id)}
            className={`
                relative z-10
                flex items-center gap-[14px]
                px-[18px] py-[15px]
                rounded-[16px]
                font-medium
                cursor-pointer
                transition-all duration-300
                ${isActive
                ? `
                    bg-gradient-to-br from-violet-600/15 to-blue-500/10
                    border border-violet-600/10
                    text-slate-900
                    shadow-[0_10px_24px_rgba(124,58,237,0.08)]
                `
                : `
                    border border-transparent
                    text-slate-700
                    hover:bg-violet-600/10
                    hover:translate-x-1
                `
                }
            `}
            >
            {/* Indicador brillante de pestaña activa */}
            {isActive && (
                <div className="
                    absolute left-[-1px] top-[12px] bottom-[12px] w-[4px]
                    rounded-full bg-violet-400
                    shadow-[0_0_10px_rgba(167,139,250,0.8)]"></div>
            )}
            
            <i className={`fas ${item.icon} w-[20px] text-center text-[1rem]`}></i>
            <span>{item.label}</span>
            </div>
            );
        })}
    </aside>
    );
}