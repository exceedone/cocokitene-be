import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'

@Catch(WsException)
export class WebSocketExceptionFilter implements ExceptionFilter {
    catch(exception: WsException, host: ArgumentsHost) {
        const client: Socket = host.switchToWs().getClient()

        client.emit('error', exception.getError())
    }
}
