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
    // Sin tarjeta propia: el Modal ya aporta el contenedor (fondo, borde,
    // sombra, padding) y su cabecera. Antes este componente dibujaba una
    // segunda tarjeta con borde/sombra y barras grises, lo que se veía como
    // "un modal dentro de otro". Ahora solo aporta el encabezado del
    // formulario, los campos y el pie de botones.
    <div className="w-full">
      {(title || description) && (
        <div className="mb-5">
          {title && <h2 className="text-base font-semibold text-gray-800">{title}</h2>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}

      <form onSubmit={onSubmit}>
        {/* Campos personalizados de cada área */}
        <div className="space-y-5">
          {children}
        </div>

        {/* Pie del formulario (botones de acción) */}
        <div className="pt-5 mt-5 border-t border-gray-200 flex justify-end gap-3">
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
