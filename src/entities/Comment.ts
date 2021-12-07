import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    comment!: string;

    @Column({ unique: true })
    user_id!: number;

    @Column()
    status_id!: number;

    @Column()
    likes!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}