import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common'
import { verifySystemAdminAccessTokenJWT } from '@shares/utils/jwt'
import { httpErrors } from '@shares/exception-filter'
@Injectable()
export class SystemAdminGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest()
            const bearerHeader = request.headers.authorization

            if (!bearerHeader) {
                throw new HttpException(
                    httpErrors.UNAUTHORIZED,
                    HttpStatus.UNAUTHORIZED,
                )
            }

            const bearer = bearerHeader.split(' ')
            const token = bearer[1]

            const payload = await verifySystemAdminAccessTokenJWT(token)

            if (payload) {
                request.user = payload
                return true
            }
            return false
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.UNAUTHORIZED,
            )
        }
    }
}
