import { CreateStatusInput } from '../types/CreateStatusInput';
import { StatusMutationResponse } from '../types/StatusMutationResponse';
import { Resolver, Arg, Mutation, Query, ID, UseMiddleware } from 'type-graphql';
import { Status } from '../entities/Status';
import { UpdateStatusInput } from '../types/UpdateStatusInput';
import { checkAuth } from '../middlewares/chectAuth';

@Resolver()
export class StatusResolver {

    @Mutation(() => StatusMutationResponse, { nullable: true })
    @UseMiddleware(checkAuth)
    async createStatus(
        @Arg('createStatusInput') { status, user_id }: CreateStatusInput
    ): Promise<StatusMutationResponse> {
        try {
            const newStatus = await Status.create({
                status,
                user_id,
                old_status: [{ status }],
                likes: [],
            });
            await newStatus.save();
            return {
                code: 200,
                success: true,
                message: 'Status created successfully',
                status: newStatus,
            }
        } catch (error) {
            return {
                code: 500,
                success: false,
                message: 'Internal server error',
                errors: error as any,
            }
        }



    }

    @Query(() => [Status], { nullable: true })
    async getAllStatus(): Promise<Status[] | undefined> {
        try {
            const status = await Status.find();
            return status as Status[];
        } catch (error) {
            return error as any;
        }
    }

    @Query(() => Status, { nullable: true })
    async getStatus(
        @Arg('id', _type => ID) id: number
    ): Promise<Status | undefined> {
        try {
            const status = await Status.findOne({ where: { id } });
            return status as Status;
        } catch (error) {
            return error as any;
        }
    }

    @Mutation(() => StatusMutationResponse, { nullable: true })
    @UseMiddleware(checkAuth)
    async updateStatus(
        @Arg('updateStatusInput') { id, status }: UpdateStatusInput
    ): Promise<StatusMutationResponse> {
        try {
            const existingStatus = await Status.findOne({ where: { id } });
            if (!existingStatus) {
                return {
                    code: 400,
                    success: false,
                    message: 'Status not found',
                }
            }

            existingStatus.status = status;
            await existingStatus.save();

            return {
                code: 200,
                success: true,
                message: 'Status updated successfully',
                status: existingStatus,
            }
        } catch (error) {
            return {
                code: 500,
                success: false,
                message: 'Internal server error',
                errors: error as any,
            }
        }
    }

    @Mutation(() => StatusMutationResponse, { nullable: true })
    @UseMiddleware(checkAuth)
    async deleteStatus(
        @Arg('id', _type => ID) id: number,
    ): Promise<StatusMutationResponse> {
        try {
            const existingStatus = await Status.findOne({ where: { id } });
            if (!existingStatus) {
                return {
                    code: 400,
                    success: false,
                    message: 'Status not found',
                }
            }

            await existingStatus.remove();

            return {
                code: 200,
                success: true,
                message: 'Status deleted successfully',
                status: existingStatus,
            }
        } catch (error) {
            return {
                code: 500,
                success: false,
                message: 'Internal server error',
                errors: error as any,
            }
        }
    }
}