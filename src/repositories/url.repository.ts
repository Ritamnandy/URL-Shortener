
import type { IshortUrlRepository, ShortUrlRecord } from "../interfaces/index.js"
import { prisma } from "../configs/prisma.client.config.js"
import { logger } from "../utils/index.js"
import type { createShortUrlInput, urlInput } from "../schemas/index.js"

const selectedFields = {
    id: true,
    shortUrl: true,
    originalUrl: true,
    title: true,
    userId: true,
    expiryAt: true,
    createdAt: true,
    status: true
} as const;

class ShorturlRepository implements IshortUrlRepository
{
    public async createShortUrl ( data: createShortUrlInput, userId: string ): Promise<ShortUrlRecord | null>
    {
        return await prisma.short_Url.create( {
            data: {
                originalUrl: data.originalUrl,
                title: data.title as string,
                shortUrl: data.shortUrl,
                userId
            },
            select: selectedFields
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
            },
            orderBy: {
                createdAt: "desc"
            },
            select: selectedFields
        } )
    }

    public async updateShortUrl ( shortCode: string, userId: string, data: Partial<urlInput> ): Promise<ShortUrlRecord | null>
    {
        const existingUrl = await prisma.short_Url.findFirst( {
            where: {
                shortUrl: shortCode,
                userId
            },
            select: {
                id: true
            }
        } )

        if ( !existingUrl )
        {
            return null
        }

        return await prisma.short_Url.update( {
            where: {
                id: existingUrl.id
            },
            data: {
                originalUrl: data.originalUrl as string,
                title: data.title as string
            },
            select: selectedFields
        } )
    }

    public async deleteShortUrl ( shortCode: string, userId: string ): Promise<boolean>
    {
        const result = await prisma.short_Url.deleteMany( {
            where: {
                shortUrl: shortCode,
                userId
            }
        } )
        return result.count > 0
    }
}

export const urlRepository = new ShorturlRepository()
