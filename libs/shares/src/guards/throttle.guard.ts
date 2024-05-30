import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import { Socket } from 'socket.io'
@Injectable()
export class ThrottleGuard implements CanActivate {
    private CLIENT_REQUEST = 5
    private SERVER_REQUEST = 50
    private SECOND = 1

    private rateClientLimiter = new RateLimiterMemory({
        points: this.CLIENT_REQUEST,
        duration: this.SECOND,
    })

    private rateServerLimiter = new RateLimiterMemory({
        points: this.SERVER_REQUEST,
        duration: this.SECOND,
    })

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<Socket>()
        try {
            await Promise.all([
                this.rateClientLimiter.consume(client.id),
                this.rateServerLimiter.consume('server'),
            ])
            return true
        } catch (e) {
            client.emit('error', 'Request is limited')
            return false
        }
    }
}
