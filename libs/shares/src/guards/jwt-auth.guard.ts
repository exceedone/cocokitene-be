import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common'
import * as _ from 'lodash'
import { verifyAccessTokenJWT } from '@shares/utils/jwt'
import { Reflector } from '@nestjs/core'
import { PERMISSION_KEY } from '@shares/decorators/permission.decorator'
import { httpErrors } from '@shares/exception-filter'

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const permissionKey = this.reflector.get<string>(
                PERMISSION_KEY,
                context.getHandler(),
            )
            if (!permissionKey) {
                return true
            }
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
            const payload = await verifyAccessTokenJWT(token)
            const userPermissions = _.get(payload, 'permissionKeys', [])
            if (payload && userPermissions.includes(permissionKey)) {
                request.user = payload
                return true
            }
            return false
        } catch (error) {
            throw new HttpException(
                httpErrors.UNAUTHORIZED,
                HttpStatus.UNAUTHORIZED,
            )
        }
    }
}
