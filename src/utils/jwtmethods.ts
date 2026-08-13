
import jwt, { JsonWebTokenError, TokenExpiredError, type JwtPayload, type Secret, type SignOptions } from "jsonwebtoken"
import type { AccessTokenPayload, RefreshTokenPayload } from "../interfaces/index.js"
import type { StringValue } from "ms"
import { logger, requireEnv } from "./index.js";


const jwtSecret: Secret = requireEnv( "JWT_SECRET" );
const jwtExpiresIn = requireEnv( "JWT_EXPIRES_IN" ) as StringValue;

const refreshSecret: Secret = requireEnv( "REFRESH_SECRET" );
const refreshExpiresIn = requireEnv( "REFRESH_EXPIRES_IN" ) as StringValue;

const ALGORITHM = "HS256" as const;


function generateAccessToken ( payload: AccessTokenPayload ): string
{
    return jwt.sign( payload as JwtPayload, jwtSecret as Secret, { expiresIn: jwtExpiresIn, algorithm: ALGORITHM } as SignOptions )
}

function generateRefreshToken ( payload: RefreshTokenPayload ): string
{
    return jwt.sign( payload as JwtPayload, refreshSecret as Secret, { expiresIn: refreshExpiresIn, algorithm: ALGORITHM } as SignOptions )
}

function verifyAccessToken ( token: string ): AccessTokenPayload | null 
{
    try
    {
        return jwt.verify( token, jwtSecret, { algorithms: [ ALGORITHM ] } ) as AccessTokenPayload
    } catch ( err )
    {
        if ( err instanceof TokenExpiredError || err instanceof JsonWebTokenError )
        {
            logger.warn( `accessToken expired: ${ err.message }` );
            return null;
        }
        logger.error( `Error verifying token: ${ err instanceof Error ? err.message : err ?? "unknown error" }` );
        throw err;
    }
}

function verifyRefreshToken ( token: string ): RefreshTokenPayload | null 
{
    try
    {
        return jwt.verify( token, refreshSecret, { algorithms: [ ALGORITHM ] } ) as RefreshTokenPayload

    } catch ( err )
    {
        if ( err instanceof TokenExpiredError || err instanceof JsonWebTokenError )
        {
            logger.warn( `refreshToken expired: ${ err.message }` );
            return null;
        }
        logger.error( `Error verifying token: ${ err instanceof Error ? err.message : err ?? "unknown error" }` );
        throw err;
    }
}




export
{
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    verifyAccessToken
}