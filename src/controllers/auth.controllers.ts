
import type { AuthRequest } from "../middlewares/index.js";
import type { registerInput, loginInput, verifyEmailInput, forgetPasswordInput, resetPasswordInput, resendCodeInput } from "../schemas/index.js"
import { authService } from "../services/auth.services.js"
import { ApiError, ApiResponse, logger, asyncHandler } from "../utils/index.js"
import type { Request, Response, CookieOptions } from "express"

const AccessTokenOptions: CookieOptions = {

    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 60 * 60 * 3 * 1000
}

const RefreshTokenOptions: CookieOptions = {

    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 60 * 60 * 24 * 14 * 1000
}



const registerUser = asyncHandler( async ( req: Request, res: Response ) =>
{
    const response = await authService.registerUser( req.body as registerInput )
    return res.status( 201 ).json( ApiResponse.ok( "User registered successfully", response ) )
} )

const resendCode = asyncHandler( async ( req: Request, res: Response ) =>
{
    const response = await authService.resendOtpCode( req.body as resendCodeInput )
    return res.status( 200 ).json( ApiResponse.ok( "Code resent successfully", [ "Code resent successfully please check your email" ] ) )
} )

const verifyUserEmail = asyncHandler( async ( req: Request, res: Response ) =>
{
    const response = await authService.verifyUserEmail( req.body as verifyEmailInput )
    return res.status( 200 ).cookie( "accessToken", response.accessToken, AccessTokenOptions ).cookie( "refreshToken", response.refreshToken, RefreshTokenOptions ).json( ApiResponse.ok( "Email verified successfully", response ) )
} )

const loginUser = asyncHandler( async ( req: Request, res: Response ) =>
{
    const response = await authService.loginUser( req.body as loginInput )
    return res.status( 200 )
        .cookie( "accessToken", response.accessToken, AccessTokenOptions )
        .cookie( "refreshToken", response.refreshToken, RefreshTokenOptions )
        .json( ApiResponse.ok( "User logged in successfully", response ) )
} )


const logoutUser = asyncHandler( async ( req: AuthRequest, res: Response ) =>
{
    const user = req.user;
    if ( !user )
    {
        logger.warn( "unauthorized request", { message: "user not found" } )
        throw ApiError.unauthorized( "unauthorized request", [ "user not found" ] )
    }
    const responseData = await authService.logoutUser( user.id )
    return res.status( 200 ).json( ApiResponse.ok( "User logged out successfully", responseData ) )
} )


const forgetPassword = asyncHandler( async ( req: Request, res: Response ) =>
{
    const response = await authService.forgetPassword( req.body as forgetPasswordInput )
    return res.status( 200 ).json( ApiResponse.ok( "Password reset link sent successfully", [ "Password reset link sent successfully please check your email" ] ) )
} )

const resetPassword = asyncHandler( async ( req: Request, res: Response ) =>
{
    const response = await authService.resetPassword( req.body as resetPasswordInput )
    return res.status( 200 ).json( ApiResponse.ok( "Password reset successfully", [ "Password reset successfully" ] ) )
} )


const userDetails = asyncHandler( async ( req: AuthRequest, res: Response ) =>
{
    const user = req.user;
    if ( !user )
    {
        logger.warn( "unauthorized request", { message: "user not found" } )
        throw ApiError.unauthorized( "unauthorized request", [ "user not found" ] )
    }
    const response = await authService.getUserDetails( user.id )
    return res.status( 200 ).json( ApiResponse.ok( "User details fetched successfully", response ) )
} )

const refreshAccessToken = asyncHandler( async ( req: Request, res: Response ) =>
{
    const response = await authService.refreshAccessToken( req.body )
    return res.status( 200 )
        .cookie( "accessToken", response.accessToken, AccessTokenOptions )
        .cookie( "refreshToken", response.refreshToken, RefreshTokenOptions )
        .json( ApiResponse.ok( "Access token refreshed successfully", {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken
        } ) )
} )


export
{
    registerUser,
    resendCode,
    verifyUserEmail,
    loginUser,
    logoutUser,
    forgetPassword,
    resetPassword,
    userDetails,
    refreshAccessToken
}