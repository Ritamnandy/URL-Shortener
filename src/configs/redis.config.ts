
import { Redis } from "ioredis";


const connection = {
    host: process.env.REDIS_HOST as string,
    port: Number( process.env.REDIS_PORT as string )
}


const redis = new Redis( {
    ...connection
} );

export { redis,connection }