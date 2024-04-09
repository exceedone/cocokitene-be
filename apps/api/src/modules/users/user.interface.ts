import { User } from '@entities/user.entity'
import { Role } from '@entities/role.entity'

export interface DetailUserReponse extends Partial<User> {
    roles: Partial<Role>[]
}
