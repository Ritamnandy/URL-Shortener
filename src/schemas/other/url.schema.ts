


import { z, object } from "zod"

const urlField = z
    .string()
    .trim()
    .url( { message: "Invalid URL" } )
    .max( 100, { message: "URL must be at most 100 characters long" } )

const urlSchema = object( {
    originalUrl: urlField,
    title: z
        .string()
        .trim()
        .max( 100, { message: "Title must be at most 100 characters long" } ),
} )

const shortUrlParamsSchema = object( {
    shortUrl: z
        .string()
        .trim()
        .min( 1, { message: "Short URL code is required" } )
        .max( 100, { message: "Short URL code must be at most 100 characters long" } )
        .regex( /^[A-Za-z0-9_-]+$/, { message: "Short URL code contains invalid characters" } )
} )

const updateUrlSchema = urlSchema
    .partial()
    .refine( ( value ) => Object.keys( value ).length > 0, {
        message: "Provide at least one field to update"
    } )

type urlbody = z.infer<typeof urlSchema>
type urlInput = {
    originalUrl: urlbody[ "originalUrl" ]
    title: urlbody[ "title" ],
    userId: string
    shortUrl: string
    expiryAt: Date
}

export { urlSchema, updateUrlSchema, shortUrlParamsSchema, type urlInput, type urlbody }
