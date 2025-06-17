-- =================================================================================
-- Script de Modificaciones para Gentleman Barbershop
-- Versión: 2.0
-- Fecha: 17 de Junio, 2025
-- Descripción: Este script modifica las tablas.
-- =================================================================================

-- Usamos la base de datos que creamos previamente.
USE gentleman_barbershop_db;

-- --- Tablas Principales y de Negocio ---

ALTER TABLE usuario ADD CONSTRAINT uk_usuario_username UNIQUE (username);

-- 1. Crear la tabla para la lista negra de tokens.
-- `jti` es el ID único del JWT. Lo haremos nuestra clave primaria.
-- `fecha_expiracion` nos servirá para la limpieza automática.
CREATE TABLE `token_blocklist` (
  `jti` VARCHAR(255) NOT NULL,
  `fecha_expiracion` DATETIME NOT NULL,
  PRIMARY KEY (`jti`)
);

-- 2. Habilitar el planificador de eventos de MySQL (si no está ya activo).
-- Necesitas permisos de SUPER para ejecutar esto. Solo se hace una vez.
SET GLOBAL event_scheduler = ON;

-- 3. Crear el evento de limpieza automática.
-- Este "barrendero" se ejecutará cada día para limpiar tokens caducados.
CREATE EVENT `limpiar_tokens_caducados`
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  DELETE FROM `token_blocklist` WHERE `fecha_expiracion` < NOW();



-- =================================================================================
-- Fin del Script de Modificaciones
-- =================================================================================