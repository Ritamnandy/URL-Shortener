
import { urlSortServices } from "../services/url_sort.services.js"
import { ApiError, ApiResponse, logger, asyncHandler } from "../utils/index.js"
import type { Request, Response } from "express"
import type { AuthRequest } from '../middlewares/jwtverify.middlewares.js';
import type { urlInput } from "../schemas/index.js"


const createShortUrl = asyncHandler( async ( req: AuthRequest, res: Response ) =>
{
    const user = req.user;
    if ( !user )
    {
        logger.warn( "unauthorized request", { message: "user not found" } )
        throw ApiError.unauthorized( "unauthorized request", [ "user not found please login or register" ] )
    }
    const response = await urlSortServices.createUrl( req.body as urlInput, user.id )
    return res.status( 201 ).json( ApiResponse.ok( "Short url created successfully", response ) )
} )


const updateShortUrl = asyncHandler( async ( req: AuthRequest, res: Response ) =>
{
    const user = req.user;
    const { shortUrl } = req.body as urlInput
    if ( !user )
    {
        logger.warn( "unauthorized request", { message: "user not found" } )
        throw ApiError.unauthorized( "unauthorized request", [ "user not found please login or register" ] )
    }
    const response = await urlSortServices.updateShortUrl( shortUrl, user.id, req.body as urlInput )
    return res.status( 200 ).json( ApiResponse.ok( "Short url updated successfully", response ) )

} )


const deleteShortUrl = asyncHandler( async ( req: AuthRequest, res: Response ) =>
{
    const user = req.user;
    const { shortUrl } = req.body as urlInput
    if ( !user )
    {
        logger.warn( "unauthorized request", { message: "user not found" } )
        throw ApiError.unauthorized( "unauthorized request", [ "user not found please login or register" ] )
    }
    const response = await urlSortServices.deleteShortUrl( shortUrl, user.id )
    return res.status( 200 ).json( ApiResponse.ok( "Short url deleted successfully", response ) )
} )

const getUrlByShortCode = asyncHandler( async ( req: AuthRequest, res: Response ) =>
{
    const user = req.user;
    const { shortUrl } = req.body as Partial<urlInput>
    if ( !user )
    {
        logger.warn( "unauthorized request", { message: "user not found" } )
        throw ApiError.unauthorized( "unauthorized request", [ "user not found please login or register" ] )
    }
    const response = await urlSortServices.getUrlByShortCode( shortUrl as string )
    return res.status( 200 ).json( ApiResponse.ok( "Short url fetched successfully", response ) )
} )


const getAllUrls = asyncHandler( async ( req: AuthRequest, res: Response ) =>
{
    const user = req.user;
    if ( !user )
    {
        logger.warn( "unauthorized request", { message: "user not found" } )
        throw ApiError.unauthorized( "unauthorized request", [ "user not found please login or register" ] )
    }
    const response = await urlSortServices.getShortUrlById( user.id )
    return res.status( 200 ).json( ApiResponse.ok( "All urls fetched successfully", response ) )
} )



export
{
    createShortUrl,
    updateShortUrl,
    deleteShortUrl,
    getUrlByShortCode,
    getAllUrls
}