
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file"

import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath( import.meta.url )
const __dirname = path.dirname( __filename )

const logDir = path.join( __dirname, "../../..", "logs" );

const { combine, timestamp, printf, colorize, errors, json } = winston.format

const isProduction = process.env.NODE_ENV === "production"

//human readable format

const devFormat = combine(
    colorize(),
    timestamp( { format: "YYYY-MM-DD HH:mm:ss" } ),
    printf( ( { level, message, timestamp, stack, ...meta } ) =>
    {

        const metaStr = Object.keys( meta ).length ? JSON.stringify( meta ) : "";

        return `[${ timestamp }] ${ level }: ${ stack || message } ${ metaStr }`;

    } )
)

// json format

const prodFormat = combine(
    timestamp(),
    errors( { stack: true } ),
    json()
)

const transport: winston.transport[] = [
    new winston.transports.Console( {
        format: isProduction ? prodFormat : devFormat
    } ),
]

//file transport only for production 

if ( isProduction )
{
    transport.push(
        new DailyRotateFile( {
            dirname: logDir,
            filename: "app-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
            format: prodFormat
        } ),
        new DailyRotateFile( {
            dirname: logDir,
            filename: "app-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
            format: prodFormat
        } )
    )
}


const logger = winston.createLogger( {
    level: process.env.LOG_LEVEL || ( isProduction ? "info" : "debug" ),
    transports: transport,
    exitOnError: false
} )

logger.on( "unhandledRejection", ( err ) =>
{
    logger.error( "Unhandled Rejection", err )
} )

logger.on( "uncaughtException", ( err ) =>
{
    logger.error( "Uncaught Exception", err )
} )


export { logger }