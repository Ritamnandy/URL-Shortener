
import type { IshortUrlRepository, ShortUrlRecord } from "../interfaces/index.js"
import { prisma } from "../configs/prisma.client.config.js"
import { logger } from "../utils/index.js"
import type { urlInput } from "../schemas/index.js"

const selectedFields = {
    id: true,
    shortUrl: true,
    originalUrl: true,
    title: true,
    userId: true,
    expiresAt: true,
    createdAt: true
} as const;

class ShorturlRepository implements IshortUrlRepository
{
    public async createShortUrl ( data: urlInput, userId: string ): Promise<ShortUrlRecord | null>
    {
        return await prisma.short_Url.create( {
            data, select: selectedFields
        } )

    }
    public async getByShortCode ( shortCode: string ): Promise<ShortUrlRecord | null>
    {
        return await prisma.short_Url.findUnique( {
            where: {
                shortUrl: shortCode
            }, select: selectedFields
        } )
    }

    public async getUrlsByUser ( userId: string ): Promise<ShortUrlRecord[]>
    {
        // Find all short URLs created by the user
        return await prisma.short_Url.findMany( {
            where: {
                userId
            }, select: selectedFields
        } )
    }

    public async updateShortUrl ( shortCode: string, userId: string, data: Partial<urlInput> ): Promise<ShortUrlRecord | null>
    {
        return await prisma.short_Url.update( {
            where: {
                shortUrl: shortCode,
                userId
            }, data, select: selectedFields
        } )
    }

    public async deleteShortUrl ( shortCode: string, userId: string ): Promise<boolean>
    {
        const result = await prisma.short_Url.delete( {
            where: {
                shortUrl: shortCode,
                userId
            }
        } )
        return result ? true : false
    }
}