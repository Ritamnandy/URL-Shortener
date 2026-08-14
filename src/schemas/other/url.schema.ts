


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

type urlbody = z.infer<typeof urlSchema>
type urlInput = {
    originalUrl: urlbody[ "originalUrl" ]
    title: urlbody[ "title" ],
    userId: string
    shortUrl: string
    expiryAt: Date
}

export { urlSchema, type urlInput, type urlbody }