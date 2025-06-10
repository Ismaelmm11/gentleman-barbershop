import { Kysely } from 'kysely';
import { DB } from './db.types';
export declare const DATABASE_TOKEN = "KYSELY_INSTANCE";
export declare const databaseProvider: {
    provide: string;
    useFactory: () => Kysely<DB>;
};
