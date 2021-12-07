import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, UpdateDateColumn, JoinColumn } from "typeorm";
import { User } from "./User";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Status extends BaseEntity {
    @Field(_type => ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    status!: string;

    @Field()
    @Column()
    user_id!: number;

    @Field(_type => Status)
    @OneToMany(() => Status, stt => stt.status)
    @JoinColumn({ name: "status" })
    old_status!: Status[];

    @Field(_type => User)
    @OneToMany(() => User, user => user.id)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    likes!: User[];

    @Field()
    @CreateDateColumn()
    createdAt!: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt!: Date;
}