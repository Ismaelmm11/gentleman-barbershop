-- =================================================================================
-- Script de Migración Inicial para Gentleman Barbershop
-- Versión: 1.0
-- Fecha: 09 de Junio, 2025
-- Descripción: Este script crea toda la estructura de tablas y vistas
--              necesaria para la primera versión de la aplicación.
-- =================================================================================

-- Usamos la base de datos que creamos previamente.
USE gentleman_barbershop_db;

-- --- Tablas Principales y de Negocio ---

CREATE TABLE `usuario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `apellidos` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NULL,
  `password` VARCHAR(255) NULL,
  `telefono` VARCHAR(20) NOT NULL,
  `fecha_nacimiento` DATE NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `perfil` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `tipo` ENUM('ADMIN', 'BARBERO', 'TATUADOR', 'CLIENTE') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_perfil_id_usuario` (`id_usuario`),
  CONSTRAINT `fk_perfil_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `servicio` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `duracion_minutos` INT NOT NULL,
  `precio_base` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `cita` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_barbero` INT NOT NULL,
  `id_cliente` INT NULL,
  `id_servicio` INT NULL,
  `fecha_hora_inicio` DATETIME NOT NULL,
  `fecha_hora_fin` DATETIME NOT NULL,
  `precio_final` DECIMAL(10, 2) NULL,
  `estado` ENUM('PENDIENTE', 'CERRADO', 'CANCELADO', 'DESCANSO') NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_cita_barbero` FOREIGN KEY (`id_barbero`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_cita_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cita_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);


-- --- Tablas de Tienda y Productos ---

CREATE TABLE `marca` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `categoria` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `producto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `precio` DECIMAL(10, 2) NOT NULL,
  `id_categoria` INT NOT NULL,
  `id_marca` INT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_producto_marca` FOREIGN KEY (`id_marca`) REFERENCES `marca` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE `media` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_producto` INT NOT NULL,
  `tipo` ENUM('IMAGEN', 'VIDEO') NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `es_principal` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_media_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `pedido` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_cliente` INT NOT NULL,
  `precio_final` DECIMAL(10, 2) NOT NULL,
  `fecha_pedido` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_pedido_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);


-- --- Tablas de Relación (N:M) ---

CREATE TABLE `producto_pedido` (
  `id_pedido` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `unidades` INT NOT NULL,
  `precio_unitario` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id_pedido`, `id_producto`),
  CONSTRAINT `fk_pp_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pp_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE `cita_producto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_cita` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `precio_venta` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_cp_cita` FOREIGN KEY (`id_cita`) REFERENCES `cita` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cp_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- --- Creación de la Vista para Analíticas ---

CREATE OR REPLACE VIEW VISTA_DIARIA_BARBERO AS
SELECT
    DATE(c.fecha_hora_inicio) AS fecha,
    c.id_barbero,
    CONCAT(u.nombre, ' ', u.apellidos) AS nombre_completo_barbero,
    COUNT(c.id) AS total_citas,
    SUM(c.precio_final) AS ingresos_totales,
    AVG(c.precio_final) AS ticket_medio_por_cita,
    COUNT(cp.id) AS productos_vendidos_en_citas
FROM
    CITA c
JOIN
    USUARIO u ON c.id_barbero = u.id
LEFT JOIN
    CITA_PRODUCTO cp ON c.id = cp.id_cita
WHERE
    c.estado = 'CERRADO'
GROUP BY
    fecha,
    c.id_barbero,
    nombre_completo_barbero;


-- =================================================================================
-- Fin del Script de Migración Inicial
-- =================================================================================
