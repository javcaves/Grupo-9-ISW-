import React, { useState } from 'react';
import { ADMIN_CONFIG } from '../../data/adminConfig';
import LayoutContent from '../../layouts/LayoutContent';
import NuevaCategoria from '../../components/modals/NuevaCategoria';

export default function CategoriasView() {
  const [abrirModalCategoria, setAbrirModalCategoria] = useState(false);
  const { content } = ADMIN_CONFIG.categorias;

  const accionesConLogica = content.actions.map(action => {
    if (action.label === 'Nueva Categoría' || action.text === 'Nueva Categoría') {
      return { 
        ...action, 
        onClick: () => setAbrirModalCategoria(true)
      };
    }
    return action;
  });

  return (
    <>
    <LayoutContent 
      header={{ title: content.title, subtitle: content.subtitle }}
      actions={accionesConLogica}/>
      
    <NuevaCategoria 
        isOpen={abrirModalCategoria} 
        onClose={() => setAbrirModalCategoria(false)} 
        actualizarLista={() => console.log('Llamar API GET')}
      />
    </> 
  );
}