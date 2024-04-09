import { User } from '@entities/user.entity'
import { Role } from '@entities/role.entity'

export interface DetailShareholderReponse extends Partial<User> {
    roles: Partial<Role>[]
}
