import { getConnectionOptions, createConnection } from "typeorm";
import "reflect-metadata";

import { User } from "./entity/User";

//see https://github.com/typeorm/typeorm/issues/3152
(async () => {
    console.log('test orm is running');
    // const connectionOptions = await getConnectionOptions();
    // console.log('connectionOptions', connectionOptions);
    const connection = await createConnection({
        type: "sqlite",
        database: "tick.db",
        synchronize: true,
        logging: true,
        entities: [User],
    });
    console.log("Inserting a new user into the database...");
    const user = new User();
    user.firstName = "Timber";
    user.lastName = "Saw";
    user.age = 25;
    await connection.manager.save(user);
    console.log("Saved a new user with id: " + user.id);

    console.log("Loading users from the database...");
    const users = await connection.manager.find(User);
    console.log("Loaded users: ", users);

    console.log("Here you can setup and run express/koa/any other framework.");
})();
