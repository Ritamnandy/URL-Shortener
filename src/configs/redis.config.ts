
import { Redis } from "ioredis";
import { requireEnv } from "../utils/index.js"

const connection = {
    host: requireEnv( "REDIS_HOST" ) as string,
    port: Number( requireEnv( "REDIS_PORT" ) as string )
}


const redis = new Redis( {
    ...connection
} );

export { redis, connection }