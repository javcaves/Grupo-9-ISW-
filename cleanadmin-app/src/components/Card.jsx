import React from "react";

export const Card = ({
    children,
    title,
    subtitle,
    icon,
    className = "",
    hoverable = true,
    headerAction = null
}) => {
    return(
        <div className = {`
            bg-white/80
            backdrop-blur-xl
            
            border border-white/40
            shadow-[0_10px_30px_rgba(15,23,42,0.06)]
            transition-all
            duration-300
            ${hoverable ? 'hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)] hover:-translate-y-1' : ''}
            ${className}
        `}>

            {/*HEADER OPCIONAL*/}
            {(title || subtitle || icon || headerAction) && (
                <div className="flex items-center justify-between p-5 border-b border-slate-200/50">
                    
                        {icon && (
                            <div className="
                                w-10 h-10
                                rounded-xl
                                bg-gradient-to-br from-violet-500/15 to-blue-500/10
                                flex items-center justify-center
                                text-violet-600
                            ">
                                <i className={`fas ${icon} text-lg`}></i>
                            </div>
                        )}
                    <div>
                        {title &&(
                           <h3 className="ext-lg font-semibold text-slate-900" >
                                {title}
                           </h3>
                        )}
                        {subtitle &&(
                           <p className="text-sm text-slate-500 mt-0.5" >
                                {subtitle}
                           </p>
                        )}
                    </div>
                
                {headerAction &&(
                    <div className="flex items-center gap-2">
                        {headerAction}
                    </div>
                )}
                </div>
            )}
            {/* CONTENIDO DE LA TARJETA */}
            <div className="p-5">
                {children}
            </div>
        </div>  
    );
}