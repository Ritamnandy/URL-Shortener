

import { redis } from "../configs/redis.config.js"
import type { IcacheRepository } from "../interfaces/index.js"

class CacheRepository implements IcacheRepository
{
    public async set ( key: string, value: string ): Promise<void>
    {
        await redis.set( key, value )
    }
    public async get ( key: string ): Promise<string | null>
    {
        return await redis.get( key )
    }
    public async delete ( key: string ): Promise<void>
    {
        await redis.del( key )
    }
}

export const cacheRepository = new CacheRepository()