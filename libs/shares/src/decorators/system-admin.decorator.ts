import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { SystemAdmin } from '@entities/system-admin.entity'

export const SystemAdminScope = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest()
        return request.user as SystemAdmin
    },
)
