
import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/index.js';

const notFound = (
    req: Request,
    res: Response,
    next: NextFunction
) =>
{
    next( ApiError.notFound( `Route ${ req.originalUrl } not found` ) )
}

export { notFound }
