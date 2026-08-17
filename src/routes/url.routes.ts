import { Router } from "express";
import {
    createShortUrl,
    deleteShortUrl,
    getAllUrls,
    getUrlByShortCode,
    updateShortUrl
} from "../controllers/url_short.controllers.js";
import {
    createShortUrlLimiter,
    deleteUrlLimiter,
    getUrlByIdLimiter,
    getUrlByshortCodeLimiter,
    updateUrlLimiter,
    validate,
    verifyJWT
} from "../middlewares/index.js";
import { shortUrlParamsSchema, updateUrlSchema, urlSchema } from "../schemas/index.js";

const router = Router();

router.route( "/" )
    .post( verifyJWT, createShortUrlLimiter, validate( urlSchema ), createShortUrl )
    .get( verifyJWT, getUrlByIdLimiter, getAllUrls )

router.route( "/:shortUrl" )
    .get( verifyJWT, getUrlByshortCodeLimiter, validate( shortUrlParamsSchema, "params" ), getUrlByShortCode )
    .patch( verifyJWT, updateUrlLimiter, validate( shortUrlParamsSchema, "params" ), validate( updateUrlSchema ), updateShortUrl )
    .delete( verifyJWT, deleteUrlLimiter, validate( shortUrlParamsSchema, "params" ), deleteShortUrl )

export { router as urlRouter }
export default router
