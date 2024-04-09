import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { httpErrors } from '@shares/exception-filter/http-errors.const'
import { Response } from 'express'

interface ExceptionResponse {
    message: string
    code: string
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()
        const status = exception.getStatus()

        const { code, message, ...rest } =
            exception.getResponse() as ExceptionResponse

        response.status(status).json({
            code: code || httpErrors.COMMON.code,
            statusCode: status || HttpStatus.INTERNAL_SERVER_ERROR,
            info: {
                message: message || httpErrors.COMMON.message,
                ...rest,
            },
            path: request.url,
        })
    }
}
