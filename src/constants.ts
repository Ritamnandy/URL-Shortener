
import crypto from 'crypto'

enum UserStatus
{
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    DELETED = 'deleted',
}

function generateOtp (): string
{
    return crypto.randomInt( 100000, 999999 ).toString()
}

const hashToken = ( token: string ): string =>
{
    return crypto.createHash( 'sha256' ).update( token ).digest( 'hex' )
}

const rowToken = (): string =>
{
    return crypto.randomBytes( 32 ).toString( 'hex' )
}



export { UserStatus, generateOtp, hashToken, rowToken }