
import jwt, { type JwtPayload, type Secret, type SignOptions } from "jsonwebtoken"
import type { AccessTokenPayload, RefreshTokenPayload } from "../interfaces/index.js"
import type { StringValue } from "ms"

const jwtSecret = process.env.JWT_SECRET as string;
const jwtexpiresIn = process.env.JWT_EXPIRES_IN as StringValue;;


if ( !jwtSecret || !jwtexpiresIn )
{
    throw new Error( "JWT_SECRET or JWT_EXPIRES_IN environment variables are required" );
}

const refreshSecret = process.env.REFRESH_SECRET as string;
const refreshExpiresIn = process.env.REFRESH_EXPIRES_IN as StringValue;

if ( !refreshSecret || !refreshExpiresIn )
{
    throw new Error( "REFRESH_SECRET or REFRESH_EXPIRES_IN environment variables are required" );
}


function generateAccessToken ( payload: AccessTokenPayload ): string
{
    return jwt.sign( payload as JwtPayload, jwtSecret as Secret, { expiresIn: jwtexpiresIn } as SignOptions )
}

function generateRefreshToken ( payload: RefreshTokenPayload ): string
{
    return jwt.sign( payload as JwtPayload, refreshSecret as Secret, { expiresIn: refreshExpiresIn } as SignOptions )
}

export { generateAccessToken, generateRefreshToken }