import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpStatus,
} from '@nestjs/common'
import { instanceToPlain } from 'class-transformer'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response<T> {
    data: T
    metadata: Record<string, unknown>
}

@Injectable()
export class ResponseTransformInterceptor<T>
    implements NestInterceptor<T, Response<T>>
{
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<Response<T>> {
        return next.handle().pipe(
            map((_data) => {
                // @Exclude sensitive data
                const data = instanceToPlain(_data)
                const req = context.switchToHttp().getRequest()

                const metadata = {
                    ...data.metadata,
                }
                metadata.timestamp = new Date()

                if (data?.data?.length || data?.length) {
                    metadata.length = data?.data?.length || data?.length
                }
                if (req.query) {
                    metadata.query = { ...req.query }
                }

                delete data.metadata
                return {
                    code: HttpStatus.OK,
                    data: data.data || data,
                    metadata: metadata,
                }
            }),
        )
    }
}
