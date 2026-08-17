
import { registerUser, resendCode, verifyUserEmail, loginUser, logoutUser, forgetPassword, resetPassword, userDetails, refreshAccessToken } from "../controllers/auth.controllers.js";
import { Router } from "express";
import { registerSchema, loginSchema, verifyEmailSchema, forgetPasswordSchema, resetpasswordSchema, resendCodeSchema } from "../schemas/index.js";
import { forgotPasswordLimiter, getUserDetailsLimiter, loginLimiter, registerLimiter, resendCodeLimiter, verifyEmailLimiter, verifyJWT, validate } from "../middlewares/index.js";


const router = Router();


router.route( "/register" )
    .post( registerLimiter, validate( registerSchema ), registerUser )

router.route( "/verify-email" )
    .post( verifyEmailLimiter, validate( verifyEmailSchema ), verifyUserEmail )

router.route( "/resend-code" )
    .post( resendCodeLimiter, validate( resendCodeSchema ), resendCode )

router.route( "/login" )
    .post( loginLimiter, validate( loginSchema ), loginUser )

router.route( "/logout" )
    .post( verifyJWT, logoutUser )

router.route( "/forgot-password" )
    .post( forgotPasswordLimiter, validate( forgetPasswordSchema ), forgetPassword )

router.route( "/reset-password" )
    .post( validate( resetpasswordSchema ), resetPassword )

router.route( "/refresh-token" )
    .post( refreshAccessToken )

router.route( "/me" )
    .get( getUserDetailsLimiter, verifyJWT, userDetails )

export { router as authRouter }
export default router
