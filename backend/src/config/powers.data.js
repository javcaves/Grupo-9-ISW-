// src/config/powers.data.js

export const poderesIniciales = [
    // ==========================================
    // CATEGORÍA: USUARIO
    // ==========================================
    {
        id_power: "USUARIO:CREATE",
        nombre: "Crear Usuarios",
        descripcion: "Permite registrar nuevos usuarios en el sistema",
        categoria: "USUARIO",
        activo: true
    },
    {
        id_power: "USUARIO:READ",
        nombre: "Visualizar Usuarios",
        descripcion: "Permite listar y ver los detalles de los usuarios",
        categoria: "USUARIO",
        activo: true
    },
    {
        id_power: "USUARIO:UPDATE",
        nombre: "Modificar Usuarios",
        descripcion: "Permite actualizar la informacion y roles de los usuarios",
        categoria: "USUARIO",
        activo: true
    },
    {
        id_power: "USUARIO:DELETE",
        nombre: "Eliminar Usuarios",
        descripcion: "Permite realizar la desactivacion o soft delete de usuarios",
        categoria: "USUARIO",
        activo: true
    },

    // ==========================================
    // CATEGORÍA: PROYECTO
    // ==========================================
    {
        id_power: "PROYECTO:CREATE",
        nombre: "Crear Proyectos",
        descripcion: "Permite registrar nuevos proyectos en el sistema",
        categoria: "PROYECTO",
        activo: true
    },
    {
        id_power: "PROYECTO:READ",
        nombre: "Visualizar Proyectos",
        descripcion: "Permite listar y ver la informacion de los proyectos",
        categoria: "PROYECTO",
        activo: true
    },
    {
        id_power: "PROYECTO:UPDATE",
        nombre: "Modificar Proyectos",
        descripcion: "Permite editar la informacion de los proyectos existentes",
        categoria: "PROYECTO",
        activo: true
    },
    {
        id_power: "PROYECTO:DELETE",
        nombre: "Eliminar Proyectos",
        descripcion: "Permite remover o desactivar proyectos del sistema",
        categoria: "PROYECTO",
        activo: true
    },

    // ==========================================
    // CATEGORÍA: BODEGA
    // ==========================================
    {
        id_power: "BODEGA:CREATE",
        nombre: "Crear Bodega",
        descripcion: "Permite registrar nuevas bodegas o almacenes",
        categoria: "BODEGA",
        activo: true
    },
    {
        id_power: "BODEGA:READ",
        nombre: "Visualizar Bodega",
        descripcion: "Permite ver el stock e informacion de las bodegas",
        categoria: "BODEGA",
        activo: true
    },
    {
        id_power: "BODEGA:UPDATE",
        nombre: "Modificar Bodega",
        descripcion: "Permite actualizar inventarios y datos de bodegas",
        categoria: "BODEGA",
        activo: true
    },
    {
        id_power: "BODEGA:DELETE",
        nombre: "Eliminar Bodega",
        descripcion: "Permite remover bodegas o inventarios antiguos",
        categoria: "BODEGA",
        activo: true
    },

    // ==========================================
    // CATEGORÍA: ACTIVIDAD
    // ==========================================
    {
        id_power: "ACTIVIDAD:CREATE",
        nombre: "Crear Actividades",
        descripcion: "Permite registrar nuevas actividades en el sistema",
        categoria: "ACTIVIDAD",
        activo: true
    },
    {
        id_power: "ACTIVIDAD:READ",
        nombre: "Visualizar Actividades",
        descripcion: "Permite listar y hacer seguimiento a las actividades",
        categoria: "ACTIVIDAD",
        activo: true
    },
    {
        id_power: "ACTIVIDAD:UPDATE",
        nombre: "Modificar Actividades",
        descripcion: "Permite editar el progreso e informacion de actividades",
        categoria: "ACTIVIDAD",
        activo: true
    },
    {
        id_power: "ACTIVIDAD:DELETE",
        nombre: "Eliminar Actividades",
        descripcion: "Permite remover actividades asignadas",
        categoria: "ACTIVIDAD",
        activo: true
    },

    // ==========================================
    // CATEGORÍA: ASISTENCIA
    // ==========================================
    {
        id_power: "ASISTENCIA:CREATE",
        nombre: "Tomar Asistencia",
        descripcion: "Permite registrar nuevas asistencias al sistema",
        categoria: "ASISTENCIA",
        activo: true
    },
    {
        id_power: "ASISTENCIA:READ",
        nombre: "Visualizar Asistencia",
        descripcion: "Permite revisar los reportes e historiales de asistencia",
        categoria: "ASISTENCIA",
        activo: true
    },
    {
        id_power: "ASISTENCIA:UPDATE",
        nombre: "Modificar Asistencia",
        descripcion: "Permite justificar inasistencias o editar marcas",
        categoria: "ASISTENCIA",
        activo: true
    },
    {
        id_power: "ASISTENCIA:DELETE",
        nombre: "Eliminar Asistencia",
        descripcion: "Permite purgar o remover registros de asistencia",
        categoria: "ASISTENCIA",
        activo: true
    }
];