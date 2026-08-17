
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import type { Request, Response, NextFunction } from "express";
import { logger, ApiError } from "../utils/index.js";


interface AuthLimiterOptions
{
    windowMs: number;
    max: number;
    label: string;

}


const createAuthLimiter = ( { windowMs, max, label }: AuthLimiterOptions ) =>
{
    return rateLimit( {
        windowMs,
        max,
        keyGenerator: ( req: Request ) =>
        {
            const clientIp = ( req as Request & { clientIp?: string } ).clientIp;
            return ipKeyGenerator( clientIp ?? req.ip ?? "unknown" );

        },
        handler: ( req: Request, res: Response, next: NextFunction ) =>
        {
            const clientIp = ( req as Request & { clientIp?: string } ).clientIp;
            logger.error( `${ label } limit exceeded`, { ip: clientIp ?? req.ip ?? "unknown", path: req.path } );
            return next( ApiError.tooManyRequests( `too many request, please try again later` ) );
        }

    } )
}

const loginLimiter = createAuthLimiter( {
    windowMs: 20 * 60 * 1000,
    max: 5,
    label: "login"
} );

const registerLimiter = createAuthLimiter( {
    windowMs: 20 * 60 * 1000,
    max: 5,
    label: "register"
} );

const verifyEmailLimiter = createAuthLimiter( {
    windowMs: 20 * 60 * 1000,
    max: 8,
    label: "verify email"
} );

const resendCodeLimiter = createAuthLimiter( {
    windowMs: 20 * 60 * 1000,
    max: 5,
    label: "resend-verification-code",
} );

const forgotPasswordLimiter = createAuthLimiter( {
    windowMs: 20 * 60 * 1000,
    max: 5,
    label: "forgot-password",
} );

const getUrlByIdLimiter = createAuthLimiter( {
    windowMs: 10 * 60 * 1000,
    max: 5,
    label: "get-url-by-id",
} );

const getUrlByshortCodeLimiter = createAuthLimiter( {
    windowMs: 10 * 60 * 1000,
    max: 5,
    label: "get-url-by-short-code",
} );
const updateUrlLimiter = createAuthLimiter( {
    windowMs: 10 * 60 * 1000,
    max: 5,
    label: "update-url",
} );

const deleteUrlLimiter = createAuthLimiter( {
    windowMs: 10 * 60 * 1000,
    max: 5,
    label: "delete-url",
} );
const createShortUrlLimiter = createAuthLimiter( {
    windowMs: 10 * 60 * 1000,
    max: 5,
    label: "create-url",
} );

const getUserDetailsLimiter = createAuthLimiter( {
    windowMs: 10 * 60 * 1000,
    max: 5,
    label: "get-user-details",
} );



export
{
    loginLimiter,
    registerLimiter,
    verifyEmailLimiter,
    resendCodeLimiter,
    forgotPasswordLimiter,
    getUserDetailsLimiter,
    getUrlByIdLimiter,
    getUrlByshortCodeLimiter,
    updateUrlLimiter,
    deleteUrlLimiter,
    createShortUrlLimiter
}
