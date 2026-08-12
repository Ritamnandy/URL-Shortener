
import type { NextFunction, Request, Response } from "express";

type AsyncHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown>

const asyncHandler = ( handler: AsyncHandler ) =>
{
    return ( req: Request, res: Response, next: NextFunction ): void =>
    {
        Promise.resolve( handler( req, res, next ) ).catch( next )
    }
}

export { asyncHandler }