import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Socket } from 'socket.io'

export const UserWsScope = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const client = ctx.switchToWs().getClient<Socket>()
        console.log('client---', client)

        const wsContext = ctx.switchToWs()
        console.log('context---', wsContext)

        const user = wsContext.getData().user
        console.log('user been ws scope---', user)

        return user
    },
)
