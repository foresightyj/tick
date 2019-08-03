import { getConnectionOptions, createConnection } from "typeorm";
import "reflect-metadata";

import { User } from "../entity/User";
import { Schedule } from "../entity/Schedule";


export default createConnection({
    type: "mssql",
    host: "192.168.0.112",
    database: "db009",
    username: "fht360",
    password: "fht#^)2014",
    synchronize: true,
    logging: true,
    entities: [User, Schedule],
});