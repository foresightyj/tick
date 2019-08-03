import { getConnectionOptions, createConnection } from "typeorm";
import "reflect-metadata";

import { User } from "../entity/User";
import { Schedule } from "../entity/Schedule";

export default createConnection({
    type: "sqlite",
    database: "schedules.db",
    synchronize: true,
    logging: true,
    entities: [User, Schedule],
});