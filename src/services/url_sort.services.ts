
import type { IshortUrlRepository, IcacheRepository, ShortUrlRecord } from "../interfaces/index.js";
import { cacheRepository, urlRepository } from "../repositories/index.js";

import type { urlInput } from "../schemas/index.js"
import { ApiError, logger } from "../utils/index.js"
import { randomBytes } from "node:crypto";

const sortUrlByIdkey = ( id: string ) => `short-urlbyId:${ id }`
const sortUrlkey = ( sortCode: string ) => `short-url:${ sortCode }`
const SHORT_CODE_ATTEMPTS = 5

const createShortCode = (): string => randomBytes( 6 ).toString( "base64url" )

const isUniqueConstraintError = ( error: unknown ): boolean =>
    typeof error === "object" && error !== null && "code" in error && ( error as { code?: unknown } ).code === "P2002"

class UrlShortServices
{
    constructor (
        private shortUrlRepository: IshortUrlRepository,
        private cacheRepository: IcacheRepository
    ) { }


    async createUrl ( data: urlInput, userId: string ): Promise<ShortUrlRecord>
    {
        for ( let attempt = 0; attempt < SHORT_CODE_ATTEMPTS; attempt++ )
        {
            const shortUrl = createShortCode()
            const existingUrl = await this.shortUrlRepository.getByShortCode( shortUrl )

            if ( existingUrl )
            {
                continue
            }

            try
            {
                const shortUrlData = await this.shortUrlRepository.createShortUrl( {
                    ...data,
                    shortUrl
                }, userId )

                if ( shortUrlData )
                {
                    await this.cacheRepository.delete( sortUrlByIdkey( userId ) )
                    return shortUrlData
                }
            } catch ( error )
            {
                if ( isUniqueConstraintError( error ) )
                {
                    continue
                }
                throw error
            }
        }

        logger.error( "Unable to generate a unique short URL", { userId } )
        throw ApiError.serviceUnavailable( "Could not create short URL", [ "Please try again" ] )
    }

    async getUrlByShortCode ( sortCode: string ): Promise<ShortUrlRecord>
    {

        const cacheData = await this.cacheRepository.get( sortUrlkey( sortCode ) )
        if ( cacheData )
        {
            return JSON.parse( cacheData ) as ShortUrlRecord
        }
        const responseData = await this.shortUrlRepository.getByShortCode( sortCode )
        if ( !responseData )
        {
            logger.error( "Short URL not found", { sortCode } )
            throw ApiError.notFound( "Short URL not found", [ "Short URL not found" ] )
        }
        await this.cacheRepository.set( sortUrlkey( sortCode ), JSON.stringify( responseData ), 60 * 5 )
        return responseData
    }

    async getRedirectUrl ( sortCode: string ): Promise<ShortUrlRecord>
    {
        const shortUrlData = await this.getUrlByShortCode( sortCode )
        const isExpired = shortUrlData.expiryAt !== null && shortUrlData.expiryAt.getTime() <= Date.now()

        if ( shortUrlData.status !== "ACTIVE" || isExpired )
        {
            throw ApiError.notFound( "Short URL is unavailable", [ "Short URL is unavailable" ] )
        }

        return shortUrlData
    }
    async getShortUrlById ( userId: string ): Promise<ShortUrlRecord[] | []>
    {

        const cacheData = await this.cacheRepository.get( sortUrlByIdkey( userId ) )
        if ( cacheData )
        {
            return JSON.parse( cacheData ) as ShortUrlRecord[]
        }
        const responseData = await this.shortUrlRepository.getUrlsByUser( userId )
        if ( !responseData )
        {
            logger.error( "Short URL not found", { userId } )
            throw ApiError.notFound( "Short URL not found", [ "Short URL not found" ] )
        }
        await this.cacheRepository.set( sortUrlByIdkey( userId ), JSON.stringify( responseData ), 60 * 5 )
        return responseData
    }

    async updateShortUrl ( shortCode: string, userId: string, data: Partial<urlInput> ): Promise<ShortUrlRecord >
    {
        const responseData = await this.shortUrlRepository.updateShortUrl( shortCode, userId, data )
        if ( !responseData )
        {
            logger.error( "Short URL not found", { shortCode, userId } )
            throw ApiError.notFound( "Short URL not found", [ "Short URL not found" ] )
        }
        await this.cacheRepository.delete( sortUrlkey( shortCode ) )
        await this.cacheRepository.delete( sortUrlByIdkey( userId ) )
        return responseData
    }

    async deleteShortUrl ( shortCode: string, userId: string ): Promise<boolean>
    {
        const responseData = await this.shortUrlRepository.deleteShortUrl( shortCode, userId )
        if ( !responseData )
        {
            logger.error( "Short URL not found", { shortCode, userId } )
            throw ApiError.notFound( "Short URL not found", [ "Short URL not found" ] )
        }
        await this.cacheRepository.delete( sortUrlkey( shortCode ) )
        await this.cacheRepository.delete( sortUrlByIdkey( userId ) )
        return responseData
    }

}


export const urlSortServices = new UrlShortServices( urlRepository, cacheRepository )
