
import type { IshortUrlRepository, IcacheRepository, ShortUrlRecord } from "../interfaces/index.js";
import { cacheRepository, urlRepository } from "../repositories/index.js";

import type { urlInput } from "../schemas/index.js"
import { ApiError, logger } from "../utils/index.js"

const sortUrlByIdkey = ( id: string ) => `short-urlbyId:${ id }`
const sortUrlkey = ( sortCode: string ) => `short-url:${ sortCode }`
class UrlShortServices
{
    constructor (
        private shortUrlRepository: IshortUrlRepository,
        private cacheRepository: IcacheRepository
    ) { }


    async createUrl ( data: urlInput, userId: string ): Promise<ShortUrlRecord>
    {
        const sortUrlData = await this.shortUrlRepository.createShortUrl( data, userId )
        if ( !sortUrlData )
        {
            logger.error( "Error on creating short URL", { data, userId } )
            throw ApiError.badRequest( "Error creating short URL", [ "Error creating short URL" ] )
        }
        return sortUrlData
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
    async getShortUrlById ( id: string ): Promise<ShortUrlRecord[] | []>
    {

        const cacheData = await this.cacheRepository.get( sortUrlByIdkey( id ) )
        if ( cacheData )
        {
            return JSON.parse( cacheData ) as ShortUrlRecord[]
        }
        const responseData = await this.shortUrlRepository.getUrlsByUser( id )
        if ( !responseData )
        {
            logger.error( "Short URL not found", { id } )
            throw ApiError.notFound( "Short URL not found", [ "Short URL not found" ] )
        }
        await this.cacheRepository.set( sortUrlByIdkey( id ), JSON.stringify( responseData ), 60 * 5 )
        return responseData
    }

    async updateShortUrl ( shortCode: string, userId: string, data: Partial<urlInput> ): Promise<ShortUrlRecord | null>
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
