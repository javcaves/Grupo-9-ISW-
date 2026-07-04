import React, { useState } from 'react';
import { ADMIN_CONFIG } from '../../data/adminConfig';
import LayoutContent from '../../layouts/LayoutContent';
import CrearItemModal from '../../components/modals/CrearItemModal';

export default function InventariosView() {
  const { content } = ADMIN_CONFIG.inventarios;
  const [modalItemAbierto, setModalItemAbierto] = useState(false);

  // adminConfig solo trae texto/clase (estático); el onClick real se
  // conecta acá, sin modificar la config compartida por las otras vistas.
  const acciones = content.actions.map((accion) => {
    if (accion.text === 'Añadir Item') {
      return { ...accion, onClick: () => setModalItemAbierto(true) };
    }
    return accion;
  });

  return (
    <>
      <LayoutContent
        header={{ title: content.title, subtitle: content.subtitle }}
        actions={acciones}
      />

      <CrearItemModal
        isOpen={modalItemAbierto}
        onClose={() => setModalItemAbierto(false)}
      />
    </>
  );
}
