import React, { useState } from 'react';
import { Modal } from './Modal.jsx';
import { FormularioTurno } from './form_turno.jsx';

export const GestionTurnos = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Variables específicas de la categoría de Turnos
  const [nombreTurno, setNombreTurno] = useState('');
  const [horaIngreso, setHoraIngreso] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Guardando en API /turnos:', { nombreTurno, horaIngreso });
    setIsOpen(false);
  };

  return (
    <div className="p-4">
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition duration-200"
      >
        + Crear Nuevo Turno
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Configurar Nuevo Turno"
        variant="side">

        <FormularioTurno />

      </Modal>
    </div>
  );
};