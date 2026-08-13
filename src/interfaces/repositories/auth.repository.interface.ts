
import type { registerInput } from "../../schemas/index.js"
import type { AccessTokenPayload, RefreshTokenPayload } from "../index.js"
type CreatedUser =
    {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        avatar: string | null;
    }
type updatedUser = {
    first_name: string;
    last_name: string;
}
interface IAuthRepository
{
    createUser ( data: registerInput ): Promise<CreatedUser | null>;
    getUserById ( id: string ): Promise<CreatedUser | null>
    getUserByEmail ( email: string ): Promise<CreatedUser | null>
    deleteUser ( id: string ): Promise<boolean>
    updateUser ( id: string, data: Partial<updatedUser> ): Promise<CreatedUser | null>
    generateTokenPair ( accessTokenPayload: AccessTokenPayload, refreshTokenPayload: RefreshTokenPayload ): { accessToken: string, refreshToken: string } | null
    updatedRefreshToken ( id: string, refreshToken: string ): Promise<void>
}

export type { IAuthRepository, CreatedUser, updatedUser }