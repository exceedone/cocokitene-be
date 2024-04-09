import { PartialType } from '@nestjs/mapped-types'
import { UserStatus } from '@entities/user-status.entity'
import { UserStatusEnum } from '@shares/constants'

export class InsertUserStatusDto extends PartialType(UserStatus) {}

export const userStatusesData: InsertUserStatusDto[] = [
    {
        status: UserStatusEnum.INACTIVE,
        description: 'User has inactive status that is not yet activated',
    },
    {
        status: UserStatusEnum.ACTIVE,
        description:
            'User has active status that was approved by admin. User can login to the system',
    },
]
