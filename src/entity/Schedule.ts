import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Schedule {

    @PrimaryGeneratedColumn({ type: "int" })
    public id: number;

    @CreateDateColumn()
    public created: Date;

    @UpdateDateColumn()
    public modified: Date;

    @Column({ type: "datetime" })
    public due: Date;

    @Column({ type: "varchar", length: 1000, default: "buy stuff" })
    public task: string;

    @Column({ nullable: true })
    public attended?: boolean;

    get delta() {
        return (this.due.getTime() - new Date().getTime()) / 1000;
    }

    public static create(due: Date, task: string) {
        const s = new Schedule();
        s.due = due;
        s.task = task;
        return s;
    }
}
