

import type { IAuthRepository, IEmailRepository, IcacheRepository, CreatedUser, RefreshTokenPayload } from "../interfaces/index.js"
import { logger, ApiError, signupKey, otpKey, resendCoolDownKey, resetCooldownKey, verifyRefreshToken, resetKey } from "../utils/index.js"
import type { registerInput, loginInput, forgetPasswordInput, verifyEmailInput, resendCodeInput, resetPasswordInput } from "../schemas/index.js"
import { generateOtp, hashToken, rowToken } from "../constants.js"
import { emailRepository, authRepository, cacheRepository } from "../repositories/index.js"


interface sendUser extends CreatedUser
{
    accessToken: string
    refreshToken: string
}




export class AuthService
{
    constructor (
        private readonly authRepository: IAuthRepository,
        private readonly emailRepository: IEmailRepository,
        private readonly cacheRepository: IcacheRepository
    ) { }

    private genarateTokens ( user: CreatedUser )
    {
        return this.authRepository.generateTokenPair( { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name }, { id: user.id, email: user.email } )
    }

    async registerUser ( data: registerInput ): Promise<void>
    {
        const user = await this.authRepository.getUserByEmail( data.email )
        if ( !user )
        {
            const userName = `${ data.first_name } ${ data.last_name }`
            const otp = generateOtp()
            // Register the user and send the verification email
            await Promise.all( [
                // Set the user data in the cache with a 20 minutes TTL
                this.cacheRepository.set( signupKey( data.email ), JSON.stringify( data ), 60 * 20 ),
                // Set the OTP in the cache with a 10 minutes TTL
                this.cacheRepository.set( otpKey( data.email ), JSON.stringify( otp ), 60 * 10 ),
                // Send the verification email
                this.emailRepository.sendVerificationEmail( { token: otp, userName, userEmail: data.email } )
            ] )
            logger.info( `Register issued and Email sent to ${ data.email }` )
        } else
        {
            logger.error( "User already exists", { email: data.email } )
            throw ApiError.badRequest( "User already exists", [ "User already exists" ] )
        }

    }

    async verifyUserEmail ( data: verifyEmailInput ): Promise<sendUser>
    {
        const cacheOtp = await this.cacheRepository.get( otpKey( data.email ) )
        if ( !cacheOtp )
        {
            logger.error( "OTP session expired", { email: data.email } )
            throw ApiError.badRequest( "OTP session expired", [ "OTP session expired" ] )
        }
        if ( cacheOtp !== data.token )
        {
            logger.error( "Invalid OTP", { email: data.email } )
            throw ApiError.badRequest( "Invalid OTP", [ "please enter valid OTP" ] )
        }
        const cacheData = await this.cacheRepository.get( signupKey( data.email ) )
        if ( !cacheData )
        {
            logger.error( "User register session expired", { email: data.email } )
            throw ApiError.badRequest( "User register session expired", [ "User register session expired" ] )
        }
        const userData: registerInput = JSON.parse( cacheData )
        const user = await this.authRepository.createUser( userData )
        if ( !user )
        {
            logger.error( "Error creating user", { email: data.email } )
            throw ApiError.badRequest( "Invalid credentials", [ "Invalid credentials or server error" ] )
        }
        const Token = this.genarateTokens( user )
        if ( !Token )
        {
            logger.error( "Error creating token", { email: data.email } )
            throw ApiError.badRequest( "Invalid credentials", [ "Invalid credentials or server error" ] )
        }
        await this.authRepository.updateRefreshToken( Token.refreshToken, user.id )
        await Promise.all( [
            this.cacheRepository.delete( otpKey( data.email ) ),
            this.cacheRepository.delete( signupKey( data.email ) )
        ] )
        return {
            ...user,
            accessToken: Token.accessToken,
            refreshToken: Token.refreshToken
        }


    }

    async resendOtpCode ( data: resendCodeInput ): Promise<void>
    {
        const cooldown = await this.cacheRepository.get( resendCoolDownKey( data.email ) )
        if ( cooldown )
        {
            logger.warn( "Resend code limit reached", { email: data.email } )
            throw ApiError.tooManyRequests( "Resend code limit reached", [ "Please wait before requesting another code" ] )
        }
        const cachedata = await this.cacheRepository.get( signupKey( data.email ) )
        if ( !cachedata )
        {
            throw ApiError.badRequest( "User register session expired", [ "User register session expired" ] )
        }
        const userData: registerInput = JSON.parse( cachedata )
        const otp = generateOtp()
        const userName = `${ userData.first_name } ${ userData.last_name }`
        await Promise.all( [
            this.cacheRepository.set( otpKey( data.email ), JSON.stringify( otp ), 60 * 10 ),
            this.cacheRepository.set( resendCoolDownKey( data.email ), 'true', 60 * 2 ),
            this.emailRepository.sendVerificationEmail( { token: otp, userName: `${ userData.first_name } ${ userData.last_name }`, userEmail: data.email } )
        ] )

    }

    async loginUser ( data: loginInput ): Promise<sendUser>
    {
        const user = await this.authRepository.getUserWithPasswordByEmail( data.email )
        if ( !user )
        {
            logger.error( "User not found", { email: data.email } )
            throw ApiError.badRequest( "User not found", [ "User not found please register first" ] )
        }
        if ( !user.password )
        {
            throw ApiError.badRequest( "User not found", [ "User not found please register first" ] )
        }
        const isPasswordMatch = await this.authRepository.verifyPassword( user.password, data.password )
        if ( !isPasswordMatch )
        {
            logger.error( "Invalid credentials", { email: data.email } )
            throw ApiError.badRequest( "Invalid credentials", [ "Invalid credentials " ] )
        }
        const userData = await this.authRepository.getUserById( user.id )
        if ( !userData )
        {
            logger.error( "User not found", { email: data.email } )
            throw ApiError.badRequest( "User not found", [ "User not found please register first" ] )
        }
        const Token = this.genarateTokens( userData )
        if ( !Token )
        {
            logger.error( "Error creating token", { email: data.email } )
            throw ApiError.badRequest( "Invalid credentials", [ "Invalid credentials or server error" ] )
        }
        await this.authRepository.updateRefreshToken( Token.refreshToken, userData.id )
        return {
            ...userData,
            accessToken: Token.accessToken,
            refreshToken: Token.refreshToken
        }
    }

    async logoutUser ( userId: string ): Promise<void>
    {
        const response = await this.authRepository.deleteUser( userId )
        if ( !response )
        {
            logger.error( "Error deleting user", { userId } )
            throw ApiError.badRequest( "Error deleting user", [ "Error deleting user" ] )
        }
    }

    async refreshAccessToken ( refreshToken: string ): Promise<sendUser>
    {
        try
        {
            const decodedToken: RefreshTokenPayload | null = verifyRefreshToken( refreshToken )
            const user = await this.authRepository.getUserWithPasswordByEmail( decodedToken?.id ?? "" )
            if ( !user )
            {
                logger.error( "User not found", { user } )
                throw ApiError.badRequest( "User not found", [ "User not found" ] )
            }
            if ( !user.refreshToken )
            {
                logger.error( "Refresh token not found", )
                throw ApiError.badRequest( "Refresh token not found", [ "Refresh token not found please login again" ] )
            }
            if ( user.refreshToken !== refreshToken )
            {
                logger.error( "Invalid refresh token", )
                throw ApiError.badRequest( "Invalid refresh token", [ "Invalid refresh token please login again" ] )
            }
            const userData = await this.authRepository.getUserById( user.id )
            if ( !userData )
            {
                logger.error( "User not found", { user } )
                throw ApiError.badRequest( "User not found", [ "User not found" ] )
            }
            const Token = this.genarateTokens( userData )
            if ( !Token )
            {
                logger.error( "Error creating token", { user } )
                throw ApiError.badRequest( "Invalid credentials", [ "Invalid credentials or server error" ] )
            }
            await this.authRepository.updateRefreshToken( Token.refreshToken, userData.id )
            return {
                ...userData,
                accessToken: Token.accessToken,
                refreshToken: Token.refreshToken
            }
        } catch ( error )
        {
            logger.error( "Error refreshing access token", { error: ( error as Error ).message } );
            if ( error instanceof ApiError )
            {
                throw error;
            }
            throw ApiError.internalServerError( "Error refreshing access token", [ "Error refreshing access token" ] );
        }

    }

    async forgetPassword ( data: forgetPasswordInput ): Promise<void>
    {
        const coolDown = await this.cacheRepository.get( resetCooldownKey( data.email ) )
        if ( coolDown )
        {
            logger.error( "Password reset cooldown", { email: data.email } )
            throw ApiError.tooManyRequests( "Password reset cooldown", [ "Please wait before requesting another password reset" ] )
        }
        const user = await this.authRepository.getUserByEmail( data.email )
        if ( !user )
        {
            logger.error( "User not found", { email: data.email } )
            throw ApiError.badRequest( "User not found", [ "User not found please register first" ] )
        }
        const rowtoken = rowToken()
        const hashtoken = hashToken( rowtoken )
        const forgetPasswordLink = `${ process.env.FORGOT_PASSWORD_URL as string }/${ hashtoken }`

        await Promise.all(
            [
                this.cacheRepository.set( resetKey( hashtoken ), user.email, 60 * 15 ),
                this.cacheRepository.set( resetCooldownKey( data.email ), "true", 60 * 60 * 24 ),
                this.emailRepository.sendForgetPasswordEmail( { link: forgetPasswordLink, userEmail: user.email, userName: user.first_name } )
            ]
        )

        logger.info( "Password reset link sent", { email: data.email } )

    }

    async resetPassword ( data: resetPasswordInput ): Promise<void>
    {
        const hashtoken = hashToken( data.token )
        const cachedEmail = await this.cacheRepository.get( resetKey( hashtoken ) )
        if ( !cachedEmail )
        {
            logger.error( "Password reset link expired", { email: data.email } )
            throw ApiError.badRequest( "Password reset link expired", [ "Password reset link expired or invalid token" ] )
        }
        const user = await this.authRepository.getUserByEmail( cachedEmail )
        if ( !user )
        {
            logger.error( "User not found", { email: data.email } )
            throw ApiError.badRequest( "User not found", [ "User not found please register first" ] )
        }

        await this.authRepository.updatePassword( user.id, data.newPassword )

        await Promise.all(
            [
                this.cacheRepository.delete( resetKey( hashtoken ) ),
                this.cacheRepository.delete( resetCooldownKey( data.email ) ),
                this.emailRepository.sendPasswordChangeEmail( { userEmail: user.email, userName: user.first_name } )
            ]
        )
        logger.info( `Password reset successful for ${ data.email }` )
    }

    async getUserDetails ( userId: string ): Promise<CreatedUser>
    {
        const user = await this.authRepository.getUserById( userId )
        if ( !user )
        {
            logger.error( "User not found", { userId } )
            throw ApiError.unauthorized( "User not found", [ "unauthorized request please login or register" ] )
        }
        return user
    }

}


export const authService = new AuthService( authRepository, emailRepository, cacheRepository )