import { RecurringBlocksService } from './recurring-blocks.service';
import { CreateRecurringBlockDto } from './dto/create-recurring-block.dto';
import { UpdateRecurringBlockDto } from './dto/update-recurring-block.dto';
export declare class RecurringBlocksController {
    private readonly recurringBlocksService;
    constructor(recurringBlocksService: RecurringBlocksService);
    create(user: {
        userId: number;
    }, createRecurringBlockDto: CreateRecurringBlockDto): Promise<{
        hora_inicio: string;
        hora_fin: string;
        titulo: string | null;
        id: number;
        id_usuario: number;
        dia_semana: number;
    }[]>;
    findAllForUser(user: {
        userId: number;
    }): Promise<{
        hora_inicio: string;
        hora_fin: string;
        titulo: string | null;
        id: number;
        id_usuario: number;
        dia_semana: number;
    }[]>;
    update(id: number, user: {
        userId: number;
    }, updateRecurringBlockDto: UpdateRecurringBlockDto): Promise<{
        hora_inicio: string;
        hora_fin: string;
        titulo: string | null;
        id: number;
        id_usuario: number;
        dia_semana: number;
    }>;
    remove(id: number, user: {
        userId: number;
    }): Promise<{
        message: string;
    }>;
}
