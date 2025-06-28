import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { CreateRecurringBlockDto } from './dto/create-recurring-block.dto';
import { UpdateRecurringBlockDto } from './dto/update-recurring-block.dto';
export declare class RecurringBlocksService {
    private readonly db;
    constructor(db: Kysely<DB>);
    create(userId: number, createDto: CreateRecurringBlockDto): Promise<{
        hora_inicio: string;
        hora_fin: string;
        titulo: string | null;
        id: number;
        id_usuario: number;
        dia_semana: number;
    }[]>;
    findAllForUser(userId: number): Promise<{
        hora_inicio: string;
        hora_fin: string;
        titulo: string | null;
        id: number;
        id_usuario: number;
        dia_semana: number;
    }[]>;
    update(blockId: number, userId: number, updateDto: UpdateRecurringBlockDto): Promise<{
        hora_inicio: string;
        hora_fin: string;
        titulo: string | null;
        id: number;
        id_usuario: number;
        dia_semana: number;
    }>;
    remove(blockId: number, userId: number): Promise<{
        message: string;
    }>;
    private findOne;
    private validateTimeRange;
    private verifyOwnership;
}
