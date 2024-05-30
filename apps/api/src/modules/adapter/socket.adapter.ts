import { INestApplication } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'

export class SocketAdapter extends IoAdapter {
    constructor(private readonly app: INestApplication) {
        super(app)
    }

    createIOServer(port: number): any {
        const server = super.createIOServer(port, {
            cors: {
                origin: '*',
            },
        })
        return server
    }
}
