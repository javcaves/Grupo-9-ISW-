import React, {useState, useEffect} from "react";
import { Modal } from "../Modal";

export default function UserModal({
    isOpen,
    onClose,
    mode,
    user,
    onSave,
    loading = false,
    variant = 'center'
}) {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        rut: '',
        email: '',
        username: '',
        rol: '',
        numero: '',
        observacion: '',
        activo: true
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    //cargar datos cuando se abre el modal

    useEffect (() =>{
        if(user && isOpen){
            setFormData({
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                rut: user.rut || '',
                email: user.email || '',
                username: username || '',
                rol: user.rol || '',
                numero: user.numero || '',
                observacion: user.observacion || '',
                activo: user.activo !== undefined? user.activo : true
            });
        }
        setErrors({});
    },[user, isOpen]);

    const handleChange = (key, value) =>{
        setFormData(prev => ({...prev, [key] : value}));
        if(errors[key]){
            setErrors(prev => ({...prev, [key] : null}));
        }
    };

    const validateForm = () =>{
        const newErrors = {};

        if(!FormData.nombre?.trim()){
            newErrors.nombre = "el nombre es un campo obligatorio"
        }
        if(!FormData.apellido?.trim()){
            newErrors.apellido = "el apellido es un campo obligatorio"
        }
        if(!FormData.email?.trim()){
            newErrors.email = "el email es un campo obligatorio"
        }
        if (!formData.email?.includes('@')) {
            newErrors.email = 'el email no es válido';
        }
        if (!formData.rol) {
            newErrors.rol = 'el rol es obligatorio';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () =>{
        if (!validateForm()) return;
        onSave(formData);
    }

    if(mode === 'view'){
        return(
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Detalles del Usuario"
                variant={variant}
            >
                <div className="space-y-4 py-2">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                            {user?.nombre?.[0]}{user?.apellido?.[0]}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border-b border-gray-100 pb-2">
                            <span className="text-xs text-gray-500 block">Nombre</span>
                            <span className="text-sm text-gray-900 font-medium">{user?.nombre || '-'}</span>
                        </div>
                        <div className="border-b border-gray-100 pb-2">
                            <span className="text-xs text-gray-500 block">RUT</span>
                            <span className="text-sm text-gray-900 font-medium">{user?.rut || '-'}</span>
                        </div>
                        <div className="border-b border-gray-100 pb-2">
                            <span className="text-xs text-gray-500 block">Email</span>
                            <span className="text-sm text-gray-900 font-medium">{user?.email || '-'}</span>
                        </div>
                        <div className="border-b border-gray-100 pb-2">
                            <span className="text-xs text-gray-500 block">Username</span>
                            <span className="text-sm text-gray-900 font-medium">{user?.username || '-'}</span>
                        </div>
                        <div className="border-b border-gray-100 pb-2">
                            <span className="text-xs text-gray-500 block">Rol</span>
                            <span className="text-sm text-gray-900 font-medium">
                                <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs">
                                    {user?.rol || 'SIN_ASIGNAR'}
                                </span>
                            </span>
                        </div>
                        <div className="border-b border-gray-100 pb-2">
                            <span className="text-xs text-gray-500 block">Teléfono</span>
                            <span className="text-sm text-gray-900 font-medium">{user?.numero || '-'}</span>
                        </div>
                        <div className="border-b border-gray-100 pb-2">
                            <span className="text-xs text-gray-500 block">Estado</span>
                            <span className="text-sm text-gray-900 font-medium">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${user?.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {user?.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </span>
                        </div>
                    </div>
                    {user?.observacion && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs text-gray-500 block">Observación</span>
                            <p className="text-sm text-gray-700">{user.observacion}</p>
                        </div>
                    )}
                </div>
            </Modal>
        );
    }

    return(
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalles del Usuario"
            variant={variant}
        >
            <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
                {/*nombre y apellido*/}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            type= "text"
                            value={formData.nombre}
                            onChange={(e)=> handleChange('nombre', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-lg border transition-all bg-white text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="ingresa el nombre"
                        />
                        {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Apellido <span className="text-red-500">*</span>
                        </label>
                    <input
                        type= "text"
                        value={formData.apellido}
                        onChange={(e)=> handleChange('apellido', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border transition-all bg-white text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="ingresa el apellido"
                    />
                        {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>}
                    </div>
                </div>

                {/*rut solo lectura*/}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            RUT
                        </label>
                        <input
                            type="text"
                            value={formData.rut}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                            disabled
                        />
                        <p className="text-xs text-gray-400 mt-1">El RUT no se puede modificar</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-lg border transition-all bg-white text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="usuario@empresa.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                </div>
                {/*username y rol solo lectura */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Username
                        </label>
                        <input
                            type="username"
                            value={formData.username}
                            onChange={(e) => handleChange('username', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                            disabled
                        />
                        <p className="text-xs text-gray-400 mt-1">El username no se puede modificar</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Rol <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.rol}
                            onChange={(e) => handleChange('rol', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-lg border transition-all bg-white text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 ${errors.rol ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            <option value="">Seleccionar rol...</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPERVISOR">Supervisor</option>
                            <option value="ENCARGADO">Encargado</option>
                            <option value="EMPLEADO">Empleado</option>
                        </select>
                        {errors.rol && <p className="text-red-500 text-xs mt-1">{errors.rol}</p>}
                    </div>
                </div>
                {/* telefono */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                    <input
                        type="text"
                        value={formData.numero}
                        onChange={(e) => handleChange('numero', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 transition-all bg-white text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                        placeholder="+56912345678"
                    />
                </div>
                {/*observacion */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Observación</label>
                    <textarea
                        value={formData.observacion}
                        onChange={(e) => handleChange('observacion', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 transition-all bg-white text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 resize-none"
                        placeholder="notas adicionales sobre el usuario..."
                    />
                </div>
                {/*estado: activo false, true*/}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked= {formData.activo === true}
                                onChange={() => handleChange('activo', true)}
                                className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                            />
                             <span className="text-sm text-gray-700">Activo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked= {formData.activo === false}
                                onChange={() => handleChange('activo', false)}
                                className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                            />
                             <span className="text-sm text-gray-700">Inactivo</span>
                        </label>
                    </div>
                </div>
                {/*botones */}
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-medium disabled:opacity-50"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`
                            px-5 py-2 rounded-lg text-white font-medium transition-all shadow-lg flex items-center gap-2
                            ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600'
                            }
                        `}
                        disabled={loading}
                    >
                        {loading && <i className="fas fa-spinner fa-spin"></i>}
                        {loading ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

