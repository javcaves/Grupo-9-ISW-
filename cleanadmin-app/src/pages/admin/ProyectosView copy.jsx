import React, { useState, useEffect } from 'react';
import { PROYECTOS_CONFIG } from '../../data/proyectosConfig';
import LayoutContent from '../../layouts/LayoutContent';
import { Card } from '../../components/Card';
import { GestionTurnos } from '../../layouts/gestion_turno.jsx';

import CrearActividad from '../../components/modals/CrearActividad';
import ProgramarTarea from '../../components/modals/ProgramarTarea';
import AsignarTarea from '../../components/modals/AsignarTarea';

import { CategoriaService } from '../../api/categorias.service';
import { ActividadesService } from '../../api/actividades.service';
import { TareaService } from '../../api/tareas.service';
import { UsuarioService } from '../../api/usuario.service';

export default function ProyectosView({ activeTab }) {
  const [abrirActividad, setAbrirActividad] = useState(false);
  const [abrirProgramar, setAbrirProgramar] = useState(false);
  const [abrirAsignar, setAbrirAsignar] = useState(false);

  const [listaCategorias, setListaCategorias] = useState([]);
  const [listaActividades, setListaActividades] = useState([]);
  const [listaTareasPendientes, setListaTareasPendientes] = useState([]);
  const [listaEmpleados, setListaEmpleados] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      // 1. Cargar Categorías
      try {
        const resCat = await CategoriaService.listar();
        setListaCategorias(resCat.data || resCat || []);
      } catch (error) {
        console.error("Fallo al cargar Categorías:", error);
      }

      // 2. Cargar Actividades
      try {
        const resAct = await ActividadesService.listar();
        const dataActividades = resAct.data || resAct || [];
        setListaActividades(dataActividades);
        // INSPECCIONA ESTO EN TU CONSOLA (F12)
        console.log("ESTRUCTURA DE ACTIVIDADES:", dataActividades); 
      } catch (error) {
        console.error("Fallo al cargar Actividades:", error);
      }

      // 3. Cargar Tareas Pendientes
      try {
        const resTar = await TareaService.listar();
        const dataTareas = resTar.data || resTar || [];
        setListaTareasPendientes(dataTareas);
        console.log("ESTRUCTURA DE TAREAS:", dataTareas);
      } catch (error) {
        console.error("Fallo al cargar Tareas:", error);
      }

      // 4. Cargar Empleados
      try {
        const resEmp = await UsuarioService.listar();
        const dataEmpleados = resEmp.data || resEmp || [];
        setListaEmpleados(dataEmpleados);
        console.log("ESTRUCTURA DE EMPLEADOS:", dataEmpleados);
      } catch (error) {
        console.error("Fallo al cargar Empleados:", error);
      }
    };

    cargarDatos();
  }, []);

  const content = PROYECTOS_CONFIG.tabsContent[activeTab];
  const cards = content.cards || [];

  const accionesConLogica = content.actions?.map(action => {
    if (action.label === 'Crear Actividad Base' || action.text === 'Crear Actividad Base') {
      return { ...action, onClick: () => setAbrirActividad(true) };
    }
    if (action.label === 'Programar Tarea' || action.text === 'Programar Tarea') {
      return { ...action, onClick: () => setAbrirProgramar(true) };
    }
    if (action.label === 'Asignar Tarea' || action.text === 'Asignar Tarea') {
      return { ...action, onClick: () => setAbrirAsignar(true) };
    }
    return action;
  }) || [];

  return (
    <>
      <LayoutContent
        header={{ title: content.title, subtitle: content.subtitle }}
        actions={accionesConLogica}
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
        table={activeTab === 'Turno' ? <GestionTurnos /> : null}
      />
      <CrearActividad 
        isOpen={abrirActividad} 
        onClose={() => setAbrirActividad(false)} 
        categorias={listaCategorias} 
        actualizarLista={() => console.log('Actualizar tabla tras crear actividad')}
      />
      
      <ProgramarTarea 
        isOpen={abrirProgramar} 
        onClose={() => setAbrirProgramar(false)} 
        actividades={listaActividades} 
        actualizarLista={() => console.log('Actualizar tabla tras programar tarea')}
      />
      
      <AsignarTarea 
        isOpen={abrirAsignar} 
        onClose={() => setAbrirAsignar(false)}
        tareasPendientes={listaTareasPendientes}
        empleados={listaEmpleados}
        actualizarLista={() => console.log('Actualizar tabla tras asignar')}
      />
    </>
  );
}