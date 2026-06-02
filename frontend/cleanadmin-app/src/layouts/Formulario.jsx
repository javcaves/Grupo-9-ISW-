import React from 'react';

export const FormContainer = ({
  title,
  description,
  onSubmit,
  onCancel,
  submitText = 'Guardar Cambios',
  cancelText = 'Cancelar',
  children
}) => {
  return (
    <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Cabecera del Formulario */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {/* Cuerpo y Lógica del Formulario */}
      <form onSubmit={onSubmit}>
        {/* Aquí se inyectan los campos personalizados de cada área */}
        <div className="p-6 space-y-5">
          {children}
        </div>

        {/* Pie del formulario (Botones de Acción) */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              {cancelText}
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {submitText}
          </button>
        </div>
      </form>
    </div>
  );
};