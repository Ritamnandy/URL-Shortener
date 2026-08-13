
import type { ForgetPasswordJobData, PasswordChangeJobData, VerifyEmailJobData } from "../index.js"

interface IEmailRepository
{
    sendVerificationEmail ( data: VerifyEmailJobData ): Promise<void>
    sendForgetPasswordEmail ( data: ForgetPasswordJobData ): Promise<void>
    sendPasswordChangeEmail ( data: PasswordChangeJobData ): Promise<void>

}

export type { IEmailRepository }