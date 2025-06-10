"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseProvider = exports.DATABASE_TOKEN = void 0;
const kysely_1 = require("kysely");
const mysql2_1 = require("mysql2");
exports.DATABASE_TOKEN = 'KYSELY_INSTANCE';
exports.databaseProvider = {
    provide: exports.DATABASE_TOKEN,
    useFactory: () => {
        const dialect = new kysely_1.MysqlDialect({
            pool: (0, mysql2_1.createPool)({
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT || '3306', 10),
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                connectionLimit: 10,
            }),
        });
        const db = new kysely_1.Kysely({
            dialect,
        });
        return db;
    },
};
//# sourceMappingURL=database.provider.js.map