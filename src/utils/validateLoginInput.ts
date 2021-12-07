import { LoginInput } from "../types/LoginInput";

export const ValidateLoginInput = (loginInput: LoginInput) => {
    if (!loginInput.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
        return {
            message: "Invalid email",
            errors: [
                {
                    field: "email",
                    message: "Invalid email"
                }
            ]
        }
    }
    if (!loginInput.password.match(/^(?=.*?[a-z])(?=.*?[0-9]).{8,32}$/g)) {
        return {
            message: "Invalid password",
            errors: [
                {
                    field: "password",
                    message: "Invalid password"
                }
            ]
        }
    }
    return null;
}