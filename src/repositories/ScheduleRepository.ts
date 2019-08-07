import { EntityRepository, Repository } from "typeorm";
import { Schedule } from "../entity/Schedule";

@EntityRepository(Schedule)
export default class ScheduleRepository extends Repository<Schedule> {
    public findAfterDate(date: Date): Promise<Schedule[]> {
        return this.createQueryBuilder("schedule")
            .where("DATE(schedule.due) >= :d", { d: date })
            .orderBy("schedule.due", "ASC")
            .getMany();
    }
    public findUnCompletedBeforeDate(date: Date): Promise<Schedule[]> {
        return this.createQueryBuilder("schedule")
            .where("NOT schedule.uncompleted")
            .where("DATE(schedule.due) < :d", { d: date })
            .orderBy("schedule.due", "ASC")
            .getMany();
    }
}
