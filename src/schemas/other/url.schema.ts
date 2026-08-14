


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
        .max( 100, { message: "Title must be at most 100 characters long" } )
        .optional(),
} )

type urlInput = z.infer<typeof urlSchema>

export { urlSchema, type urlInput }