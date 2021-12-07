import { Field, ID, InputType } from "type-graphql";

@InputType()
export class UpdateStatusInput {
    @Field(_type => ID)
    id: number

    @Field()
    status: string;
}