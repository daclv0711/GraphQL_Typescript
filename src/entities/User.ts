import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Length } from "class-validator";

@ObjectType()
@Entity() //db table
export class User extends BaseEntity {
    @Field(_type => ID)
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    @Length(2, 9)
    first_name!: string

    @Field()
    @Column()
    @Length(2, 9)
    last_name!: string

    @Field()
    @Column({ unique: true })
    email!: string

    @Field()
    @Column({ default: '' })
    avatar!: string

    @Column()
    password!: string

    @Field()
    @Column({ default: '1' })
    role!: string

    @Field()
    @CreateDateColumn()
    createdAt!: Date

    @Field()
    @UpdateDateColumn()
    updatedAt!: Date

};