import React from 'react';
import { ADMIN_CONFIG } from '../../data/adminConfig';
import LayoutContent from '../../layouts/LayoutContent';

export default function CategoriasView() {
  const { content } = ADMIN_CONFIG.categorias;

  return (
    <LayoutContent 
      header={{ title: content.title, subtitle: content.subtitle }}
      actions={content.actions}
    />
  );
}