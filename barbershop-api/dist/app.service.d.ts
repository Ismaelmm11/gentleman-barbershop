import { Kysely } from 'kysely';
import { DB } from './database/db.types';
export declare class AppService {
    private readonly db;
    private readonly logger;
    constructor(db: Kysely<DB>);
    getHello(): string;
    checkDbConnection(): Promise<{
        status: string;
        message: string;
    }>;
}
