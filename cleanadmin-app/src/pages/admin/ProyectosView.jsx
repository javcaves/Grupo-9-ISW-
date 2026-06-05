import React from 'react';

import { PROYECTOS_CONFIG } from '../../data/proyectosConfig';

import LayoutContent from '../../layouts/LayoutContent';
import { Card } from '../../components/Card';

export default function ProyectosView({ activeTab }) {

  // CONTENIDO DE LA TAB ACTIVA
  const content = PROYECTOS_CONFIG.tabsContent[activeTab];

  // TARJETAS DE LA TAB ACTIVA
  const cards = content.cards || [];

  return (
    <LayoutContent
      header={{
        title: content.title,
        subtitle: content.subtitle
      }}

      actions={content.actions}

      stats={
        <>
          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <Card
                key={index}
                className="
                  rounded-[28px]
                  overflow-hidden
                  relative
                  border border-slate-200/50
                  min-h-[170px]
                "
                hoverable={true}
              >
                {/* CÍRCULO DECORATIVO */}
                <div
                  className="
                    absolute
                    top-[-20px]
                    right-[-20px]
                    w-[110px]
                    h-[110px]
                    rounded-full
                    bg-violet-500/10
                  "
                ></div>

                <div className="relative z-10 flex flex-col h-full">

                  {/* TÍTULO */}
                  <span
                    className="
                      text-slate-500
                      font-semibold
                      text-[1rem]
                    "
                  >
                    {card.title}
                  </span>

                  {/* NÚMERO */}
                  <h2
                    className="
                      text-[3rem]
                      leading-none
                      font-bold
                      text-slate-900
                      mt-5
                    "
                  >
                    {card.number}
                  </h2>

                  {/* DETALLE */}
                  <div
                    className="
                      flex items-center gap-2
                      mt-5
                      text-slate-500
                      text-sm
                    "
                  >
                    <div
                      className="
                        w-8 h-8
                        rounded-lg
                        bg-violet-500/10
                        flex items-center justify-center
                        text-violet-600
                      "
                    >
                      <Icon size={14} />
                    </div>

                    <span>
                      {card.detail}
                    </span>
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