
import e from "cors";
import { z, object } from "zod"
// --- Reusable primitives -----------------------------------------------

const emailField = z
    .string()
    .trim()
    .toLowerCase()
    .email( { message: "Invalid email address" } )
    .max( 100, { message: "Email must be at most 100 characters long" } )


const nameField = ( label: string ) =>
    z
        .string()
        .trim()
        .min( 3, { message: `${ label } must be at least 3 characters long` } )
        .max( 20, { message: `${ label } must be at most 20 characters long` } )

// Full complexity rules — only for CREATING/CHANGING a password

const newPasswordField = z
    .string()
    .min( 6, { message: "Password must be at least 6 characters long" } )
    .max( 50, { message: "Password must be at most 50 characters long" } )
    .regex( /[A-Z]/, { message: "Password must contain at least one uppercase letter" } )
    .regex( /[a-z]/, { message: "Password must contain at least one lowercase letter" } )
    .regex( /[0-9]/, { message: "Password must contain at least one digit" } )
    .regex( /[^A-Za-z0-9]/, { message: "Password must contain at least one special character" } )



const existingPasswordField = z
    .string()
    .min( 1, { message: "Password is required" } )
    .max( 50, { message: "Password must be at most 50 characters long" } )


const otpField = z
    .string()
    .trim()
    .length( 6, { message: "Token must be exactly 6 digits" } )
    .regex( /^\d{6}$/, { message: "Token must contain only digits" } )





const registerSchema = object( {
    first_name: nameField( "First name" ),
    last_name: nameField( "Last name" ),
    email: emailField,
    password: newPasswordField,
} )

const loginSchema = object( {
    email: emailField,
    password: existingPasswordField,
} )


const verifyEmailSchema = object( {
    email: emailField,
    token: otpField

} )




const forgetPasswordSchema = z.object( {
    email: emailField,
} )


const resetpasswordSchema = z.object( {
    email: emailField,
    token: otpField,
    newPassword: newPasswordField,
} )


const resendCodeSchema = z.object( {
    email: emailField,
} )

type registerInput = z.infer<typeof registerSchema>
type loginInput = z.infer<typeof loginSchema>
type verifyEmailInput = z.infer<typeof verifyEmailSchema>
type forgetPasswordInput = z.infer<typeof forgetPasswordSchema>
type resetPasswordInput = z.infer<typeof resetpasswordSchema>
type resendCodeInput = z.infer<typeof resendCodeSchema>

export type {
    registerInput,
    loginInput,
    verifyEmailInput,
    forgetPasswordInput,
    resetPasswordInput,
    resendCodeInput
}
export
{
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    forgetPasswordSchema,
    resetpasswordSchema,
    resendCodeSchema
}