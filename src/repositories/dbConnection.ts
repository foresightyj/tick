import { getConnectionOptions, createConnection } from "typeorm";
import "reflect-metadata";

import { Schedule } from "../entity/Schedule";

const isDevelopment = process.env.NODE_ENV !== 'production';

export default () => createConnection({
    type: "sqlite",
    database: "schedules.db",
    synchronize: true,
    logging: isDevelopment,
    entities: [Schedule],
});