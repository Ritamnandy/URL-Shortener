import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler, notFound } from "./middlewares/index.js";


const app = express();

app.set( "trust proxy", 1 );
app.use( helmet() );
app.use( cors( {
    origin: process.env.CORS_ORIGIN?.split( "," ) ?? true,
    credentials: true
} ) );
app.use( compression() );
app.use( morgan( process.env.NODE_ENV === "production" ? "combined" : "dev" ) );
app.use( express.json( { limit: "16kb" } ) );
app.use( express.urlencoded( { extended: true, limit: "16kb" } ) );
app.use( cookieParser() );

app.get( "/health", ( _req, res ) =>
{
    res.status( 200 ).json( { success: true, message: "Service is healthy" } );
} );
import { authRouter, urlRouter } from "./routes/index.js";

app.use( "/api/v1/auth", authRouter );
app.use( "/api/v1/urls", urlRouter );

app.use( notFound );
app.use( errorHandler );

export { app };
