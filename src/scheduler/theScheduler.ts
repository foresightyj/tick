import path from "path";
import Scheduler from "./Scheduler";
const isDevelopment = process.env.NODE_ENV !== 'production';

const dbPath = path.join(app.getPath("home"), "_tick_schedules_.db");
const dbConnection = connMaker(isDevelopment ? undefined : dbPath);

const scheduler = new Scheduler(dbConnection);
(global as any).scheduler = scheduler;
