import { RegisterInput } from "../types/RegisterInput";

export const validateRegisterInput = (registerInput: RegisterInput) => {
    if (!registerInput.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
        return {
            message: 'Invalid email',
            errors: [
                {
                    field: 'email',
                    message: 'Email must include @ symbol'
                }
            ]
        }
    }
    if (!registerInput.password.match(/^(?=.*?[a-z])(?=.*?[0-9]).{8,32}$/g)) {
        return {
            message: 'Invalid password',
            errors: [
                {
                    field: 'password',
                    message: 'Password must be at 8-32 characters and include at least one number'
                }
            ]
        }
    }
    if (!registerInput.first_name.match(/(^[^0-9!@#$%^&*()_+\-=[\]{};':"\\|,~`.<>/?]{2,9}$)/g)) {
        return {
            message: 'Invalid first name',
            errors: [
                {
                    field: 'first_name',
                    message: 'First name must be at 2-9 characters'
                }
            ]
        }
    }
    if (!registerInput.last_name.match(/(^[^0-9!@#$%^&*()_+\-=[\]{};':"\\|,~`.<>/?]{2,9}$)/g)) {
        return {
            message: 'Invalid last name',
            errors: [
                {
                    field: 'last_name',
                    message: 'Last name must be at 2-9 characters'
                }
            ]
        }
    }
    return null;
}