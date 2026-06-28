import React, { useState, useEffect } from 'react';
import Modal from './Modal';

export default function TableModal({
    isOpen,
    onClose,
    mode,
    item,
    fields = [],
    onSave,
    onDelete,
    isLoading = false,
    title= "Gestion de registro"
}){
    const [formData, setFormData] = useState({});
    const [formData, setFormData] = useState({});

    //cargar data cuando se abre el modal
    useEffect(()=>{
        if (item && isOpen) {
            const initialData = {};
            fields.forEach(field => {
                initialData[field.key] = item[field.key] || '';
            });
            setFormData(initialData);
            setErrors({});
        }
    }, [item, isOpen, fields]);

    const handleChange = (key, value) => {
        setFormData(prev => ({...prev, [key]: value}));
        if (errors[key]){
            setErrors(prev => ({...prev, [key]: null}));
        }
    };

    const handleSubmit = () => {
        const newErrors = {};
        fields.forEach(field => {
            if(field.required && !formData[field.key]?.trim()){
                newErrors[field.key] =`El campo ${field.label} es obligatorio`;
            }
            if(field.validate){
                const error = field.validate(formData[field.key]);
                if (error) newErrors[field.key] = error;
            }
        });

        if(Object.keys(newErrors).length > 0){
            setErrors(newErrors);
            return;
        }

        onSave(formData);
    };

    const renderField = (field) => {
        const value = formData[field.key] || '';
        const error = errors[field.key];
        const baseClasses = `
            w-full
            px-4 py-3
            rounded-xl
            border
            transition-all
            duration-200
            bg-white
            text-slate-900
            outline-none
            focus:border-violet-500
            focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]
            ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200'}
        `;

        if(field.type == 'select'){
            return(
                <select
                value = {value}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className={baseClasses}
                >
                    <option value="">Seleccionar...</option>
                    {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );
        }
        if (field = 'textarea'){
            return(
                <texarea
                value = {value}
                onChange={(e) => handleChange(field.key, e.target.value)}
                rows={field.rows || 3}
                className={baseClasses}
                placeholder={field.placeholder}
                />
            );
        }

        return(
            <imput
                type={field.type || text}
                value = {value}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className={baseClasses}
                placeholder={field.placeholder}
            />
        );
    };

    //vista eliminacion
    if(mode == 'delete'){
        return(
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="confirmar eliminacion"
                size="sm"
                onConfirm={onDelete}
                confirmText={isLoading? "eliminando..." : "si, eliminar"}
                cancelText="cancelar"
                isLoading={isLoading}
            >
                <div className="text-center py-4">
                    <div className="
                        w-16 h-16
                        mx-auto mb-4
                        rounded-full
                        bg-red-100
                        flex items-center justify-center
                    ">
                        <i className="fas fa-trash-alt text-2xl text-red-600"></i>
                    </div>
                    <p className="text-slate-700 text-base">
                        ¿estas seguro de eliminar este registro?
                    </p>
                    {item && (
                        <p className="text-slate-900 font-semibold text-lg mt-2">
                            "{item.nombre || item.name || 'Sin nombre'}"
                        </p>
                    )}
                    <p className="text-slate-500 text-sm mt-4">
                        Esta acción no se puede deshacer.
                    </p>
                </div>
            </Modal>    
        );
    }

    if(mode == 'edit'){
        return(
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={title}
                size="dm"
                onConfirm={handleSubmit}
                confirmText={isLoading? "guardando..." : "guardar cambios"}
                cancelText="cancelar"
                isLoading={isLoading}
            >
               <div className="space-y-4 py-2">
                    {fields.map(field => (
                        <div key={field.key}>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                {field.label}
                                {field.required && (
                                    <span className="text-red-500 ml-1">*</span>
                                )}
                            </label>
                            {renderField(field)}
                            {errors[field.key] &&(
                                <p className="text-red-500 text-xs mt-1.5">
                                    <i className="fas fa-exclamation-circle mr-1"></i>
                                    {errors[field.key]}
                                </p>
                            )}
                        </div>
                    ))}
               </div>
            </Modal>    
        );
    }

    //vista visualizacion
    return(
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="dm"
            showFooter={false}
        >
            <div className="space-y-3 py-2">
                {fields.map(field =>(
                    <div key={field.key} className="flex items-start gap-4">
                        <span className="text-sm font-medium text-slate-500 w-1/3">
                            {field.label}
                        </span>
                        <span className="text-sm text-slate-900 w-2/3">
                            {item?.[field.key] || '-'}
                        </span>
                    </div>
                ))}
            </div>
        </Modal>
    );
}