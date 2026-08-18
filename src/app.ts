import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { errorHandler, notFound } from "./middlewares/index.js";
import { redirectShortUrl } from "./controllers/url_short.controllers.js";

import "./jobs/worker.job.js"

const app = express();
const currentDirectory = dirname( fileURLToPath( import.meta.url ) );

app.set( "trust proxy", 1 );
app.set( "view engine", "ejs" );
app.set( "views", join( currentDirectory, "views" ) );
app.use( ( _req, res, next ) =>
{
    res.locals.cspNonce = randomBytes( 16 ).toString( "base64" );
    next();
} );
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

app.get( "/", ( _req, res ) =>
{
    res.status( 200 ).json( { success: true, message: "Service is healthy" } );
} );

app.get( "/login", ( _req, res ) => res.render( "login.page.ejs" ) );
app.get( "/register", ( _req, res ) => res.render( "register.page.ejs" ) );
app.get( "/dashboard", ( _req, res ) => res.render( "url.page.ejs" ) );
import { authRouter, urlRouter } from "./routes/index.js";

app.use( "/api/v1/auth", authRouter );
app.use( "/api/v1/urls", urlRouter );
app.get( "/:shortUrl", redirectShortUrl );

app.use( notFound );
app.use( errorHandler );

export { app };
