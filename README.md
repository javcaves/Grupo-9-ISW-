# CleanAdmin
CleanAdmin es una plataforma integral de gestión y administración de operaciones diseñada para optimizar 
la coordinación de recursos humanos, el control de inventario y la planificación de actividades en proyectos operativos.

El sistema funciona a través de tres módulos principales:
###  1. Módulo de RRHH (Asistencia y Turnos)
* **Gestión de Turnos Dinámica:** Creación, edición y asignación de empleados a turnos con validación de solapamiento horario.
* **Asistencia por Token/QR:** Registro automatizado mediante escaneo de códigos QR o tokens alfanuméricos únicos por empleado.

###  2. Módulo de Bodega (Inventario)
* **Control de Stock:** Registro de movimientos (`ENTRADA`, `SALIDA`, `COMPRA`, etc.) con bloqueo estricto de stock negativo.
* **Naturaleza del Item:** Clasificación por control (`CONSUMO` vs `PRESTAMO`) y tipo (`MAQUINARIA`, `HERRAMIENTA`, etc.).

###  3. Módulo de Actividades y Calificaciones
* **Planificación de Tareas:** Programación, asignación y reasignación de actividades diarias a empleados según su disponibilidad horaria.
* **Matriz de Calificaciones:** Restricción de asignación de tareas complejas; solo los empleados calificados en una categoría pueden ejecutarla.

##  Modelo de Roles y Permisos (Jerarquía)

El sistema opera bajo un esquema piramidal de responsabilidades:

1.  **Root:** Administrador absoluto e irrevocable. Puede gestionar a otros administradores.
2.  **Admin:** Gestión global de proyectos, presupuestos de personal y asignación de macro-permisos.
3.  **Supervisor:** Validación, auditoría, aprobación de inventario, creación de categorías y control de múltiples proyectos.
4.  **Encargado:** Operación diaria en terreno, control de asistencia, asignación de tareas diarias y solicitudes de stock.
5.  **Empleado:** Vista de turnos propios, ejecución y reporte de tareas, y registro de asistencia.

## 🛠️ Stack Tecnológico

* **Backend:** Node.js (Express)
* **Base de Datos:** PostgreSQL
* **Frontend:** React (Vite)

## Créditos

Proyecto de Ingeniería de Software de la carrera Ingeniería Civil en Informática para la Universidad del Bío-Bío

### Grupo 9 integrado por:
 - Antonia Peña
 - Fernanda Fernandez
 - Javiera Cuevas
 - Carlos Bustos
 - Amasis Guzmán
