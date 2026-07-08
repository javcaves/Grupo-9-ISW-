// src/data/adminConfig.js
export const ADMIN_CONFIG = {
  personal: {
    topBar: { title: "Gestión de Personal", subtitle: "Administración global de usuarios y roles", tabs: [] },
    content: {
      title: "Personal Activo",
      subtitle: "Listado completo de colaboradores",
      actions: [{ text: "Registrar Ingreso", className: "bg-blue-600 text-white" }]
    }
  },
  inventarios: {
    topBar: { title: "Gestión de Inventario", subtitle: "Administración global de inventario", tabs: [] },
    content: {
      title: "Inventario General",
      subtitle: "Estado actual de almacén",
      actions: [{ text: "Añadir Item", className: "bg-emerald-600 text-white" }]
    }
  },
  categorias: {
    topBar: { title: "Categorías", subtitle: "Gestión del catálogo global", tabs: [] },
    content: {
      title: "Gestión de Categorías",
      subtitle: "Definición de etiquetas",
      actions: [{ text: "Nueva Categoría", className: "bg-blue-600 text-white" }]
    }
  },
  reportes: {
    topBar: { title: "Gestión de Reportes", subtitle: "Administración global de reportes", tabs: [] },
    content: {
      title: "Reportes Ejecutivos",
      subtitle: "Dashboard de rendimiento",
      actions: [{ text: "Generar PDF", className: "bg-slate-800 text-white" }]
    }
  }
};