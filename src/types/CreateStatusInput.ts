import { Field, InputType } from "type-graphql";

@InputType()
export class CreateStatusInput {
    @Field()
    status: string;

    @Field()
    user_id: number;
}