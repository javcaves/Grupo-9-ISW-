import React from "react";

export const Table = ({
    columns,
    data,
    onRowClick,
    onEdit,
    onDelete,
    emptyMessage = "no hay datos disponibles",
    className = ""
}) => {
    const handleEdit = (e, item) =>{
        e.stopPropagation();
        if (onEdit) onEdit(item);
    };
    const handleDelete = (e, item) =>{
        e.stopPropagation();
        if (onDelete) onDelete(item);
    };

    return(
        <div className ={`
            bg-white/80
            backdrop-blur-xl
            rounded-2xl
            border border-white/40
            shadow-[0_10px_30px_rgba(15,23,42,0.06)]
            overflow-hidden
            transition-all
            duration-300
            ${className}
        `}>
            {/*tabla */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* header de la tabla */}
                    <thead>
                        <tr className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50/80 to-white/50">
                            {columns.map((col, idx) => (
                                <th
                                key={idx}
                                className={`
                                    text-left py-4 px-5
                                    text-sm font-semibold text-slate-600
                                    ${col.width ? `w-[${col.width}]` : ''}
                                    ${col.className || ''}
                                    `}
                                >
                                    {col.icon && <i className={`fas ${col.icon} mr-2 text-violet-500`}></i>}
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>  
                    {/*body de tabla*/}
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length}
                                    className="text-center py-12 text-slate-400"
                                >
                                <i className="fas fa-inbox text-4xl mb-3 block"></i>
                                <p>{emptyMessage}</p>
                                </td>
                            </tr>
                        ) : (
                            data.map((item, idx) =>(
                                <tr
                                    key={idx}
                                    onClick={() => onRowClick && onRowClick(item)}
                                    className={`
                                        border-b border-slate-100/50
                                        transition-all duration-200
                                        ${onRowClick ? 'cursor-pointer hover:bg-violet-50/30' : ''}
                                        hover:translate-x-0.5
                                    `}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className="py-3.5 px-5 text-sm text-slate-700"
                                        >
                                            {col.key === 'actions' ? (
                                                <div className="flex items-center gap-2">
                                                    {onEdit && (
                                                        <button
                                                            onClick={(e) =>handleEdit(e, item)}
                                                            className="
                                                                p-2
                                                                rounded-xl
                                                                text-slate-500
                                                                hover:bg-violet-100
                                                                hover:text-violet-600
                                                                transition-all
                                                                duration-200
                                                            "
                                                        >
                                                            <i className="fas fa-edit text-sm"></i>
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={(e) =>handleDelete(e, item)}
                                                            className="
                                                                p-2
                                                                rounded-xl
                                                                text-slate-500
                                                                hover:bg-red-100
                                                                hover:text-red-600
                                                                transition-all
                                                                duration-200
                                                            "
                                                        >
                                                            <i className="fas fa-trash-alt text-sm"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            ) : col.render ? (
                                                col.render(item[col.key], item)
                                            ) : (
                                                <span className={col.cellClassName}>
                                                    {item[col.key]}
                                                </span>
                                            )}
                                        </td>    
                                    ))}
                                </tr>   
                            )
                        )
                    )}

                    </tbody>
                </table>
            </div>
        </div>
    );
}