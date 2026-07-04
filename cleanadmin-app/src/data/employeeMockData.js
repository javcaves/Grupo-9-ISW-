// src/data/employeeMockData.js

export const employeeData = {

  // ==========================================
  // INICIO
  // ==========================================

  dashboard: {

    employee: {
      id: 1,
      name: "Carlos Bustos",
      initials: "CB",
      role: "Operador",
    },

    shift: {
      type: "Mañana",
      start: "08:00",
      end: "17:00",
      status: "En Curso",
    },

    today: {
      attendanceRegistered: true,
      checkIn: "07:58",
      expectedCheckOut: "17:00",
    },

    lunch: {
      start: "12:30",
      end: "13:00",
    },

    tasks: {
      assigned: 10,
      completed: 8,
      progress: 80,
    },

    nextProject: {
      id: 1,
      name: "Edificio Central",
      areas: [
        "Piso 2",
        "Piso 3",
      ],
    },

    notifications: [
      {
        id: 1,
        type: "task",
        message: "Nueva tarea asignada",
        createdAt: "2026-06-13 08:30",
      },
      {
        id: 2,
        type: "shift",
        message: "Cambio de horario de colación",
        createdAt: "2026-06-13 10:15",
      },
    ],
  },

  // ==========================================
  // ASISTENCIA
  // ==========================================

  attendance: {

    currentShift: {
      start: "08:00",
      end: "17:00",
      status: "En Curso",
    },

    currentRecord: {
      checkIn: "07:58",
      checkOut: null,
    },

    lunch: {
      started: false,
      startTime: null,
      endTime: null,
    },

    qrEnabled: true,

    corrections: [
      {
        id: 1,
        date: "2026-05-05",
        reason: "Olvidé marcar entrada",
        status: "Aprobada",
      },
      {
        id: 2,
        date: "2026-05-15",
        reason: "Error en registro de salida",
        status: "Rechazada",
      },
    ],
  },

  // ==========================================
  // TAREAS
  // ==========================================

  tasks: {

    summary: {
      assigned: 10,
      completed: 8,
      pending: 1,
      inProgress: 1,
    },

    list: [

      {
        id: 1,
        title: "Limpiar Baños Piso 2",
        description:
          "Limpieza completa de baños y reposición de insumos.",
        priority: "Alta",
        status: "Pendiente",
        estimatedMinutes: 45,
      },

      {
        id: 2,
        title: "Reposición de Insumos",
        description:
          "Revisar stock y reponer materiales faltantes.",
        priority: "Media",
        status: "En Progreso",
        estimatedMinutes: 30,
      },

      {
        id: 3,
        title: "Retiro de Basura",
        description:
          "Retirar residuos del sector norte.",
        priority: "Baja",
        status: "Completada",
        estimatedMinutes: 20,
      },

    ],

    team: [

      {
        id: 1,
        name: "Juan Pérez",
        role: "Operador",
      },

      {
        id: 2,
        name: "María Soto",
        role: "Operadora",
      },

      {
        id: 3,
        name: "Pedro González",
        role: "Supervisor",
      },

    ],

    inventory: [

      {
        id: 1,
        name: "Desinfectante",
        stock: 12,
      },

      {
        id: 2,
        name: "Guantes",
        stock: 40,
      },

      {
        id: 3,
        name: "Bolsas de basura",
        stock: 25,
      },

    ],
  },

  // ==========================================
  // HISTORIAL
  // ==========================================

  history: {

    monthlySummary: {

      workedDays: 21,

      delays: 1,

      absences: 0,

      completedTasks: 125,
    },

    attendanceHistory: [

      {
        id: 1,
        date: "2026-06-10",
        checkIn: "07:59",
        checkOut: "17:01",
      },

      {
        id: 2,
        date: "2026-06-11",
        checkIn: "08:03",
        checkOut: "17:00",
      },

      {
        id: 3,
        date: "2026-06-12",
        checkIn: "07:57",
        checkOut: "17:02",
      },

    ],

    taskHistory: {

      completedTasks: 125,

      lastCompleted: [
        "Limpiar Baños Piso 2",
        "Reposición de Insumos",
        "Retiro de Basura",
      ],
    },

    appeals: [

      {
        id: 1,
        date: "2026-06-05",
        status: "Aprobada",
      },

      {
        id: 2,
        date: "2026-05-15",
        status: "Rechazada",
      },

    ],
  },
};