
// Minimal shape of a node-postgres error
interface PgError extends Error
{
    code?: string;
    detail?: string;
    column?: string;
    table?: string;
    constraint?: string;
}

export type{ PgError }