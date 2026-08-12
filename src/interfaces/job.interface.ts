
interface PasswordChangeJobData
{
    userName: string;
    userEmail: string;
}

interface VerifyEmailJobData extends PasswordChangeJobData
{
    token: string;

}

interface ForgetPasswordJobData extends PasswordChangeJobData
{
    link: string;
}

export type {
    PasswordChangeJobData,
    VerifyEmailJobData,
    ForgetPasswordJobData
}