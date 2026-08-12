
class ApiError extends Error
{
    statusCode: number
    message: string
    private success: boolean
    data: null
    error: ( string | object )[]
    isOperational: boolean
    stack?: string

    constructor ( statusCode: number, message: string, error: ( string | object )[], isOperational: boolean = true, stack: string = "" )
    {
        super( message )
        this.statusCode = statusCode
        this.message = message
        this.success = false
        this.data = null
        this.error = error
        this.isOperational = isOperational
        if ( stack )
            this.stack = stack
        else
        {
            Error.captureStackTrace( this, this.constructor )
        }
    }

    toJSON ()
    {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            error: this.error,
            data: this.data,
            ...( process.env.NODE_ENV !== "production" && { stack: this.stack } )
        }
    }

    // static methods

    static badRequest ( message: string = "Bad Request", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 400, message, error )
    }

    static unauthorized ( message: string = "Unauthorized", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 401, message, error )
    }
    static forbidden ( message: string = "Forbidden", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 403, message, error )
    }

    static notFound ( message: string = "Not Found", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 404, message, error )
    }

    static conflict ( message: string = "Conflict", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 409, message, error )
    }

    static internalServerError ( message: string = "Internal Server Error", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 500, message, error )
    }

    static serviceUnavailable ( message: string = "Service Unavailable", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 503, message, error )
    }

    static tooManyRequests ( message: string = "Too Many Requests", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 429, message, error )
    }

    static unprocessableEntity ( message: string = "Unprocessable Entity", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 422, message, error )
    }

    static payLoadLarge ( message: string = "PayLoad Too Large", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 413, message, error )
    }

}

export { ApiError }