import React from 'react';
import { ADMIN_CONFIG } from '../../data/adminConfig';
import LayoutContent from '../../layouts/LayoutContent';

export default function InventariosView() {
  const { content } = ADMIN_CONFIG.inventarios;
  return (
    <LayoutContent
      header={{ title: content.title, subtitle: content.subtitle }}
      actions={content.actions}
    />

  );

} 