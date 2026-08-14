

function signupKey ( email: string )
{
    return `signup-user:${ email }`
}

function otpKey ( email: string )
{
    return `otp-key:${ email }`
}

const resendCoolDownKey = ( email: string ): string =>
{
    return `resend-otp-cooldown:${ email }`
}
const resetCooldownKey = ( email: string ): string =>
{
    return `reset-password-cooldown:${ email }`
}
const resetKey = ( email: string ): string =>
{
    return `reset-password:${ email }`
}

export { signupKey, otpKey }