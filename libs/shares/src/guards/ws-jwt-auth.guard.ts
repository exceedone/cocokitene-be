import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Socket } from 'socket.io'
import { httpErrors } from '@shares/exception-filter'
import { verifyAccessTokenJWT } from '@shares/utils/jwt'
@Injectable()
export class WsJwtAuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<Socket>()
        const token = client.handshake.headers.authorization?.split(' ')[1]

        if (!token) {
            throw new HttpException(
                httpErrors.UNAUTHORIZED,
                HttpStatus.UNAUTHORIZED,
            )
        }

        try {
            const payload = await verifyAccessTokenJWT(token)
            if (payload) {
                context.switchToWs().getData().user = payload
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
