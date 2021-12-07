import { Resolver, Mutation, Arg, Ctx, Query } from 'type-graphql';
import { User } from '../entities/User';
import { LoginInput } from '../types/LoginInput';
import { RegisterInput } from '../types/RegisterInput';
import { UserMutationResponse } from '../types/UserMutationResponse';
import { validateRegisterInput } from '../utils/validateRegisterInput';
import { Context } from 'src/types/Context';
import { COOKIE_NAME } from '../constants';
import { ForgotPasswordInput } from '../types/ForgotPasswordInput';
import { sendEmail } from '../utils/sendEmail';
import { TokenModel } from '../models/Token';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ChangePasswordInput } from '../types/ChangePasswordInput';

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(@Ctx() { req }: Context): Promise<User | undefined | null> {
        try {
            const token = req.session.userId;
            if (!token) {
                return null;
            }
            const user = await User.findOne(token);
            return user;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    @Mutation(() => UserMutationResponse, { nullable: true })
    async register(
        @Arg('registerInput') registerInput: RegisterInput,
        @Ctx() { req }: Context
    ): Promise<UserMutationResponse> {
        const validateRegisterInputError = validateRegisterInput(registerInput)
        if (validateRegisterInputError !== null) {
            return {
                code: 400,
                success: false,
                ...validateRegisterInputError
            }
        }
        try {
            const { first_name, last_name, email, password } = registerInput;
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return {
                    code: 400,
                    success: false,
                    message: 'Email đã tồn tại.',
                    errors: [
                        {
                            field: 'email',
                            message: 'Email đã tồn tại.'
                        }
                    ]
                };
            }
            const hashedPassword = await bcrypt.hashSync(password, 10);

            const newUser = User.create({
                first_name,
                last_name,
                email,
                password: hashedPassword
            });

            await newUser.save();
            req.session.userId = newUser.id;
            return {
                code: 200,
                success: true,
                message: 'Đăng ký thành công.',
                user: newUser
            }

        } catch (error) {
            console.log(error);
            return {
                code: 500,
                success: false,
                message: `Internal server error ${error}`,
            };
        }

    }

    @Mutation(() => UserMutationResponse)
    async login(
        @Arg('loginInput') loginInput: LoginInput,
        @Ctx() { req }: Context
    ): Promise<UserMutationResponse> {
        try {
            const { email, password } = loginInput;
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return {
                    code: 400,
                    success: false,
                    message: 'Email không tồn tại.',
                    errors: [
                        {
                            field: 'email',
                            message: 'Email không tồn tại.'
                        }
                    ]
                };
            }
            const validPassword = await bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return {
                    code: 400,
                    success: false,
                    message: 'Mật khẩu không đúng.',
                    errors: [
                        {
                            field: 'password',
                            message: 'Mật khẩu không đúng.'
                        }
                    ]
                };
            }
            // create session and return cookie
            req.session.userId = user.id;
            // create token
            return {
                code: 200,
                success: true,
                user,
                message: 'Đăng nhập thành công.',
            }
        } catch (error) {
            console.log(error);
            return {
                code: 500,
                success: false,
                message: `Internal server error ${error}`,
            };
        }
    }

    @Mutation(() => Boolean)
    async logout(@Ctx() { req, res }: Context): Promise<Boolean> {
        try {
            return new Promise((resolve, _reject) => {
                res.clearCookie(COOKIE_NAME)

                req.session.destroy(err => {
                    if (err) {
                        console.log('Destroy session error', err);
                        resolve(false);
                    }
                    resolve(true)
                })
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput,
    ): Promise<boolean> {
        const user = await User.findOne({ where: { email: forgotPasswordInput.email } });

        if (!user)
            return true;

        await TokenModel.findOneAndDelete({ user_id: `${user.id}` });
        const resetToken = uuidv4();
        const hashedToken = await bcrypt.hash(resetToken, 10);
        //save token to db
        await new TokenModel({
            user_id: `${user.id}`,
            token: hashedToken
        }).save();

        //send email
        await sendEmail(forgotPasswordInput.email,
            `<a href="https://localhost:3000/change-password?token=${resetToken}&userId=${user.id}">Click here to reset password</a>`);
        return true;
    }

    @Mutation(() => UserMutationResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('userId') userId: string,
        @Arg('changePasswordInput') changePasswordInput: ChangePasswordInput,
    ): Promise<UserMutationResponse> {

        if (!changePasswordInput.newPassword.match(/^(?=.*?[a-z])(?=.*?[0-9]).{8,32}$/g)) {
            return {
                code: 400,
                success: false,
                message: 'Invalid password.',
                errors: [
                    {
                        field: 'newPassword',
                        message: 'Password must be at least 8-32 characters.'
                    }
                ]
            }
        }
        try {
            const resetPasswordToken = await TokenModel.findOne({ where: { user_id: userId } });
            if (!resetPasswordToken) {
                return {
                    code: 400,
                    success: false,
                    message: 'Invalid token or expired.',
                    errors: [
                        {
                            field: 'token',
                            message: 'Invalid token or expired.'
                        }
                    ]
                }
            }

            const resetPasswordTokenIsValid = await bcrypt.compareSync(token, resetPasswordToken.token);
            if (!resetPasswordTokenIsValid) {
                return {
                    code: 400,
                    success: false,
                    message: 'Invalid token or expired.',
                    errors: [
                        {
                            field: 'token',
                            message: 'Invalid token or expired.'
                        }
                    ]
                }
            }
            const userIdNumber = parseInt(userId);
            const user = await User.findOne({ where: { id: userIdNumber } });
            if (!user) {
                return {
                    code: 400,
                    success: false,
                    message: 'User no longer exists.',
                    errors: [
                        {
                            field: 'token',
                            message: 'User no longer exists.'
                        }
                    ]
                }
            }
            const updatedPassword = await bcrypt.hashSync(changePasswordInput.newPassword, 10);
            await User.update({ id: userIdNumber }, { password: updatedPassword });

            await resetPasswordToken.deleteOne();
            return {
                code: 200,
                success: true,
                message: 'Change password successfully.',
            }

        } catch (error) {
            return {
                code: 500,
                success: false,
                message: `Internal server error ${error}`,
            }
        }

    }
}