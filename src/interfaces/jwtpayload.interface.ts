
interface RefreshTokenPayload
{
    id: string;
    email: string;
}

interface AccessTokenPayload extends RefreshTokenPayload
{

    first_name: string;
    last_name: string;

}

export type { AccessTokenPayload, RefreshTokenPayload };
