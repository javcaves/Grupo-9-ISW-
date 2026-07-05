import React, { useState } from 'react';
import { Modal } from '../Modal';
import { FormContainer } from '../Formulario';
import { CategoriaService } from '../../api/categorias.service';

export default function NuevaCategoria({ isOpen, onClose, actualizarLista }) {
    const [formData, setFormData] = useState({ nombre: '', descripcion: '', requiereCertificacion: 'false' });
    
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await CategoriaService.crear({
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                requiere_calificacion: formData.requiereCertificacion === 'true'
            });
        alert("¡Categoría creada con éxito!");
        actualizarLista(); 
        onClose();
        setFormData({ nombre: '', descripcion: '', requiereCertificacion: 'false' });
        } catch (error) {
            console.error("Error de conexión:", error);
            alert(`No se pudo guardar la categoría:\n\n${error.message}`);
        }
    };

    return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestión de Categorías">
        <FormContainer
            title="Crear Nueva Categoría"
            description="Añade una nueva clasificación para las tareas de limpieza."
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitText="Guardar Categoría"
            cancelText="Cancelar">
        <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"></textarea>
        </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requisito de Certificación</label>
                <select name="requiereCertificacion" value={formData.requiereCertificacion} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="false">No requiere</option>
                <option value="true">Sí requiere</option>
                </select>
            </div>
        </div>
        </FormContainer>
        </Modal>
    );
}