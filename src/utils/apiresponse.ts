
class ApiResponse<T = unknown>
{

    statusCode: number;
    message: string;
    data: T;
    private success: boolean;
    private error: null;
    meta?: Record<string, unknown>

    constructor ( statusCode: number, message: string, data: T, meta?: Record<string, unknown> ) 
    {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = true;
        this.error = null;
        this.meta = meta || {}

    }

    toJSON ()
    {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            error: this.error,
            data: this.data,
            ...( this.meta && { meta: this.meta } ),
        }
    }

    //static methods

    static ok<T> ( message: string = "success", data: T ): ApiResponse<T>
    {
        return new ApiResponse( 200, message, data )
    }

    static created<T> ( message: string = "Resource created successfully", data: T ): ApiResponse<T>
    {
        return new ApiResponse( 201, message, data )
    }

    static accepted<T> ( message: string = "Resource accepted successfully", data: T ): ApiResponse<T>
    {
        return new ApiResponse( 202, message, data )
    }

    static noContent ( message: string = "Resource deleted successfully" )
    {
        return new ApiResponse( 204, message, null )
    }

    //pagination
    static paginated<T> (
        data: T[],
        page: number,
        limit: number,
        total: number,
        message = "Success"
    )
    {
        return new ApiResponse<T[]>( 200, message, data, {
            page,
            limit,
            total,
            totalPages: Math.ceil( total / limit ),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
        } )
    }



}

export { ApiResponse }