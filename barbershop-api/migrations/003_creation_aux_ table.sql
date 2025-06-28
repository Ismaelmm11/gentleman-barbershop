-- =================================================================================
-- Script de Migración Inicial para Gentleman Barbershop
-- Versión: 1.0
-- Fecha: 09 de Junio, 2025
-- Descripción:  Script de Creación de la Tabla horario_bloqueado_recurrente
--               Este script SQL define la tabla necesaria para almacenar los descansos y bloqueos de tiempo recurrentes que cada barbero puede configurar.
-- =================================================================================



-- Usamos la base de datos principal de la aplicación.
USE gentleman_barbershop_db;

-- =================================================================================
-- Tabla para Bloqueos de Horario Recurrentes
-- Versión: 1.1
-- Descripción: Almacena los bloqueos de tiempo que se repiten cada semana
--              para un usuario específico (ej: "Pausa para comer todos los martes de 14:00 a 15:00").
-- =================================================================================

CREATE TABLE `horario_bloqueado_recurrente` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `dia_semana` INT NOT NULL COMMENT 'Representación numérica del día: 1 para Lunes, 2 para Martes, ..., 7 para Domingo.',
  `hora_inicio` TIME NOT NULL COMMENT 'La hora de inicio del bloqueo. Se almacena como TIME (HH:MM:SS) pero se tratará como HH:MM en la lógica de la aplicación.',
  `hora_fin` TIME NOT NULL COMMENT 'La hora de fin del bloqueo. Se almacena como TIME (HH:MM:SS) pero se tratará como HH:MM en la lógica de la aplicación.',
  `titulo` VARCHAR(100) NULL COMMENT 'Un título opcional para el bloqueo, ej: Pausa para comer.',

  -- Creamos una clave foránea para asegurar que el bloqueo siempre esté asociado a un usuario existente.
  -- Si el usuario se elimina, sus bloqueos recurrentes se eliminarán en cascada. 

  PRIMARY KEY (`id`),
  CONSTRAINT `fk_horario_usuario` 
    FOREIGN KEY (`id_usuario`) 
    REFERENCES `usuario` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT 'Tabla para almacenar los descansos y bloqueos de tiempo recurrentes por usuario y día de la semana.';




-- =================================================================================
-- NOTA SOBRE LOS DESCANSOS POR DEFECTO (LUNES Y DOMINGO)
-- =================================================================================
-- La regla de que "por defecto, Lunes y Domingo son días de descanso" se manejará de la siguiente manera:
-- Cuando un NUEVO usuario con el rol de 'BARBERO' o 'TATUADOR' se registre,
-- nuestro `UsersService` creará automáticamente dos entradas en esta tabla para ese usuario,
-- cubriendo la jornada laboral completa que hemos definido.
--
-- 1. Un bloqueo para el Lunes (dia_semana=1) de 06:00:00 a 23:59:59.
-- 2. Un bloqueo para el Domingo (dia_semana=7) de 06:00:00 a 23:59:59.
--
-- De esta forma, cada nuevo barbero empieza con esos descansos ya configurados,
-- pero como son simples filas en la tabla, tendrá la libertad de modificarlos
-- o eliminarlos más adelante a través de su panel de gestión.
-- =================================================================================

CREATE TABLE `otp_codes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_cita_provisional` INT NOT NULL COMMENT 'El ID de la cita en estado PENDIENTE_CONFIRMACION a la que está asociado este código.',
  `codigo` VARCHAR(10) NOT NULL COMMENT 'El código de 6 dígitos que se envía al usuario.',
  `fecha_expiracion` DATETIME NOT NULL COMMENT 'La fecha y hora en que este código dejará de ser válido (ej: 10 minutos después de su creación).',
  `intentos` INT NOT NULL DEFAULT 0 COMMENT 'Contador de intentos fallidos de verificación.',
  
  PRIMARY KEY (`id`),
  
  -- Creamos un índice en id_cita_provisional para que las búsquedas sean rápidas.
  INDEX `idx_otp_cita` (`id_cita_provisional`),
  
  -- NOTA: No enlazamos con clave foránea a la tabla `cita` para mantener este
  -- sistema desacoplado. La lógica de la aplicación se encargará de la integridad.
  -- Tampoco enlazamos a `usuario` para permitir que clientes completamente nuevos
  -- puedan recibir un código antes de que su usuario se considere "totalmente" activo.
) COMMENT 'Tabla temporal para almacenar los códigos de verificación (OTP).';

-- Este comando modifica la columna `estado` en la tabla `cita`
-- para añadir el nuevo estado 'PENDIENTE_CONFIRMACION' a la lista
-- de valores permitidos por el ENUM.

ALTER TABLE `cita` 
MODIFY COLUMN `estado` ENUM(
    'PENDIENTE_CONFIRMACION', 
    'PENDIENTE', 
    'CERRADO', 
    'CANCELADO', 
    'DESCANSO'
) NOT NULL;

-- Este comando añade una nueva columna a la tabla `otp_codes` para
-- almacenar temporalmente los datos de un nuevo cliente como un texto JSON.
-- Esto es crucial para poder crear el usuario DESPUÉS de la verificación OTP.

ALTER TABLE `otp_codes`
ADD COLUMN `datos_cliente_json` TEXT NULL 
COMMENT 'Almacena los datos del nuevo cliente en formato JSON, a la espera de la confirmación.' 
AFTER `intentos`;
