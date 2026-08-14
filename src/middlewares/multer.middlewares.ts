
import multer, { type FileFilterCallback, type StorageEngine } from "multer"
import { type Request } from "express"


const storage: StorageEngine = multer.diskStorage( {
    destination: function ( req: Request, file: Express.Multer.File, cb: ( error: Error | null, destination: string ) => void )
    {
        cb( null, "src/public/temp/" );
    },
    filename: function ( req: Request, file: Express.Multer.File, cb: ( error: Error | null, filename: string ) => void )
    {
        cb( null, file.originalname );
    }
} )

export const upload = multer( { storage } )