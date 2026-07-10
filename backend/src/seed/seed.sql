-- ============================================================================
--  SEED DE DATOS DE PRUEBA -- "Limpieza Total SPA"
--  Motor: PostgreSQL
--  Empresa de aseo industrial (limpieza de edificios, universidades, etc.)
--  usando maquinaria (enceradoras, hidrolavadoras) e insumos (desinfectantes,
--  detergentes, etc.)
--
--  CONVENCIONES:
--  - El usuario ROOT ya existe en el sistema con id_usuario = 1. NO se toca.
--  - Todas las contraseñas de prueba son el hash bcrypt (10 rounds) de la
--    clave "clave123":
--        $2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm
--  - Fecha de referencia "hoy" usada para los datos recientes: 2026-07-09.
--  - Regla de negocio respetada: SOLO usuarios con rol EMPLEADO participan
--    de turno_empleado / asistencia / asistencia_empleado / asignacion_tarea.
--    ADMIN, SUPERVISOR y ENCARGADO nunca tienen asistencia ni tareas propias.
--  - Todas las eliminaciones son soft-delete (activo = FALSE), nunca se
--    borra una fila físicamente.
--  - El proyecto más importante es "Universidad del Bío-Bío -- Campus
--    Concepción" (id_proyecto = 3): tiene el radio de geocerca más grande,
--    más turnos, más personal y el historial de asistencia más completo.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. USUARIO
--    Roles: ADMIN (2), SUPERVISOR (5, pueden estar en +1 proyecto),
--    ENCARGADO (8), EMPLEADO (30). IDs 2-46 (ROOT = 1 ya existe).
-- ============================================================================
INSERT INTO usuario (id_usuario, rut, nombre, apellido, password, observacion, email, numero, rol, fecha_ingreso, activo) VALUES
(2, '10500000-6', 'Javiera', 'Muñoz', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Administrador de la plataforma.', 'javiera.munoz@limpiezatotal.cl', '+56910000002', 'ADMIN', '2025-01-01 09:00:00', TRUE),
(3, '10500037-5', 'Rodrigo', 'Contreras', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Administrador de la plataforma.', 'rodrigo.contreras@limpiezatotal.cl', '+56910000003', 'ADMIN', '2025-01-01 09:00:00', TRUE),
(4, '10500074-K', 'Carla', 'Espinoza', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Supervisor(a) de operaciones de limpieza.', 'carla.espinoza@limpiezatotal.cl', '+56910000004', 'SUPERVISOR', '2025-01-01 09:00:00', TRUE),
(5, '10500111-8', 'Matías', 'Fuentes', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Supervisor(a) de operaciones de limpieza.', 'matias.fuentes@limpiezatotal.cl', '+56910000005', 'SUPERVISOR', '2025-01-01 09:00:00', TRUE),
(6, '10500148-7', 'Francisca', 'Vidal', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Supervisor(a) de operaciones de limpieza.', 'francisca.vidal@limpiezatotal.cl', '+56910000006', 'SUPERVISOR', '2025-01-01 09:00:00', TRUE),
(7, '10500185-1', 'Diego', 'Salinas', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Supervisor(a) de operaciones de limpieza.', 'diego.salinas@limpiezatotal.cl', '+56910000007', 'SUPERVISOR', '2025-01-01 09:00:00', TRUE),
(8, '10500222-K', 'Camila', 'Reyes', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Supervisor(a) de operaciones de limpieza.', 'camila.reyes@limpiezatotal.cl', '+56910000008', 'SUPERVISOR', '2025-01-01 09:00:00', TRUE),
(9, '10500259-9', 'Sebastián', 'Rojas', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Encargado(a) de turno y asistencia en terreno.', 'sebastian.rojas@limpiezatotal.cl', '+56910000009', 'ENCARGADO', '2025-01-01 09:00:00', TRUE),
(10, '10500296-3', 'Valentina', 'Torres', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Encargado(a) de turno y asistencia en terreno.', 'valentina.torres@limpiezatotal.cl', '+56910000010', 'ENCARGADO', '2025-01-01 09:00:00', TRUE),
(11, '10500333-1', 'Cristóbal', 'Morales', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Encargado(a) de turno y asistencia en terreno.', 'cristobal.morales@limpiezatotal.cl', '+56910000011', 'ENCARGADO', '2025-01-01 09:00:00', TRUE),
(12, '10500370-6', 'Antonia', 'Vergara', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Encargado(a) de turno y asistencia en terreno.', 'antonia.vergara@limpiezatotal.cl', '+56910000012', 'ENCARGADO', '2025-01-01 09:00:00', TRUE),
(13, '10500407-9', 'Felipe', 'Araya', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Encargado(a) de turno y asistencia en terreno.', 'felipe.araya@limpiezatotal.cl', '+56910000013', 'ENCARGADO', '2025-01-01 09:00:00', TRUE),
(14, '10500444-3', 'Constanza', 'Bravo', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Encargado(a) de turno y asistencia en terreno.', 'constanza.bravo@limpiezatotal.cl', '+56910000014', 'ENCARGADO', '2025-01-01 09:00:00', TRUE),
(15, '10500481-8', 'Ignacio', 'Soto', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Encargado(a) de turno y asistencia en terreno.', 'ignacio.soto@limpiezatotal.cl', '+56910000015', 'ENCARGADO', '2025-01-01 09:00:00', TRUE),
(16, '10500518-0', 'Fernanda', 'Cárdenas', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Encargado(a) de turno y asistencia en terreno.', 'fernanda.cardenas@limpiezatotal.cl', '+56910000016', 'ENCARGADO', '2025-01-01 09:00:00', TRUE),
(17, '10500555-5', 'Tomás', 'Gallardo', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'tomas.gallardo@limpiezatotal.cl', '+56910000017', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(18, '10500592-K', 'Josefa', 'Molina', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'josefa.molina@limpiezatotal.cl', '+56910000018', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(19, '10500629-2', 'Benjamín', 'Castro', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'benjamin.castro@limpiezatotal.cl', '+56910000019', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(20, '10500666-7', 'Catalina', 'Riquelme', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'catalina.riquelme@limpiezatotal.cl', '+56910000020', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(21, '10500703-5', 'Vicente', 'Sepúlveda', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'vicente.sepulveda@limpiezatotal.cl', '+56910000021', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(22, '10500740-K', 'Martina', 'Pizarro', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'martina.pizarro@limpiezatotal.cl', '+56910000022', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(23, '10500777-9', 'Joaquín', 'Yáñez', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'joaquin.yanez@limpiezatotal.cl', '+56910000023', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(24, '10500814-7', 'Isidora', 'Concha', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'isidora.concha@limpiezatotal.cl', '+56910000024', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(25, '10500851-1', 'Maximiliano', 'Vera', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'maximiliano.vera@limpiezatotal.cl', '+56910000025', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(26, '10500888-0', 'Emilia', 'Tapia', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'emilia.tapia@limpiezatotal.cl', '+56910000026', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(27, '10500925-9', 'Agustín', 'Zúñiga', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'agustin.zuniga@limpiezatotal.cl', '+56910000027', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(28, '10500962-3', 'Trinidad', 'Figueroa', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'trinidad.figueroa@limpiezatotal.cl', '+56910000028', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(29, '10500999-2', 'Bastián', 'Miranda', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'bastian.miranda@limpiezatotal.cl', '+56910000029', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(30, '10501036-2', 'Florencia', 'Cid', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'florencia.cid@limpiezatotal.cl', '+56910000030', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(31, '10501073-7', 'Nicolás', 'Parra', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'nicolas.parra@limpiezatotal.cl', '+56910000031', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(32, '10501110-5', 'Amanda', 'Sánchez', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'amanda.sanchez@limpiezatotal.cl', '+56910000032', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(33, '10501147-4', 'Gabriel', 'Aravena', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'gabriel.aravena@limpiezatotal.cl', '+56910000033', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(34, '10501184-9', 'Renata', 'Bustos', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'renata.bustos@limpiezatotal.cl', '+56910000034', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(35, '10501221-7', 'Pedro', 'Lagos', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'pedro.lagos@limpiezatotal.cl', '+56910000035', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(36, '10501258-6', 'Sofía', 'Herrera', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'sofia.herrera@limpiezatotal.cl', '+56910000036', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(37, '10501295-0', 'Álvaro', 'Poblete', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'alvaro.poblete@limpiezatotal.cl', '+56910000037', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(38, '10501332-9', 'Daniela', 'Campos', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'daniela.campos@limpiezatotal.cl', '+56910000038', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(39, '10501369-8', 'Cristian', 'Villagrán', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'cristian.villagran@limpiezatotal.cl', '+56910000039', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(40, '10501406-6', 'Paulina', 'Escobar', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'paulina.escobar@limpiezatotal.cl', '+56910000040', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(41, '10501443-0', 'Mauricio', 'Toledo', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'mauricio.toledo@limpiezatotal.cl', '+56910000041', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(42, '10501480-5', 'Bárbara', 'Navarro', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'barbara.navarro@limpiezatotal.cl', '+56910000042', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(43, '10501517-8', 'Esteban', 'Ojeda', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'esteban.ojeda@limpiezatotal.cl', '+56910000043', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(44, '10501554-2', 'Rocío', 'Guzmán', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'rocio.guzman@limpiezatotal.cl', '+56910000044', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(45, '10501591-7', 'Manuel', 'Carrasco', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'manuel.carrasco@limpiezatotal.cl', '+56910000045', 'EMPLEADO', '2025-01-01 09:00:00', TRUE),
(46, '10501628-K', 'Natalia', 'Uribe', '$2b$10$opkLD4d4OyOfHrg80VTiiuTTTCTsogX3bLR9lgT7n8OZhpNUWmnNm', 'Operario(a) de limpieza.', 'natalia.uribe@limpiezatotal.cl', '+56910000046', 'EMPLEADO', '2025-01-01 09:00:00', TRUE);

-- ============================================================================
-- 2. PROYECTO
--    Variedad de estados/ubicaciones. Radios de geocerca generosos para que
--    el marcaje de asistencia funcione bien en demos. id_proyecto=3 (UBB
--    Concepción) es el más importante -- radio más grande, más personal.
-- ============================================================================
INSERT INTO proyecto (id_proyecto, nombre_proy, min_emp, max_emp, ubicacion, latitud, longitud, radio_geocerca, fecha_inicio, fecha_termino, estado, activo) VALUES
(1, 'Mall Plaza Vespucio',                    4, 8,  'Av. Vespucio 610, La Florida, Santiago',            -33.5225000, -70.5977000, 250, '2025-11-01 09:00:00', NULL,                   'EN_CURSO',       TRUE),
(2, 'Torre Corporativa Providencia',          3, 6,  'Av. Nueva Providencia 1208, Providencia, Santiago', -33.4260000, -70.6110000, 200, '2026-02-01 09:00:00', NULL,                   'EN_CURSO',       TRUE),
(3, 'Universidad del Bío-Bío -- Campus Concepción', 6, 12, 'Av. Collao 1202, Concepción',                  -36.8280000, -73.0359000, 600, '2026-03-01 09:00:00', NULL,                   'EN_CURSO',       TRUE),
(4, 'Terminal de Buses Collao',               2, 5,  'Terminal Collao, Concepción',                       -36.7897000, -73.0995000, 300, '2026-07-20 09:00:00', NULL,                   'EN_PREPARACION', TRUE),
(5, 'Clínica Regional Los Ángeles',           3, 6,  'Av. Alemania 685, Los Ángeles',                     -37.4693000, -72.3529000, 250, '2025-01-10 09:00:00', '2025-12-20 18:00:00',  'FINALIZADO',     TRUE),
(6, 'Municipalidad de Viña del Mar',          3, 6,  'Arlegui 615, Viña del Mar',                         -33.0246000, -71.5518000, 250, '2025-09-01 09:00:00', NULL,                   'EN_CURSO',       TRUE),
(7, 'Bodega Industrial Quilicura',            2, 4,  'Camino Lo Etchevers 0221, Quilicura, Santiago',     -33.3608000, -70.7264000, 300, '2025-06-01 09:00:00', NULL,                   'EN_CURSO',       FALSE),
(8, 'Condominio Parque Araucano',             3, 6,  'Av. Presidente Kennedy 9001, Las Condes, Santiago', -33.4085000, -70.5661000, 250, '2026-08-01 09:00:00', NULL,                   'EN_PREPARACION', TRUE),
(9, 'Terminal Aéreo El Tepual',               2, 4,  'Aeropuerto El Tepual, Puerto Montt',                -41.4389000, -73.0940000, 350, '2024-03-01 09:00:00', '2024-11-30 18:00:00',  'FINALIZADO',     FALSE);

-- ============================================================================
-- 3. PROYECTO_USUARIO
--    Supervisores pueden estar en +1 proyecto. Encargados y empleados, en
--    uno solo. Los del proyecto 5 (finalizado) y 7 (desactivado) quedan
--    con activo=FALSE y fecha_termino, reflejando que ya no están asignados.
-- ============================================================================
INSERT INTO proyecto_usuario (id_proyecto, id_usuario, fecha_asignacion, fecha_termino, activo) VALUES
-- Proyecto 1: Mall Plaza Vespucio -- Supervisor Carla(4), Encargado Sebastián(9)
(1, 4,  '2025-11-01 09:00:00', NULL, TRUE),
(1, 9,  '2025-11-02 09:00:00', NULL, TRUE),
(1, 17, '2025-11-05 09:00:00', NULL, TRUE),
(1, 18, '2025-11-05 09:00:00', NULL, TRUE),
(1, 19, '2025-11-05 09:00:00', NULL, TRUE),
(1, 20, '2025-11-06 09:00:00', NULL, TRUE),
(1, 21, '2025-11-06 09:00:00', NULL, TRUE),
-- Proyecto 2: Torre Providencia -- Supervisores Carla(4)+Matías(5), Encargado Valentina(10)
(2, 4,  '2026-02-01 09:00:00', NULL, TRUE),
(2, 5,  '2026-02-01 09:00:00', NULL, TRUE),
(2, 10, '2026-02-02 09:00:00', NULL, TRUE),
(2, 22, '2026-02-05 09:00:00', NULL, TRUE),
(2, 23, '2026-02-05 09:00:00', NULL, TRUE),
(2, 24, '2026-02-05 09:00:00', NULL, TRUE),
(2, 25, '2026-02-06 09:00:00', NULL, TRUE),
-- Proyecto 3: UBB Concepción (PRINCIPAL) -- Supervisor Francisca(6), Encargados Cristóbal(11)+Antonia(12)
(3, 6,  '2026-03-01 09:00:00', NULL, TRUE),
(3, 11, '2026-03-02 09:00:00', NULL, TRUE),
(3, 12, '2026-03-02 09:00:00', NULL, TRUE),
(3, 26, '2026-03-05 09:00:00', NULL, TRUE),
(3, 27, '2026-03-05 09:00:00', NULL, TRUE),
(3, 28, '2026-03-05 09:00:00', NULL, TRUE),
(3, 29, '2026-03-05 09:00:00', NULL, TRUE),
(3, 30, '2026-03-06 09:00:00', NULL, TRUE),
(3, 31, '2026-03-06 09:00:00', NULL, TRUE),
(3, 32, '2026-03-10 09:00:00', NULL, TRUE),
(3, 33, '2026-03-10 09:00:00', NULL, TRUE),
-- Proyecto 4: Terminal Collao -- Supervisor Francisca(6), Encargado Felipe(13)
(4, 6,  '2026-07-01 09:00:00', NULL, TRUE),
(4, 13, '2026-07-01 09:00:00', NULL, TRUE),
(4, 34, '2026-07-20 09:00:00', NULL, TRUE),
(4, 35, '2026-07-20 09:00:00', NULL, TRUE),
(4, 36, '2026-07-20 09:00:00', NULL, TRUE),
-- Proyecto 5: Clínica Los Ángeles (FINALIZADO) -- Supervisor Diego(7), Encargado Constanza(14)
(5, 7,  '2025-01-10 09:00:00', '2025-12-20 18:00:00', FALSE),
(5, 14, '2025-01-12 09:00:00', '2025-12-20 18:00:00', FALSE),
(5, 37, '2025-01-15 09:00:00', '2025-12-20 18:00:00', FALSE),
(5, 38, '2025-01-15 09:00:00', '2025-12-20 18:00:00', FALSE),
(5, 39, '2025-01-15 09:00:00', '2025-12-20 18:00:00', FALSE),
(5, 40, '2025-01-16 09:00:00', '2025-12-20 18:00:00', FALSE),
-- Proyecto 6: Municipalidad Viña del Mar -- Supervisor Matías(5), Encargado Ignacio(15)
(6, 5,  '2025-09-01 09:00:00', NULL, TRUE),
(6, 15, '2025-09-01 09:00:00', NULL, TRUE),
(6, 41, '2025-09-05 09:00:00', NULL, TRUE),
(6, 42, '2025-09-05 09:00:00', NULL, TRUE),
(6, 43, '2025-09-05 09:00:00', NULL, TRUE),
(6, 44, '2025-09-06 09:00:00', NULL, TRUE),
-- Proyecto 7: Bodega Quilicura (DESACTIVADO a mitad de camino) -- Supervisor Camila(8), Encargado Fernanda(16)
(7, 8,  '2025-06-01 09:00:00', '2026-05-15 18:00:00', FALSE),
(7, 16, '2025-06-01 09:00:00', '2026-05-15 18:00:00', FALSE),
(7, 45, '2025-06-05 09:00:00', '2026-05-15 18:00:00', FALSE),
(7, 46, '2025-06-05 09:00:00', '2026-05-15 18:00:00', FALSE),
-- Proyecto 8: Condominio Parque Araucano (EN_PREPARACION) -- Solo Supervisor Camila(8) asignada por ahora
(8, 8,  '2026-07-01 09:00:00', NULL, TRUE);

-- ============================================================================
-- 4. CATEGORIA
-- ============================================================================
INSERT INTO categoria (id_cat, nombre, descripcion, requiere_calificacion, activo) VALUES
(1, 'Limpieza General',                  'Aseo estándar de pisos, superficies y áreas comunes.',                    FALSE, TRUE),
(2, 'Manejo de Maquinaria Industrial',    'Uso de enceradoras, hidrolavadoras y aspiradoras industriales.',          TRUE,  TRUE),
(3, 'Desinfección y Sanitización',        'Aplicación de desinfectantes en áreas críticas (baños, laboratorios).',   TRUE,  TRUE),
(4, 'Jardinería y Áreas Verdes',          'Mantención de jardines, prados y áreas exteriores.',                      FALSE, TRUE),
(5, 'Limpieza de Vidrios en Altura',      'Limpieza de ventanales y fachadas con trabajo en altura.',                TRUE,  TRUE);

-- ============================================================================
-- 5. ACTIVIDAD
--    Ligadas a categoria + proyecto. Las de proyectos finalizados quedan
--    inactivas (soft delete), preservando el historial para reportes.
-- ============================================================================
INSERT INTO actividad (id_act, id_cat, id_proyecto, descripcion_esp, recurrencia, activo) VALUES
(1,  1, 1, 'Aseo de pasillos y áreas comunes',                    'DIARIA',  TRUE),
(2,  5, 1, 'Limpieza de vidrios exteriores',                      'MENSUAL', TRUE),
(3,  1, 2, 'Aseo de oficinas',                                    'DIARIA',  TRUE),
(4,  3, 2, 'Desinfección de baños y salas de reuniones',          'SEMANAL', TRUE),
(5,  1, 3, 'Aseo de salas de clases y auditorios',                'DIARIA',  TRUE),
(6,  2, 3, 'Encerado de pisos con maquinaria industrial',         'SEMANAL', TRUE),
(7,  4, 3, 'Mantención de jardines y áreas verdes del campus',    'SEMANAL', TRUE),
(8,  3, 3, 'Desinfección de laboratorios',                        'SEMANAL', TRUE),
(9,  1, 6, 'Aseo de dependencias municipales',                    'DIARIA',  TRUE),
(10, 3, 5, 'Desinfección de pabellones',                          'DIARIA',  FALSE);

-- ============================================================================
-- 6. PROGRAMAR_TAREA
--    Estados variados: PLANIFICADA, EN_PROCESO, FINALIZADA, INCOMPLETA,
--    CANCELADA, ASIGNADA.
-- ============================================================================
INSERT INTO programar_tarea (id_tarea, id_act, id_programador, fecha, hora, estado, comentario) VALUES
(1,  1, 9,  '2026-07-08', '07:00:00', 'FINALIZADA',  'Turno mañana completado sin incidentes.'),
(2,  1, 9,  '2026-07-09', '07:00:00', 'ASIGNADA',    NULL),
(3,  2, 9,  '2026-07-15', '09:00:00', 'PLANIFICADA', 'Requiere andamio, coordinar con supervisor.'),
(4,  3, 10, '2026-07-08', '08:00:00', 'FINALIZADA',  NULL),
(5,  4, 10, '2026-07-10', '08:30:00', 'PLANIFICADA', NULL),
(6,  5, 11, '2026-07-07', '07:00:00', 'FINALIZADA',  'Salas A101-A110 completadas.'),
(7,  5, 11, '2026-07-08', '07:00:00', 'FINALIZADA',  NULL),
(8,  5, 11, '2026-07-09', '07:00:00', 'EN_PROCESO',  NULL),
(9,  6, 12, '2026-07-11', '15:00:00', 'PLANIFICADA', 'Usar enceradora industrial, sector biblioteca.'),
(10, 7, 11, '2026-07-06', '08:00:00', 'FINALIZADA',  NULL),
(11, 8, 12, '2026-07-08', '15:30:00', 'FINALIZADA',  'Laboratorio de química, protocolo reforzado.'),
(12, 9, 15, '2026-07-08', '08:30:00', 'FINALIZADA',  NULL),
(13, 9, 15, '2026-07-05', '08:30:00', 'INCOMPLETA',  'Faltó personal, se retomó al día siguiente.'),
(14, 9, 15, '2026-06-20', '08:30:00', 'CANCELADA',   'Cancelada por lluvia intensa, reprogramada.'),
(15, 10, 14, '2025-12-15', '07:00:00', 'FINALIZADA', 'Última desinfección antes del cierre del proyecto.');

-- ============================================================================
-- 7. ASIGNACION_TAREA
-- ============================================================================
INSERT INTO asignacion_tarea (id_asignacion, id_tarea, id_empleado, id_asignador, tipo_asignacion, hora_asignacion) VALUES
(1,  1,  17, 9,  'PROGRAMADA', '2026-07-08 06:45:00'),
(2,  1,  18, 9,  'PROGRAMADA', '2026-07-08 06:45:00'),
(3,  2,  19, 9,  'PROGRAMADA', '2026-07-09 06:45:00'),
(4,  4,  22, 10, 'PROGRAMADA', '2026-07-08 07:45:00'),
(5,  4,  23, 10, 'REASIGNADA', '2026-07-08 07:50:00'),
(6,  6,  26, 11, 'PROGRAMADA', '2026-07-07 06:45:00'),
(7,  6,  27, 11, 'PROGRAMADA', '2026-07-07 06:45:00'),
(8,  7,  26, 11, 'PROGRAMADA', '2026-07-08 06:45:00'),
(9,  8,  28, 11, 'PROGRAMADA', '2026-07-09 06:45:00'),
(10, 9,  29, 12, 'PROGRAMADA', '2026-07-11 14:45:00'),
(11, 11, 30, 12, 'PROGRAMADA', '2026-07-08 15:15:00'),
(12, 12, 41, 15, 'PROGRAMADA', '2026-07-08 08:15:00');

-- ============================================================================
-- 8. EVALUACION_DESEMPENO
-- ============================================================================
INSERT INTO evaluacion_desempeno (id_evaluacion, id_tarea, id_empleado, id_evaluador, calificacion, cumplio, comentario, fecha_evaluacion, activo) VALUES
(1, 1,  17, 9,  5, TRUE, 'Excelente desempeño, áreas impecables.',                     '2026-07-08 15:30:00', TRUE),
(2, 1,  18, 9,  4, TRUE, 'Buen trabajo, pequeños detalles por mejorar en esquinas.',   '2026-07-08 15:30:00', TRUE),
(3, 4,  22, 10, 5, TRUE, NULL,                                                        '2026-07-08 17:30:00', TRUE),
(4, 6,  26, 11, 4, TRUE, NULL,                                                        '2026-07-07 15:30:00', TRUE),
(5, 6,  27, 11, 3, TRUE, 'Cumplió pero con retraso en el horario.',                    '2026-07-07 15:30:00', TRUE),
(6, 11, 30, 12, 5, TRUE, 'Protocolo de bioseguridad cumplido a cabalidad.',            '2026-07-08 16:00:00', TRUE),
(7, 12, 41, 15, 4, TRUE, NULL,                                                        '2026-07-08 09:00:00', TRUE),
(8, 15, 37, 14, 5, TRUE, 'Cierre de proyecto con estándar impecable.',                 '2025-12-15 12:00:00', TRUE);

-- ============================================================================
-- 9. CALIFICACION_EMPLEADO
--    Solo para categorías que requieren_calificacion (2, 3, 5).
-- ============================================================================
INSERT INTO calificacion_empleado (id_calificacion, id_cat, id_empleado, id_otorga, fecha_otorgamiento, activo) VALUES
(1, 2, 26, 11, '2026-03-10 10:00:00', TRUE),
(2, 2, 29, 12, '2026-03-12 10:00:00', TRUE),
(3, 3, 28, 11, '2026-03-15 10:00:00', TRUE),
(4, 3, 31, 12, '2026-03-15 10:00:00', TRUE),
(5, 5, 17, 9,  '2025-11-10 10:00:00', TRUE),
(6, 2, 22, 10, '2026-02-10 10:00:00', TRUE),
(7, 3, 39, 14, '2025-01-20 10:00:00', TRUE),
(8, 5, 32, 12, '2026-04-01 10:00:00', TRUE);

-- ============================================================================
-- 10. TURNO
--     Cada empleado pertenece a un único turno activo a la vez (se respeta
--     al no cruzar horarios ni duplicar asignaciones activas). UBB es el
--     proyecto con más turnos por ser el principal.
-- ============================================================================
INSERT INTO turno (id_turno, id_proyecto, nombre, hora_ingreso, hora_salida, descripcion, activo) VALUES
(1,  1, 'Turno Mañana',       '07:00:00', '15:00:00', 'Turno mañana Mall Plaza Vespucio.',                TRUE),
(2,  1, 'Turno Tarde',        '15:00:00', '23:00:00', 'Turno tarde Mall Plaza Vespucio.',                  TRUE),
(3,  2, 'Turno Único',        '08:00:00', '17:00:00', 'Turno único Torre Providencia (horario de oficina).', TRUE),
(4,  3, 'Turno Mañana',       '07:00:00', '15:00:00', 'Turno mañana UBB Concepción.',                       TRUE),
(5,  3, 'Turno Tarde',        '15:00:00', '22:00:00', 'Turno tarde UBB Concepción.',                        TRUE),
(6,  3, 'Turno Fin de Semana','08:00:00', '14:00:00', 'Turno reducido de fin de semana UBB Concepción.',    TRUE),
(7,  4, 'Turno Mañana',       '06:00:00', '14:00:00', 'Turno mañana Terminal Collao (preparación).',        TRUE),
(8,  5, 'Turno Único',        '07:00:00', '15:00:00', 'Turno único Clínica Los Ángeles (proyecto finalizado).', FALSE),
(9,  6, 'Turno Único',        '08:30:00', '17:30:00', 'Turno único Municipalidad de Viña del Mar.',         TRUE),
(10, 7, 'Turno Único',        '07:00:00', '16:00:00', 'Turno único Bodega Quilicura (proyecto desactivado).', FALSE);

-- ============================================================================
-- 11. TURNO_EMPLEADO
--     Colaciones escalonadas por turno para respetar la regla de cobertura
--     mínima (siempre queda al menos 1 empleado disponible).
-- ============================================================================
INSERT INTO turno_empleado (id_turno, id_empleado, fecha_ingreso, fecha_egreso, inicio_colacion, fin_colacion, trabaja_feriados, activo) VALUES
-- Turno 1: Mall Mañana (17,18,19)
(1, 17, '2025-11-05', NULL, '12:00:00', '12:30:00', FALSE, TRUE),
(1, 18, '2025-11-05', NULL, '12:30:00', '13:00:00', FALSE, TRUE),
(1, 19, '2025-11-05', NULL, '13:00:00', '13:30:00', TRUE,  TRUE),
-- Turno 2: Mall Tarde (20,21)
(2, 20, '2025-11-06', NULL, '18:00:00', '18:30:00', FALSE, TRUE),
(2, 21, '2025-11-06', NULL, '18:30:00', '19:00:00', FALSE, TRUE),
-- Turno 3: Providencia Único (22,23,24,25)
(3, 22, '2026-02-05', NULL, '12:00:00', '12:30:00', FALSE, TRUE),
(3, 23, '2026-02-05', NULL, '12:30:00', '13:00:00', FALSE, TRUE),
(3, 24, '2026-02-05', NULL, '13:00:00', '13:30:00', FALSE, TRUE),
(3, 25, '2026-02-06', NULL, '13:30:00', '14:00:00', TRUE,  TRUE),
-- Turno 4: UBB Mañana (26,27,28)
(4, 26, '2026-03-05', NULL, '11:30:00', '12:00:00', FALSE, TRUE),
(4, 27, '2026-03-05', NULL, '12:00:00', '12:30:00', TRUE,  TRUE),
(4, 28, '2026-03-05', NULL, '12:30:00', '13:00:00', FALSE, TRUE),
-- Turno 5: UBB Tarde (29,30,31)
(5, 29, '2026-03-05', NULL, '18:00:00', '18:30:00', FALSE, TRUE),
(5, 30, '2026-03-06', NULL, '18:30:00', '19:00:00', FALSE, TRUE),
(5, 31, '2026-03-06', NULL, '19:00:00', '19:30:00', TRUE,  TRUE),
-- Turno 6: UBB Fin de Semana (32,33)
(6, 32, '2026-03-10', NULL, '10:30:00', '11:00:00', TRUE, TRUE),
(6, 33, '2026-03-10', NULL, '11:00:00', '11:30:00', TRUE, TRUE),
-- Turno 7: Collao Mañana (34,35,36)
(7, 34, '2026-07-20', NULL, '09:30:00', '10:00:00', FALSE, TRUE),
(7, 35, '2026-07-20', NULL, '10:00:00', '10:30:00', FALSE, TRUE),
(7, 36, '2026-07-20', NULL, '10:30:00', '11:00:00', FALSE, TRUE),
-- Turno 8: Clínica (histórico, proyecto finalizado) (37,38,39,40)
(8, 37, '2025-01-15', '2025-12-20', '11:00:00', '11:30:00', FALSE, FALSE),
(8, 38, '2025-01-15', '2025-12-20', '11:30:00', '12:00:00', FALSE, FALSE),
(8, 39, '2025-01-15', '2025-12-20', '12:00:00', '12:30:00', TRUE,  FALSE),
(8, 40, '2025-01-16', '2025-12-20', '12:30:00', '13:00:00', FALSE, FALSE),
-- Turno 9: Municipalidad Viña (41,42,43,44)
(9, 41, '2025-09-05', NULL, '12:30:00', '13:00:00', FALSE, TRUE),
(9, 42, '2025-09-05', NULL, '13:00:00', '13:30:00', FALSE, TRUE),
(9, 43, '2025-09-05', NULL, '13:30:00', '14:00:00', TRUE,  TRUE),
(9, 44, '2025-09-06', NULL, '14:00:00', '14:30:00', FALSE, TRUE),
-- Turno 10: Bodega Quilicura (histórico, proyecto desactivado) (45,46)
(10, 45, '2025-06-05', '2026-05-15', '11:00:00', '11:30:00', FALSE, FALSE),
(10, 46, '2025-06-05', '2026-05-15', '11:30:00', '12:00:00', FALSE, FALSE);

-- ============================================================================
-- 12. ASISTENCIA
--     UBB Concepción (proyecto principal) tiene el historial más completo:
--     3 días de Turno Mañana (incluyendo el día de hoy, 2026-07-09, con
--     empleados aún EN_ESPERA), más Turno Tarde y Fin de Semana.
--     La fila 7 (Mall Turno Tarde) queda ACTIVO=FALSE para demostrar el
--     soft-delete de una asistencia (sus hijos estaban en EN_ESPERA /
--     FALTA_INJUSTIFICADA, tal como exige la regla de negocio).
-- ============================================================================
INSERT INTO asistencia (id_asistencia, id_turno, id_encargado, id_proyecto, fecha, token, token_expira, activo) VALUES
(1,  4, 11, 3, '2026-07-07', 'A7F3', '2026-07-07 15:00:00', TRUE),
(2,  4, 11, 3, '2026-07-08', 'B2K9', '2026-07-08 15:00:00', TRUE),
(3,  4, 11, 3, '2026-07-09', 'C8M1', '2026-07-09 15:00:00', TRUE),
(4,  5, 12, 3, '2026-07-08', 'D4P7', '2026-07-08 22:00:00', TRUE),
(5,  6, 12, 3, '2026-07-05', 'E9Q2', '2026-07-05 14:00:00', TRUE),
(6,  1, 9,  1, '2026-07-08', 'F1R6', '2026-07-08 15:00:00', TRUE),
(7,  2, 9,  1, '2026-07-08', 'G5T3', '2026-07-08 23:00:00', FALSE),
(8,  3, 10, 2, '2026-07-08', 'H2W8', '2026-07-08 17:00:00', TRUE),
(9,  9, 15, 6, '2026-07-08', 'J6Y4', '2026-07-08 17:30:00', TRUE),
(10, 8, 14, 5, '2025-12-18', 'K3Z0', '2025-12-18 15:00:00', TRUE);

-- ============================================================================
-- 13. ASISTENCIA_EMPLEADO
-- ============================================================================
INSERT INTO asistencia_empleado (id_asistencia, id_empleado, hora_ingreso, hora_egreso, estado, descripcion, editado_por, fecha_edicion, geo_verificada, activo) VALUES
-- Asistencia 1: UBB Mañana 07-07 -- todos PRESENTE
(1, 26, '07:05:00', NULL, 'PRESENTE', NULL, NULL, NULL, TRUE, TRUE),
(1, 27, '07:02:00', NULL, 'PRESENTE', NULL, NULL, NULL, TRUE, TRUE),
(1, 28, '07:10:00', NULL, 'PRESENTE', NULL, NULL, NULL, TRUE, TRUE),
-- Asistencia 2: UBB Mañana 07-08 -- variado
(2, 26, '07:03:00', NULL, 'PRESENTE',          NULL,                                          NULL, NULL,                  TRUE,  TRUE),
(2, 27, '07:22:00', NULL, 'ATRASO',            NULL,                                          NULL, NULL,                  TRUE,  TRUE),
(2, 28, NULL,        NULL, 'FALTA_INJUSTIFICADA','Cierre automático por scheduler: sin registro al vencer el turno.', NULL, '2026-07-08 15:01:00', FALSE, TRUE),
-- Asistencia 3: UBB Mañana 07-09 (HOY, turno en curso) -- solo uno ya marcó
(3, 26, '07:01:00', NULL, 'PRESENTE',  NULL, NULL, NULL, TRUE,  TRUE),
(3, 27, NULL,        NULL, 'EN_ESPERA', NULL, NULL, NULL, FALSE, TRUE),
(3, 28, NULL,        NULL, 'EN_ESPERA', NULL, NULL, NULL, FALSE, TRUE),
-- Asistencia 4: UBB Tarde 07-08 -- incluye edición manual del encargado
(4, 29, '15:05:00', NULL,        'PRESENTE',         NULL,                                             NULL, NULL,                  TRUE, TRUE),
(4, 30, '15:02:00', '19:00:00',  'RETIRADO',         'Se retiró por motivos médicos, autorizado por el encargado.', 12,   '2026-07-08 19:05:00', TRUE, TRUE),
(4, 31, NULL,        NULL,       'FALTA_JUSTIFICADA','Certificado médico presentado con antelación.',  12,   '2026-07-08 14:00:00', FALSE, TRUE),
-- Asistencia 5: UBB Fin de Semana 07-05
(5, 32, '08:04:00', NULL, 'PRESENTE', NULL, NULL, NULL, TRUE, TRUE),
(5, 33, '08:25:00', NULL, 'ATRASO',   NULL, NULL, NULL, TRUE, TRUE),
-- Asistencia 6: Mall Mañana 07-08
(6, 17, '07:02:00', NULL, 'PRESENTE', NULL, NULL, NULL, TRUE, TRUE),
(6, 18, '06:58:00', NULL, 'PRESENTE', NULL, NULL, NULL, TRUE, TRUE),
(6, 19, '07:19:00', NULL, 'ATRASO',   NULL, NULL, NULL, TRUE, TRUE),
-- Asistencia 7: Mall Tarde 07-08 (ELIMINADA -- soft delete, hijos inactivos)
(7, 20, NULL, NULL, 'FALTA_INJUSTIFICADA', 'Asistencia eliminada por el encargado; registro conservado para auditoría.', 9, '2026-07-08 23:05:00', FALSE, FALSE),
(7, 21, NULL, NULL, 'EN_ESPERA',            'Asistencia eliminada por el encargado; registro conservado para auditoría.', 9, '2026-07-08 23:05:00', FALSE, FALSE),
-- Asistencia 8: Providencia 07-08
(8, 22, '08:05:00', NULL, 'PRESENTE', NULL, NULL, NULL, TRUE, TRUE),
(8, 23, '07:55:00', NULL, 'PRESENTE', NULL, NULL, NULL, TRUE, TRUE),
(8, 24, '08:20:00', NULL, 'ATRASO',   NULL, NULL, NULL, TRUE, TRUE),
(8, 25, '08:10:00', NULL, 'PRESENTE', NULL, NULL, NULL, TRUE, TRUE),
-- Asistencia 9: Municipalidad Viña 07-08
(9, 41, '08:33:00', NULL, 'PRESENTE',           NULL, NULL, NULL, TRUE,  TRUE),
(9, 42, '08:28:00', NULL, 'PRESENTE',           NULL, NULL, NULL, TRUE,  TRUE),
(9, 43, '08:50:00', NULL, 'ATRASO',             NULL, NULL, NULL, TRUE,  TRUE),
(9, 44, NULL,        NULL, 'FALTA_INJUSTIFICADA', 'Cierre automático por scheduler: sin registro al vencer el turno.', NULL, '2026-07-08 17:31:00', FALSE, TRUE),
-- Asistencia 10: Clínica Los Ángeles (histórico, 2025-12-18) -- proyecto finalizado, NO eliminada
(10, 37, '07:00:00', NULL, 'PRESENTE',           NULL, NULL, NULL, TRUE, TRUE),
(10, 38, '07:05:00', NULL, 'PRESENTE',           NULL, NULL, NULL, TRUE, TRUE),
(10, 39, NULL,        NULL, 'FALTA_JUSTIFICADA', 'Certificado médico presentado.', 14, '2025-12-18 09:00:00', FALSE, TRUE),
(10, 40, '07:10:00', NULL, 'PRESENTE',           NULL, NULL, NULL, TRUE, TRUE);

-- ============================================================================
-- 14. SOLICITUD_ASISTENCIA
--     Correcciones pedidas por empleados sobre registros ya cerrados.
-- ============================================================================
INSERT INTO solicitud_asistencia (id_solicitud, id_asistencia, id_empleado, estado_solicitado, hora_ingreso_solicitada, hora_egreso_solicitada, motivo, estado_solicitud, fecha_solicitud, fecha_resolucion, resuelto_por) VALUES
(1, 2, 27, 'PRESENTE', '07:08:00', NULL,       'Llegué a tiempo pero el token no reconoció mi ingreso de inmediato.', 'APROBADO',  '2026-07-08 12:00:00', '2026-07-08 16:00:00', 11),
(2, 2, 28, 'FALTA_JUSTIFICADA', NULL, NULL,    'Tuve una hora médica de urgencia, adjunto certificado.',              'PENDIENTE', '2026-07-08 16:30:00', NULL,                  NULL),
(3, 9, 44, 'FALTA_JUSTIFICADA', NULL, NULL,    'Permiso administrativo autorizado previamente.',                     'RECHAZADO', '2026-07-08 18:00:00', '2026-07-09 10:00:00', 15),
(4, 4, 31, NULL, NULL, '18:45:00',              'Solicito registrar la hora real de salida, quedó mal registrada.',   'PENDIENTE', '2026-07-08 20:00:00', NULL,                  NULL);

-- ============================================================================
-- 15. ITEM (catálogo general -- empresa de aseo)
--     CONSUMO: se gastan con el uso (detergentes, guantes desechables).
--     PRESTAMO: se prestan y vuelven (maquinaria, escobas, paños reutilizables).
--     id_item=17 fue creado a partir de una SOLICITUD aprobada (ver mov. #7-8).
-- ============================================================================
INSERT INTO item (id_item, nombre, descripcion, tipo, unidad_medida, control, activo) VALUES
(1,  'Enceradora Industrial',              'Máquina enceradora/pulidora de pisos.',            'MAQUINARIA', 'UNIDADES', 'PRESTAMO', TRUE),
(2,  'Hidrolavadora a Presión',            'Equipo de lavado a presión para exteriores.',      'MAQUINARIA', 'UNIDADES', 'PRESTAMO', TRUE),
(3,  'Aspiradora Industrial',              'Aspiradora de alta capacidad para grandes superficies.', 'MAQUINARIA', 'UNIDADES', 'PRESTAMO', TRUE),
(4,  'Escoba',                             'Escoba de cerdas estándar.',                       'HERRAMIENTA','UNIDADES', 'PRESTAMO', TRUE),
(5,  'Trapero Industrial',                 'Trapero de mecha para grandes superficies.',       'HERRAMIENTA','UNIDADES', 'PRESTAMO', TRUE),
(6,  'Carro de Limpieza',                  'Carro con compartimentos para insumos y mopa.',    'HERRAMIENTA','UNIDADES', 'PRESTAMO', TRUE),
(7,  'Pala Plástica',                      'Pala recolectora de basura.',                      'HERRAMIENTA','UNIDADES', 'PRESTAMO', TRUE),
(8,  'Guantes de Látex (caja)',            'Caja de guantes desechables de látex.',            'UTENSILIO',  'UNIDADES', 'CONSUMO',  TRUE),
(9,  'Mascarilla Desechable (caja)',       'Caja de mascarillas desechables.',                 'UTENSILIO',  'UNIDADES', 'CONSUMO',  TRUE),
(10, 'Paño de Microfibra',                 'Paño reutilizable para limpieza de superficies.',  'UTENSILIO',  'UNIDADES', 'PRESTAMO', TRUE),
(11, 'Detergente Multiuso',                'Detergente concentrado para pisos y superficies.', 'PRODUCTO',   'LITROS',   'CONSUMO',  TRUE),
(12, 'Cloro Industrial',                   'Hipoclorito de sodio para desinfección.',          'PRODUCTO',   'LITROS',   'CONSUMO',  TRUE),
(13, 'Limpiavidrios',                      'Producto para limpieza de vidrios y superficies transparentes.', 'PRODUCTO', 'LITROS', 'CONSUMO', TRUE),
(14, 'Desinfectante Amonio Cuaternario',   'Desinfectante hospitalario de alto poder germicida.', 'PRODUCTO', 'LITROS',   'CONSUMO',  TRUE),
(15, 'Papel Higiénico Institucional',      'Papel higiénico en formato institucional (fardo).', 'PRODUCTO',  'SACOS',    'CONSUMO',  TRUE),
(16, 'Cera para Piso (descontinuada)',     'Cera antigua reemplazada por línea nueva.',        'PRODUCTO',   'LITROS',   'CONSUMO',  FALSE),
(17, 'Aromatizante Ambiental',             'Aromatizante para espacios cerrados. Item creado a partir de solicitud aprobada.', 'PRODUCTO', 'LITROS', 'CONSUMO', TRUE);

-- ============================================================================
-- 16. ITEM_PROYECTO
--     Vínculo item+proyecto con su propio stock/stock_minimo (el Item del
--     catálogo NO tiene stock propio). Varias filas quedan bajo el mínimo
--     a propósito para poblar la vista de "Bajo Stock". Las filas de los
--     proyectos 5 (finalizado) y 7 (desactivado) quedan con activo=FALSE.
-- ============================================================================
INSERT INTO item_proyecto (id_item, id_proyecto, cantidad, stock_minimo, ultima_revision, activo) VALUES
-- Proyecto 1: Mall Plaza Vespucio
(1,  1, 2,  1,  '2026-07-01 10:00:00', TRUE),
(4,  1, 10, 4,  '2026-07-01 10:00:00', TRUE),
(5,  1, 8,  3,  '2026-07-01 10:00:00', TRUE),
(6,  1, 3,  2,  '2026-07-01 10:00:00', TRUE),
(8,  1, 8,  10, '2026-07-01 10:00:00', TRUE), -- BAJO STOCK
(11, 1, 40, 20, '2026-07-01 10:00:00', TRUE),
(12, 1, 5,  15, '2026-07-05 10:00:00', TRUE), -- BAJO STOCK (se repuso pero el consumo fue alto)
(13, 1, 12, 5,  '2026-07-01 10:00:00', TRUE),
-- Proyecto 2: Torre Providencia
(4,  2, 6,  3,  '2026-06-20 10:00:00', TRUE),
(5,  2, 5,  2,  '2026-06-20 10:00:00', TRUE),
(9,  2, 20, 15, '2026-06-20 10:00:00', TRUE),
(11, 2, 25, 10, '2026-06-20 10:00:00', TRUE),
(14, 2, 18, 8,  '2026-06-20 10:00:00', TRUE),
(15, 2, 30, 10, '2026-06-20 10:00:00', TRUE),
(17, 2, 5,  2,  '2026-06-21 10:00:00', TRUE),
-- Proyecto 3: UBB Concepción (más completo -- proyecto principal)
(1,  3, 3,  1,  '2026-07-01 10:00:00', TRUE),
(2,  3, 2,  1,  '2026-07-01 10:00:00', TRUE),
(3,  3, 4,  2,  '2026-07-01 10:00:00', TRUE),
(4,  3, 15, 6,  '2026-07-01 10:00:00', TRUE),
(5,  3, 12, 5,  '2026-07-01 10:00:00', TRUE),
(6,  3, 5,  2,  '2026-07-01 10:00:00', TRUE),
(8,  3, 25, 15, '2026-07-01 10:00:00', TRUE),
(9,  3, 10, 15, '2026-07-01 10:00:00', TRUE), -- BAJO STOCK
(10, 3, 20, 10, '2026-07-01 10:00:00', TRUE),
(11, 3, 60, 25, '2026-07-01 10:00:00', TRUE),
(12, 3, 30, 15, '2026-07-01 10:00:00', TRUE),
(13, 3, 15, 6,  '2026-07-01 10:00:00', TRUE),
(14, 3, 25, 12, '2026-07-01 10:00:00', TRUE),
(15, 3, 50, 20, '2026-07-01 10:00:00', TRUE),
-- Proyecto 4: Terminal Collao (en preparación -- carga inicial mínima)
(4,  4, 4,  2, '2026-07-15 10:00:00', TRUE),
(11, 4, 10, 5, '2026-07-15 10:00:00', TRUE),
-- Proyecto 6: Municipalidad Viña del Mar
(4,  6, 7,  3,  '2026-06-15 10:00:00', TRUE),
(5,  6, 6,  2,  '2026-06-15 10:00:00', TRUE),
(8,  6, 12, 10, '2026-06-15 10:00:00', TRUE),
(11, 6, 20, 10, '2026-06-15 10:00:00', TRUE),
(12, 6, 8,  10, '2026-06-15 10:00:00', TRUE), -- BAJO STOCK
-- Proyecto 5: Clínica Los Ángeles (finalizado -- items desvinculados)
(14, 5, 0, 10, '2025-12-20 10:00:00', FALSE),
(9,  5, 0, 10, '2025-12-20 10:00:00', FALSE),
-- Proyecto 7: Bodega Quilicura (desactivado -- items desvinculados)
(6,  7, 0, 1, '2026-05-15 10:00:00', FALSE),
(11, 7, 0, 5, '2026-05-15 10:00:00', FALSE);

-- ============================================================================
-- 17. MOVIMIENTO_INVENTARIO
--     Cubre ENTRADA, SALIDA, ABASTECIMIENTO, COMPRA y SOLICITUD (pendiente,
--     aprobada y rechazada).
-- ============================================================================
INSERT INTO movimiento_inventario (id_mov, id_item, item_sugerido, id_proyecto, id_emisor, id_receptor, tipo_movimiento, cantidad, fecha, descripcion, estado_solicitud) VALUES
(1,  1,    NULL,                              1, 9,  NULL, 'ENTRADA',      2,  '2025-11-05 10:00:00', 'Carga inicial de maquinaria al iniciar el proyecto.', NULL),
(2,  12,   NULL,                              1, 9,  17,   'SALIDA',       10, '2026-07-05 09:00:00', 'Consumo semanal aseo de pasillos.',                   NULL),
(3,  12,   NULL,                              1, 4,  NULL, 'COMPRA',       15, '2026-07-02 09:00:00', 'Reposición de stock crítico.',                        NULL),
(4,  9,    NULL,                              3, 11, 26,   'SALIDA',       15, '2026-07-06 07:00:00', 'Entrega para turno mañana.',                          NULL),
(5,  2,    NULL,                              3, 6,  NULL, 'ABASTECIMIENTO', 1, '2026-03-02 09:00:00', 'Reposición de maquinaria dañada.',                    NULL),
(6,  NULL, 'Escalera Telescópica',            3, 11, NULL, 'SOLICITUD',    2,  '2026-07-08 09:15:00', 'Necesaria para limpieza de vidrios altos en biblioteca.', 'PENDIENTE'),
(7,  NULL, 'Aromatizante Ambiental',          2, 10, NULL, 'SOLICITUD',    5,  '2026-06-20 11:00:00', 'Solicitud para mejorar el ambiente en las oficinas.',  'APROBADO'),
(8,  17,   NULL,                              2, 4,  NULL, 'ENTRADA',      5,  '2026-06-21 09:00:00', 'Ingreso del item aprobado a partir de la solicitud #7.', NULL),
(9,  NULL, 'Escoba Industrial de Cerdas Duras', 6, 15, NULL, 'SOLICITUD', 3,  '2026-07-01 10:00:00', 'Para superficies exteriores del municipio.',           'RECHAZADO'),
(10, 12,   NULL,                              6, 15, 41,   'SALIDA',       12, '2026-07-04 09:00:00', 'Consumo de aseo en dependencias municipales.',        NULL),
(11, 4,    NULL,                              4, 6,  NULL, 'ENTRADA',      4,  '2026-07-15 09:00:00', 'Carga inicial previa al inicio de operaciones.',       NULL),
(12, 14,   NULL,                              5, 14, 37,   'SALIDA',       20, '2025-12-10 09:00:00', 'Última desinfección de pabellones antes del cierre.', NULL),
(13, 6,    NULL,                              7, 16, 45,   'SALIDA',       1,  '2026-05-10 09:00:00', 'Uso final antes de la desvinculación del proyecto.',   NULL),
(14, 11,   NULL,                              3, 6,  NULL, 'ENTRADA',      30, '2026-06-01 09:00:00', 'Abastecimiento mensual.',                              NULL),
(15, 11,   NULL,                              3, 11, 27,   'SALIDA',       18, '2026-07-07 07:00:00', 'Consumo aseo de salas de clases.',                    NULL),
(16, NULL, 'Pulidora de Piso Flotante',       1, 9,  NULL, 'SOLICITUD',    1,  '2026-07-09 08:00:00', 'Para mantención de pisos de mármol en el mall.',      'PENDIENTE'),
(17, 3,    NULL,                              3, 6,  NULL, 'COMPRA',       1,  '2026-04-10 09:00:00', 'Compra de unidad adicional por alta demanda.',        NULL),
(18, 9,    NULL,                              2, 10, NULL, 'ABASTECIMIENTO', 10, '2026-06-15 09:00:00', 'Reposición trimestral.',                            NULL);

-- ============================================================================
-- 18. NOTIFICACION
-- ============================================================================
INSERT INTO notificacion (id_notificacion, id_usuario_destinatario, tipo, tipo_referencia, id_referencia, mensaje, leido, resuelto, fecha) VALUES
(1,  6,  'SOLICITUD_PENDIENTE',  'MOVIMIENTO_INVENTARIO', 6,  'Nueva solicitud de item: Escalera Telescópica (UBB Concepción).',            FALSE, FALSE, '2026-07-08 09:15:00'),
(2,  10, 'SOLICITUD_APROBADA',   'MOVIMIENTO_INVENTARIO', 7,  'Tu solicitud de Aromatizante Ambiental fue aprobada.',                        TRUE,  TRUE,  '2026-06-21 09:00:00'),
(3,  15, 'SOLICITUD_RECHAZADA',  'MOVIMIENTO_INVENTARIO', 9,  'Tu solicitud de Escoba Industrial de Cerdas Duras fue rechazada.',            TRUE,  TRUE,  '2026-07-02 10:00:00'),
(4,  4,  'SOLICITUD_PENDIENTE',  'MOVIMIENTO_INVENTARIO', 16, 'Nueva solicitud de item: Pulidora de Piso Flotante (Mall Plaza Vespucio).',   FALSE, FALSE, '2026-07-09 08:00:00'),
(5,  27, 'SOLICITUD_ASISTENCIA', 'SOLICITUD_ASISTENCIA',  1,  'Tu solicitud de corrección de asistencia fue aprobada.',                      FALSE, TRUE,  '2026-07-08 16:05:00'),
(6,  11, 'SOLICITUD_ASISTENCIA', 'SOLICITUD_ASISTENCIA',  2,  'Nueva solicitud de corrección de asistencia pendiente de revisión.',          FALSE, FALSE, '2026-07-08 16:31:00'),
(7,  44, 'SOLICITUD_ASISTENCIA', 'SOLICITUD_ASISTENCIA',  3,  'Tu solicitud de corrección de asistencia fue rechazada.',                     FALSE, TRUE,  '2026-07-09 10:05:00'),
(8,  15, 'SOLICITUD_ASISTENCIA', 'SOLICITUD_ASISTENCIA',  4,  'Nueva solicitud de ajuste de hora de egreso pendiente de revisión.',          TRUE,  FALSE, '2026-07-08 20:01:00'),
(9,  2,  'SOLICITUD_PASSWORD',   'USUARIO',               33, 'El usuario Renata Bustos solicitó restablecer su contraseña.',                FALSE, FALSE, '2026-07-09 07:40:00'),
(10, 9,  'SOLICITUD_PENDIENTE',  'MOVIMIENTO_INVENTARIO', 16, 'Recordatorio: tu solicitud de Pulidora de Piso Flotante sigue pendiente.',    FALSE, FALSE, '2026-07-09 09:00:00');

-- ============================================================================
-- 19. RESINCRONIZAR SECUENCIAS
--     Como insertamos IDs explícitos, hay que adelantar las secuencias
--     SERIAL/IDENTITY de cada tabla con PK autogenerada; si no, el próximo
--     INSERT hecho por la aplicación (sin ID explícito) podría chocar con
--     estos registros. Las tablas con PK compuesta (proyecto_usuario,
--     turno_empleado, asistencia_empleado, item_proyecto) no tienen
--     secuencia, así que no aplica.
-- ============================================================================
SELECT setval(pg_get_serial_sequence('usuario', 'id_usuario'), (SELECT MAX(id_usuario) FROM usuario));
SELECT setval(pg_get_serial_sequence('proyecto', 'id_proyecto'), (SELECT MAX(id_proyecto) FROM proyecto));
SELECT setval(pg_get_serial_sequence('categoria', 'id_cat'), (SELECT MAX(id_cat) FROM categoria));
SELECT setval(pg_get_serial_sequence('actividad', 'id_act'), (SELECT MAX(id_act) FROM actividad));
SELECT setval(pg_get_serial_sequence('programar_tarea', 'id_tarea'), (SELECT MAX(id_tarea) FROM programar_tarea));
SELECT setval(pg_get_serial_sequence('asignacion_tarea', 'id_asignacion'), (SELECT MAX(id_asignacion) FROM asignacion_tarea));
SELECT setval(pg_get_serial_sequence('evaluacion_desempeno', 'id_evaluacion'), (SELECT MAX(id_evaluacion) FROM evaluacion_desempeno));
SELECT setval(pg_get_serial_sequence('turno', 'id_turno'), (SELECT MAX(id_turno) FROM turno));
SELECT setval(pg_get_serial_sequence('asistencia', 'id_asistencia'), (SELECT MAX(id_asistencia) FROM asistencia));
SELECT setval(pg_get_serial_sequence('solicitud_asistencia', 'id_solicitud'), (SELECT MAX(id_solicitud) FROM solicitud_asistencia));
SELECT setval(pg_get_serial_sequence('calificacion_empleado', 'id_calificacion'), (SELECT MAX(id_calificacion) FROM calificacion_empleado));
SELECT setval(pg_get_serial_sequence('item', 'id_item'), (SELECT MAX(id_item) FROM item));
SELECT setval(pg_get_serial_sequence('movimiento_inventario', 'id_mov'), (SELECT MAX(id_mov) FROM movimiento_inventario));
SELECT setval(pg_get_serial_sequence('notificacion', 'id_notificacion'), (SELECT MAX(id_notificacion) FROM notificacion));

COMMIT;
