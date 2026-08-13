
import type { IAuthRepository, CreatedUser, AccessTokenPayload, RefreshTokenPayload } from "../interfaces/index.js";
import type { registerInput } from "../schemas/index.js"
import { prisma } from "../configs/prisma.client.config.js";
import { generateAccessToken, generateRefreshToken, logger } from "../utils/index.js";

class AuthRepository implements IAuthRepository
{
    public async createUser ( data: registerInput ): Promise<CreatedUser | null>
    {
        return await prisma.user.create( {
            data
        } )
    }
    public async getUserById ( id: string ): Promise<CreatedUser | null>
    {
        return await prisma.user.findUnique( {
            where: {
                id
            }, select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                avatar: true
            }
        } )
    }
    public async getUserByEmail ( email: string ): Promise<CreatedUser | null>
    {
        return await prisma.user.findUnique( {
            where: {
                email
            }, select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                avatar: true
            }
        } )
    }
    public async updateUser ( id: string, data: Partial<CreatedUser> ): Promise<CreatedUser | null>
    {
        return await prisma.user.update( {
            where: {
                id
            }, data
        } )
    }
    public async deleteUser ( id: string ): Promise<boolean>
    {
        await prisma.user.update( {
            where: {
                id
            }, data: {
                status: "DELETED",
                refreshToken: null
            }
        } )
        return true
    }

    public generateTokenPair ( accessTokenPayload: AccessTokenPayload, refreshTokenPayload: RefreshTokenPayload ): { accessToken: string, refreshToken: string } | null
    {
        try
        {
            return {
                accessToken: generateAccessToken( accessTokenPayload ),
                refreshToken: generateRefreshToken( refreshTokenPayload )
            }
        } catch ( err )
        {
            logger.error( `Error generating token: ${ err instanceof Error ? err.message : err ?? "unknown error" }` );
            return null
        }
    }

    public async updatedRefreshToken ( id: string, refreshToken: string ): Promise<void>
    {
        await prisma.user.update( {
            where: {
                id
            }, data: {
                refreshToken
            }
        } )
    }

}


export const authRepository = new AuthRepository()