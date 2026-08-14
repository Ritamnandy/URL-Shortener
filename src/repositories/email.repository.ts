
import type { IEmailRepository, ForgetPasswordJobData, PasswordChangeJobData, VerifyEmailJobData } from "../interfaces/index.js"
import { EmailQueue } from "../jobs/queue.job.js"


class EmailRepository implements IEmailRepository
{
    async sendVerificationEmail ( data: VerifyEmailJobData ): Promise<void>
    {
        await EmailQueue.add( "send-verification-email", data );
    }
    async sendForgetPasswordEmail ( data: ForgetPasswordJobData ): Promise<void>
    {
        await EmailQueue.add( "send-forget-password-email", data );
    }
    async sendPasswordChangeEmail ( data: PasswordChangeJobData ): Promise<void>
    {
        await EmailQueue.add( "send-password-change-email", data );
    }
}

export const emailRepository = new EmailRepository();