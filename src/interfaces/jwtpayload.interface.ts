
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
    avatar: string | null;
}

export type { AccessTokenPayload, RefreshTokenPayload };
