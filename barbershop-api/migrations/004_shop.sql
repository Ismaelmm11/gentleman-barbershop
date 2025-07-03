-- =================================================================================
-- Script de Migración Inicial para Gentleman Barbershop
-- Versión: 4.0
-- Fecha: 03 de JuLio, 2025
-- Descripción:  Script para modificar las tablas de la tienda.
-- =================================================================================

-- Añadir la columna para la imagen de la marca
ALTER TABLE `marca`
ADD COLUMN `url_imagen` VARCHAR(255) NULL 
COMMENT 'URL de la imagen representativa de la marca, alojada en un servicio externo.' 
AFTER `nombre`;

-- Añadir la columna para la imagen de la categoría
ALTER TABLE `categoria`
ADD COLUMN `url_imagen` VARCHAR(255) NULL 
COMMENT 'URL de la imagen representativa de la categoría, alojada en un servicio externo.' 
AFTER `nombre`;