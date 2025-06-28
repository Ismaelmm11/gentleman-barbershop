// barbershop-api/src/recurring-blocks/recurring-blocks.service.ts
import { Inject, Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { DATABASE_TOKEN } from '../database/database.provider';
import { CreateRecurringBlockDto } from './dto/create-recurring-block.dto';
import { UpdateRecurringBlockDto } from './dto/update-recurring-block.dto';

@Injectable()
export class RecurringBlocksService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Kysely<DB>) {}

  /**
   * Crea uno o más registros de bloqueo recurrente.
   * Por cada día en el array `dias_semana`, se crea una fila en la base de datos.
   */
  async create(userId: number, createDto: CreateRecurringBlockDto) {
    this.validateTimeRange(createDto.hora_inicio, createDto.hora_fin);

    const valuesToInsert = createDto.dias_semana.map((dia) => ({
      id_usuario: userId,
      dia_semana: dia,
      hora_inicio: createDto.hora_inicio,
      hora_fin: createDto.hora_fin,
      titulo: createDto.titulo,
    }));

    await this.db
      .insertInto('horario_bloqueado_recurrente')
      .values(valuesToInsert)
      .execute();

    // Devuelve todos los bloques del usuario para que el frontend pueda actualizar su vista.
    return this.findAllForUser(userId);
  }

  /**
   * Devuelve todos los bloqueos recurrentes de un usuario.
   */
  async findAllForUser(userId: number) {
    return this.db
      .selectFrom('horario_bloqueado_recurrente')
      .selectAll()
      .where('id_usuario', '=', userId)
      .orderBy('dia_semana', 'asc')
      .orderBy('hora_inicio', 'asc')
      .execute();
  }

  /**
   * Actualiza UN ÚNICO registro de bloqueo recurrente por su ID.
   */
  async update(blockId: number, userId: number, updateDto: UpdateRecurringBlockDto) {
    // 1. Asegurarse de que el bloqueo existe y pertenece al usuario.
    const block = await this.verifyOwnership(blockId, userId);

    // 2. Validar el rango de tiempo si se proporcionan nuevas horas.
    const startTime = updateDto.hora_inicio || block.hora_inicio;
    const endTime = updateDto.hora_fin || block.hora_fin;
    this.validateTimeRange(startTime, endTime);
    
    // 3. Ejecutar la actualización en la base de datos.
    const { dias_semana, ...updateData } = updateDto; // Ignoramos dias_semana en el update individual
    await this.db
      .updateTable('horario_bloqueado_recurrente')
      .set(updateData)
      .where('id', '=', blockId)
      .execute();

    return this.findOne(blockId);
  }

  /**
   * Elimina UN ÚNICO registro de bloqueo recurrente por su ID.
   */
  async remove(blockId: number, userId: number) {
    await this.verifyOwnership(blockId, userId);

    const result = await this.db
      .deleteFrom('horario_bloqueado_recurrente')
      .where('id', '=', blockId)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      throw new NotFoundException(`Bloqueo con ID ${blockId} no encontrado.`);
    }

    return { message: `Bloqueo con ID ${blockId} eliminado correctamente.` };
  }

  // --- MÉTODOS PRIVADOS DE AYUDA (HELPERS) ---

  private async findOne(blockId: number) {
    const block = await this.db
      .selectFrom('horario_bloqueado_recurrente')
      .selectAll()
      .where('id', '=', blockId)
      .executeTakeFirst();
    if (!block) {
      throw new NotFoundException(`Bloqueo con ID ${blockId} no encontrado.`);
    }
    return block;
  }

  private validateTimeRange(startTime: string, endTime: string) {
    if (startTime >= endTime) {
      throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio.');
    }
  }

  private async verifyOwnership(blockId: number, userId: number) {
    const block = await this.findOne(blockId);
    if (block.id_usuario !== userId) {
      throw new ForbiddenException('No tienes permiso para modificar este bloqueo.');
    }
    return block;
  }
}
