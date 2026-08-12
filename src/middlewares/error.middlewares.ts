
import { ApiError, logger } from "../utils/index.js";
import type { PgError } from "../interfaces/index.js"
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) =>
{
    let error: ApiError
    if ( err instanceof ApiError )
    {
        error = err
    }
    else
    {
        let statusCode = 500;
        let message = "Something went wrong";
        let errors: ( object | string )[] = [];
        let isOperational = false;

        const pgErr = err as PgError
        if ( pgErr?.code === "23505" )
        {
            statusCode = 409;
            message = pgErr.detail ? `Duplicate value ${ pgErr.detail }` : `Duplicate entry for ${ pgErr.constraint ?? "field" }`;
            errors = [ message ];
            isOperational = true;
        }
        else if ( pgErr?.code === "23503" ) //foregn key violation
        {
            statusCode = 400;
            message = `Invalid reference: ${ pgErr.detail ?? pgErr.constraint ?? "related record not found" }`;
            errors = [ message ];
            isOperational = true;
        } else if ( pgErr?.code === "23502" )//not_null violation
        {
            statusCode = 400;
            message = `Missing required field: ${ pgErr.column ?? "" }`;
            errors = [ message ];
            isOperational = true;
        } else if ( pgErr?.code === "22P02" )// invalid_text_representation (e.g. bad UUID/int)
        {
            statusCode = 400;
            message = "Invalid input format";
            errors = [ message ];
            isOperational = true;
        } else if ( pgErr?.code === "42P01" )//undifined_table
        {
            statusCode = 500;
            message = "Database configuration error";
            errors = [ message ];
            isOperational = false;
        } else if ( err instanceof jwt.TokenExpiredError )
        {
            statusCode = 401;
            message = "Access token expired";
            errors = [ "Unauthorized request, please login again" ];
            isOperational = true;
        } else if ( err instanceof jwt.JsonWebTokenError )
        {
            statusCode = 401;
            message = "Invalid access token";
            errors = [ "Unauthorized request, please login again" ];
            isOperational = true;
        } else if ( err instanceof jwt.NotBeforeError )
        {
            statusCode = 401;
            message = "Access token not active yet";
            errors = [ "Unauthorized request, please login again" ];
            isOperational = true;
        } else if ( err instanceof SyntaxError && "body" in ( err as any ) )
        {
            statusCode = 400;
            message = "Invalid JSON format in request body";
            errors = [ message ];
            isOperational = true;
        } else if ( err instanceof Error )
        {
            statusCode = ( err as any ).statusCode || 500;
            message = err.message || message;
            errors = [ message ];
            isOperational = true;
        }
        error = new ApiError(
            statusCode,
            message, errors,
            isOperational,
            isProduction ? undefined : ( err as Error ).stack
        );
    }
    if ( error.statusCode >= 500 )
    {
        logger.error(
            `[${ new Date().toISOString() }] ${ req.method } ${ req.originalUrl } -`,
            error
        );
    } else if ( !isProduction )
    {
        logger.warn( `[${ req.method } ${ req.originalUrl }] ${ error.message }` );
    }
    const responseError = isProduction && !error.isOperational ? { success: false, statusCode: error.statusCode, message: "Internal Server Error", errors: [] } : error.toJSON();
    res.status( error.statusCode || 500 ).json( responseError );
}

export { errorHandler }