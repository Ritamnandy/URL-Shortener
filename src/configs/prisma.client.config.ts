

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/prisma/client.js"

const connectionString = `${ process.env.DATABASE_URL }`

const adapter = new PrismaPg( {
    connectionString,

}, { schema: "url_shortener" } )

const prisma = new PrismaClient( {
    adapter
} )

export { prisma }