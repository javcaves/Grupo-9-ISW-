import React from 'react';
import { PROYECTOS_CONFIG } from '../../data/proyectosConfig';
import LayoutContent from '../../layouts/LayoutContent';
import { Card } from '../../components/Card';

export default function ProyectosView({ activeTab }) {
  const content = PROYECTOS_CONFIG.tabsContent[activeTab];
  const cards = content.cards || [];

  return (
    <LayoutContent
      header={{ title: content.title, subtitle: content.subtitle }}
      actions={content.actions}
      stats={
        <>
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={index} 
                hoverable={true}
                className="rounded-[28px] overflow-hidden relative min-h-[170px]"
                decorator={<div className="absolute top-[-20px] right-[-20px] w-[110px] h-[110px] rounded-full" style={{ backgroundColor: 'var(--card-decorator-bg)' }}></div>}
              >
                <div className="relative z-10 flex flex-col h-full">
                  <span style={{ color: 'var(--card-label-text)' }} className="font-semibold text-[1rem]">
                    {card.title}
                  </span>
                  <h2 className="text-[3rem] leading-none font-bold mt-5" style={{ color: 'var(--card-number-text)' }}>
                    {card.number}
                  </h2>
                  <div className="flex items-center gap-2 mt-5 text-sm" style={{ color: 'var(--card-detail-text)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--card-icon-wrapper-bg)', color: 'var(--card-icon-wrapper-text)' }}>
                      <Icon size={14} />
                    </div>
                    <span>{card.detail}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </>
      }
    />
  );
}