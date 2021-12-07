import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class OldStatus extends BaseEntity {
    @Field(_type => ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    status!: string;

    @Field()
    @Column()
    status_id!: number;

    @Field()
    @CreateDateColumn()
    createdAt!: Date;

}