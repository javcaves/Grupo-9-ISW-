import React from 'react';
import { ADMIN_CONFIG } from '../../data/adminConfig';
import LayoutContent from '../../layouts/LayoutContent';

export default function PersonalView() {
  const { content } = ADMIN_CONFIG.personal;

  return (
    <LayoutContent 
      header={{ title: content.title, subtitle: content.subtitle }}
      actions={content.actions}
    />
  );
}