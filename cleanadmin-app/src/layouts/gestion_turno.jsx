import React, { useState } from 'react';
import { Modal } from '../components/Modal.jsx';
import { FormularioTurno } from './form_turno.jsx';
import { TurnoCard } from './turnoCard.jsx';

// gestion_turno.jsx
export const GestionTurnos = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4">
      <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition duration-200">
        + Crear Nuevo Turno
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Configurar Nuevo Turno" variant="wide">
        {/* Le pasas el callback para cerrar el modal al guardar */}
        <FormularioTurno onSuccess={() => setIsOpen(false)} />
      </Modal>
    </div>
  );
};