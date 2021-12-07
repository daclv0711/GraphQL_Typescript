import { Status } from "../entities/Status";
import { Field, ObjectType } from "type-graphql";
import { FieldError } from "./FieldError";
import { MutationResponse } from "./MutationResponse";

@ObjectType({ implements: MutationResponse })
export class StatusMutationResponse implements MutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    status?: Status;

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}