// src/data/adminConfig.js
export const ADMIN_CONFIG = {
  personal: {
    topBar: { title: "Gestión de Personal", subtitle: "Administración global de usuarios y roles", tabs: [] },
    content: {
      title: "Personal Activo",
      subtitle: "Listado completo de colaboradores",
      actions: [{ text: "Registrar Ingreso", variant: "accent", className: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200" }]
    }
  },
  inventarios: {
    topBar: { title: "Gestión de Inventario", subtitle: "Administración global de inventario", tabs: [] },
    content: {
      title: "Inventario General",
      subtitle: "Estado actual de almacén",
      actions: [{ text: "Añadir Item", variant: "accent", className: "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200" }]
    }
  },
  categorias: {
    topBar: { title: "Categorías", subtitle: "Gestión del catálogo global", tabs: [] },
    content: {
      title: "Gestión de Categorías",
      subtitle: "Definición de etiquetas",
      actions: [{ text: "Nueva Categoría", variant: "accent", className: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200" }]
    }
  },
  reportes: {
    topBar: { title: "Gestión de Reportes", subtitle: "Administración global de reportes", tabs: [] },
    content: {
      title: "Reportes Ejecutivos",
      subtitle: "Dashboard de rendimiento",
      actions: [{ text: "Generar PDF", variant: "secondary" }]
    }
  }
};