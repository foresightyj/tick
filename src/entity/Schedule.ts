import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { urlReplacer } from '../utils';

const __tablename__ = "schedule";

//see https://github.com/typeorm/typeorm/issues/2104
@Entity(__tablename__)
export class Schedule {

    @PrimaryGeneratedColumn({ type: "int" })
    public id: number;

    @CreateDateColumn({})
    @Index()
    public created: Date;

    @UpdateDateColumn()
    @Index()
    public modified: Date;

    @Column({ type: "datetime" })
    @Index()
    public due: Date;

    @Column({ type: "varchar", length: 1000, default: "buy stuff" })
    public task: string;

    @Column({ type: "varchar", length: 1000, default: "{}" })
    public linkTitles: string; //a json

    @Column({ nullable: true })
    public completed?: boolean;

    get delta() {
        return (this.due.getTime() - new Date().getTime()) / 1000;
    }
    get isDue(){
        return this.due < new Date();
    }
    get friendlyDelta() {
        const delta = this.delta;
        return delta < 3600 ? (Math.floor(delta / 60) + " min") : (Math.floor(delta / 3600) + " hr " + (Math.floor(delta % 3600 / 60) + " min"))
    }
    public static create(due: Date, task: string) {
        const s = new Schedule();
        s.due = due;
        s.task = task;
        return s;
    }
}
