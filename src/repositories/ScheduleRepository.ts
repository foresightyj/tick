import { EntityRepository, Repository } from "typeorm";
import { Schedule } from "../entity/Schedule";

@EntityRepository(Schedule)
export default class UserRepository extends Repository<Schedule> {
}
