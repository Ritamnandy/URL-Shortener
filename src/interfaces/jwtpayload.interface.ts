
interface RefreshTokenPayload
{
    id: string;
    email: number;
}

interface AccessTokenPayload extends RefreshTokenPayload
{
    isVerified: boolean;
    first_name: string;
    last_name: string;
}

export type{ AccessTokenPayload, RefreshTokenPayload };
