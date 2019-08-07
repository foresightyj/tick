import { getConnectionOptions, createConnection } from "typeorm";
import "reflect-metadata";

import { User } from "../entity/User";
import { Schedule } from "../entity/Schedule";

const isDevelopment = process.env.NODE_ENV !== 'production';

export default () => createConnection({
    type: "sqlite",
    database: "schedules.db",
    synchronize: true,
    logging: isDevelopment,
    entities: [User, Schedule],
});