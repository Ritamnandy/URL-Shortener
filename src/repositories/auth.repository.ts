
import type { IAuthRepository, CreatedUser, updatedUser, AccessTokenPayload, RefreshTokenPayload } from "../interfaces/index.js";
import bcrypt from "bcrypt"
import type { registerInput } from "../schemas/index.js"
import { prisma } from "../configs/prisma.client.config.js";
import { generateAccessToken, generateRefreshToken, logger } from "../utils/index.js";

const userSelect = {
    id: true,
    first_name: true,
    last_name: true,
    email: true,
    avatar: true,
} as const;


class AuthRepository implements IAuthRepository
{
    public async createUser ( data: registerInput ): Promise<CreatedUser | null>
    {
        const hashedPassword = await bcrypt.hash( data.password, 13 )
        return await prisma.user.create(
            {
                data: { ...data, password: hashedPassword }, select: userSelect
            }
        )
    }
    public async getUserById ( id: string ): Promise<CreatedUser | null>
    {
        return await prisma.user.findUnique( {
            where: {
                id
            }, select: userSelect
        } )
    }
    public async getUserByEmail ( email: string ): Promise<CreatedUser | null>
    {
        return await prisma.user.findUnique( {
            where: {
                email
            }, select: userSelect
        } )
    }
    public async updateUser ( id: string, data: Partial<updatedUser> ): Promise<CreatedUser | null>
    {
        return await prisma.user.update( {
            where: {
                id
            }, data, select: userSelect
        } )
    }
    public async deleteUser ( id: string ): Promise<boolean>
    {
        try
        {
            await prisma.user.update( {
                where: { id },
                data: {
                    status: "DELETED",
                    refreshToken: null,
                },
            } );
            return true;
        } catch ( err )
        {
            logger.error(
                `Error deleting user (id: ${ id }): ${ err instanceof Error ? err.message : err ?? "unknown error" }`
            );
            return false;
        }
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

    public async updateRefreshToken ( id: string, refreshToken: string ): Promise<void>
    {
        await prisma.user.update( {
            where: {
                id
            }, data: {
                refreshToken
            }
        } )
    }
    public async verifyPassword ( hashedPassword: string, userPassword: string ): Promise<boolean>
    {
        return await bcrypt.compare( userPassword, hashedPassword )
    }
    public async updatePassword ( id: string, password: string ): Promise<CreatedUser | null>
    {
        const hashedPassword = await bcrypt.hash( password, 13 )
        return await prisma.user.update( {
            where: {
                id
            }, data: {
                password: hashedPassword
            }, select: userSelect
        } )
    }
}


export const authRepository = new AuthRepository()