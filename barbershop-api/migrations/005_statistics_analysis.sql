-- =================================================================================
-- Script de Migración Inicial para Gentleman Barbershop
-- Versión: 5.0
-- Fecha: 09 de JuLio, 2025
-- Descripción:  Script añadir vistas para poder registrar estadísticas.
-- =================================================================================

-- Eliminar la vista original.
drop view VISTA_DIARIA_BARBERO;

CREATE OR REPLACE VIEW v_analiticas_diarias_profesional AS
SELECT
    -- La fecha es nuestro principal eje de agrupación
    DATE(c.fecha_hora_inicio) AS fecha,
    
    -- Campos de fecha adicionales para filtrar fácil
    YEAR(c.fecha_hora_inicio) AS anio,
    MONTH(c.fecha_hora_inicio) AS mes,
    WEEK(c.fecha_hora_inicio, 1) AS semana_del_anio,
    
    -- Información del profesional
    profesional.id AS profesional_id,
    CONCAT(profesional.nombre, ' ', profesional.apellidos) AS profesional_nombre,
    perfil.tipo AS profesional_tipo,
    
    -- Métricas agregadas (La clave de la vista)
    COUNT(c.id) AS total_citas_dia,
    SUM(c.precio_final) AS ingresos_diarios,
    AVG(c.precio_final) AS ticket_promedio_dia
FROM
    cita c
JOIN
    usuario AS profesional ON c.id_barbero = profesional.id
JOIN
    perfil ON profesional.id = perfil.id_usuario
WHERE
    -- ¡Importante! Solo contamos las citas completadas
    c.estado = 'CERRADO' 
    -- Incluimos a todos los profesionales que generan ingresos
    AND perfil.tipo IN ('BARBERO', 'TATUADOR') 
GROUP BY
    -- Agrupamos por día y por profesional
    fecha,
    profesional.id,
    profesional_nombre,
    profesional_tipo;


CREATE OR REPLACE VIEW v_analiticas_diarias_servicio AS
SELECT
    DATE(c.fecha_hora_inicio) AS fecha,
    s.id AS servicio_id,
    s.nombre AS servicio_nombre,
    COUNT(s.id) AS veces_usado_dia,
    SUM(c.precio_final) AS ingresos_por_servicio_dia
FROM
    cita c
JOIN
    servicio s ON c.id_servicio = s.id
WHERE
    c.estado = 'CERRADO'
GROUP BY
    fecha,
    s.id,
    s.nombre;


CREATE OR REPLACE VIEW v_analiticas_clientes AS
SELECT
    c.id_cliente,
    -- Unimos con la tabla de usuario para obtener el nombre del cliente
    CONCAT(u.nombre, ' ', u.apellidos) AS nombre_completo_cliente,
    
    -- Métricas clave para el ranking
    COUNT(c.id) AS total_visitas,
    SUM(c.precio_final) AS gasto_total,
    AVG(c.precio_final) AS gasto_promedio_por_visita,
    
    -- Métricas de retención
    MIN(c.fecha_hora_inicio) AS fecha_primera_visita,
    MAX(c.fecha_hora_inicio) AS fecha_ultima_visita
FROM
    cita c
JOIN
    usuario u ON c.id_cliente = u.id
WHERE
    -- Solo contamos citas completadas y que tengan un cliente asociado
    c.estado = 'CERRADO' AND c.id_cliente IS NOT NULL
GROUP BY
    c.id_cliente,
    nombre_completo_cliente;


-- =================================================================================
-- Fin del Script
-- =================================================================================


CREATE OR REPLACE VIEW v_analiticas_diarias_profesional AS
SELECT
    -- Columnas de fecha
    DATE(c.fecha_hora_inicio) AS fecha,
    YEAR(c.fecha_hora_inicio) AS anio,
    MONTH(c.fecha_hora_inicio) AS mes,
    WEEK(c.fecha_hora_inicio, 1) AS semana_del_anio,
    
    -- Columnas del profesional
    profesional.id AS profesional_id,
    CONCAT(profesional.nombre, ' ', profesional.apellidos) AS profesional_nombre,
    perfil.tipo AS profesional_tipo,
    
    -- Métricas agregadas
    COUNT(c.id) AS total_citas_dia,
    SUM(c.precio_final) AS ingresos_diarios
FROM
    cita c
JOIN
    usuario AS profesional ON c.id_barbero = profesional.id
JOIN
    perfil ON profesional.id = perfil.id_usuario
WHERE
    -- Solo contamos las citas completadas
    c.estado = 'CERRADO' 
    -- Y solo de los roles que generan ingresos en citas
    AND perfil.tipo IN ('BARBERO', 'TATUADOR') 
GROUP BY
    -- CORRECCIÓN: Agrupamos por el día y por el ID del profesional.
    -- El resto de columnas (año, mes, nombre, etc.) dependen directamente
    -- de estas dos, por lo que esta agrupación es correcta y completa.
    DATE(c.fecha_hora_inicio),
    profesional.id;