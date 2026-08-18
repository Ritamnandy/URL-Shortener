
import type { createShortUrlInput, urlInput } from "../../schemas/index.js"
interface ShortUrlRecord
{
    id: string;
    shortUrl: string;
    originalUrl: string;
    title: string | null;
    userId: string;
    expiryAt: Date | null;
    createdAt: Date;
    status: string;
}

interface IshortUrlRepository
{
    //create
    createShortUrl ( data: createShortUrlInput, userId: string ): Promise<ShortUrlRecord | null>
    // Read
    getByShortCode ( shortCode: string ): Promise<ShortUrlRecord | null>;

    getUrlsByUser ( userId: string ): Promise<ShortUrlRecord[]>;

    // Update
    updateShortUrl ( shortCode: string, userId: string, data: Partial<urlInput> ): Promise<ShortUrlRecord | null>;

    // Delete
    deleteShortUrl ( shortCode: string, userId: string ): Promise<boolean>;

}

export type { IshortUrlRepository, ShortUrlRecord }
