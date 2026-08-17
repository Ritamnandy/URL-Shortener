
import type { NextFunction, Request, Response } from 'express';
import jwt from "jsonwebtoken";
import { authRepository } from "../repositories/index.js"
import { logger, asyncHandler, ApiError, verifyAccessToken } from '../utils/index.js';
import type { AccessTokenPayload, CreatedUser } from '../interfaces/index.js';

export interface AuthRequest extends Request
{
    user?: CreatedUser;
}

const verifyJWT = asyncHandler( async ( req: AuthRequest, res: Response, next: NextFunction ) =>
{
    try
    {
        const Token = req.header( "Authorization" )?.replace( "Bearer ", "" ) || req.cookies.accessToken;
        if ( !Token )
        {
            logger.warn( "unauthorized request", { message: "token not found" } )
            throw ApiError.unauthorized( "unauthorized request", [ "token not found" ] )
        }
        const decodedToken: AccessTokenPayload | null = verifyAccessToken( Token )
        const user: CreatedUser | null = await authRepository.getUserById( decodedToken?.id ?? "" )
        if ( !user )
        {
            logger.warn( "unauthorized request", { message: "user not found" } )
            throw ApiError.unauthorized( "unauthorized request", [ "user not found" ] )
        }
        req.user = user;
        next()
    } catch ( error )
    {
        if ( error instanceof jwt.TokenExpiredError )
        {
            logger.error( "Token expired", { error: error.message } );

        } else if ( error instanceof jwt.JsonWebTokenError )
        {
            logger.warn( "Invalid or tampered access token", { message: error.message } );
        } else
        {
            logger.error( "Error verifying access token", { message: ( error as Error ).message } )

        }
        throw ApiError.unauthorized( "Unauthorized request", [ "Unauthorized request please login or signup " ] )
    }
} )

export { verifyJWT }
