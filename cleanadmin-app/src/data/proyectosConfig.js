// src/data/proyectosConfig.js

import {
  FaUsers,
  FaClipboardCheck,
  FaBoxesStacked,
  FaClock,
  FaUserShield,
  FaUserCheck,
  FaUserXmark,
  FaCalendarCheck,
  FaScrewdriverWrench,
  FaListCheck,
  FaTriangleExclamation,
  FaTruckRampBox,
  FaWarehouse,
  FaBarcode,
  FaBed
} from 'react-icons/fa6';

export const PROYECTOS_CONFIG = {
  topBar: {
    title: "Hospital Las Higueras",
    subtitle: "Gestión operativa y asignación de trabajos diarios",

    tabs: [
      { label: 'Registro Personal' },
      { label: 'Actividades' },
      { label: 'Inventario' },
      { label: 'Turno' }
    ]
  },

  tabsContent: {

    // =========================================================
    // REGISTRO PERSONAL
    // =========================================================
    'Registro Personal': {
      title: "Registro de Proyectos",
      subtitle: "Datos personales asociados",

      cards: [
        {
          title: "Personal Registrado",
          number: 24,
          icon: FaUsers,
          detail: "+12% este mes"
        },
        {
          title: "Supervisores Activos",
          number: 6,
          icon: FaUserShield,
          detail: "Cobertura operativa estable"
        },
        {
          title: "Personal Disponible",
          number: 19,
          icon: FaUserCheck,
          detail: "Turnos correctamente asignados"
        },
        {
          title: "Usuarios Inactivos",
          number: 3,
          icon: FaUserXmark,
          detail: "Pendientes de revisión"
        }
      ],

      actions: [
        {
          text: "Nuevo Registro",
          className: "bg-violet-600 text-white"
        }
      ]
    },

    // =========================================================
    // ACTIVIDADES
    // =========================================================
    'Actividades': {
      title: "Actividades del Proyecto",
      subtitle: "Seguimiento de tareas",

      cards: [
        {
          title: "Actividades Activas",
          number: 18,
          icon: FaClipboardCheck,
          detail: "6 pendientes revisión"
        },
        {
          title: "Tareas Programadas",
          number: 12,
          icon: FaCalendarCheck,
          detail: "Agenda semanal completa"
        },
        {
          title: "Mantenimientos",
          number: 7,
          icon: FaScrewdriverWrench,
          detail: "2 críticos priorizados"
        },
        {
          title: "Procesos Finalizados",
          number: 31,
          icon: FaListCheck,
          detail: "Cumplimiento operativo alto"
        }
      ],

      actions: [
        {
          text: "Crear Actividad Base",
          className: "bg-indigo-600 text-white",
          modal: 'actividadBase'
        },
        {
          text: "Programar Tarea",
          className: "bg-indigo-600 text-white",
          modal: 'programarTarea'
        },
        {
          text: "Asignar Tarea",
          className: "bg-indigo-600 text-white",
          modal: 'asignarTarea'
        }
      ]
    },

    // =========================================================
    // INVENTARIO
    // =========================================================
    'Inventario': {
      title: "Inventario del Proyecto",
      subtitle: "Stock de materiales asignados",

      cards: [
        {
          title: "Materiales en Stock",
          number: 142,
          icon: FaBoxesStacked,
          detail: "Inventario actualizado"
        },
        {
          title: "Productos Críticos",
          number: 5,
          icon: FaTriangleExclamation,
          detail: "Reposición requerida"
        },
        {
          title: "Órdenes Recepcionadas",
          number: 27,
          icon: FaTruckRampBox,
          detail: "Entrega operativa estable"
        },
        {
          title: "Bodega Principal",
          number: 3,
          icon: FaWarehouse,
          detail: "Áreas sincronizadas"
        }
      ],

      actions: []
    },

    // =========================================================
    // TURNO
    // =========================================================
    'Turno': {
      title: "Gestión de Turnos",
      subtitle: "Asignación horaria del personal",

      cards: [
        {
          title: "Turnos Programados",
          number: 9,
          icon: FaClock,
          detail: "Cobertura operativa completa"
        },
        {
          title: "Turnos Nocturnos",
          number: 4,
          icon: FaBed,
          detail: "Supervisión activa"
        },
        {
          title: "Asistencia Registrada",
          number: 21,
          icon: FaBarcode,
          detail: "Control actualizado"
        },
        {
          title: "Horas Extra",
          number: 13,
          icon: FaClock,
          detail: "Aumento respecto al mes pasado"
        }
      ],

      actions: []
    }
  }
};