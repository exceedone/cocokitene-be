import { Injectable, Logger } from '@nestjs/common'
import { UserRepository } from '@repositories/user.repository'
import { RoleRepository } from '@repositories/role.repository'
import { UserStatusRepository } from '@repositories/user-status.repository'
import {
    InsertUserDto,
    userAdminData,
    userNomallyData,
    userShareholderData,
    userSuperAdminData,
} from '@seeds/user/data'
import { User } from '@entities/user.entity'
import { UserStatusEnum } from '@shares/constants'

@Injectable()
export class UserSeederService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly roleRepository: RoleRepository,
        private readonly userStatusRepository: UserStatusRepository,
    ) {}

    async saveOneUser(user: InsertUserDto): Promise<User> {
        const existedUser = await this.userRepository.findOne({
            where: {
                walletAddress: user.walletAddress,
            },
        })
        if (existedUser) {
            Logger.error(
                `Duplicate user admin with wallet address: ${existedUser.walletAddress} already exists`,
            )
            return
        }
        const createdUser = await this.userRepository.create(user)
        await createdUser.save()
        Logger.log('user_____inserted__user_id: ' + createdUser.id)
        return createdUser
    }

    async seedUser() {
        // get active status of user and role super_admin
        const [userSupperAdminStatus, roleSupperAdmin] = await Promise.all([
            this.userStatusRepository.getUserStatusByStatusType(
                UserStatusEnum.ACTIVE,
            ),
            this.roleRepository.getRoleByName('SUPER_ADMIN'),
        ])
        if (!userSupperAdminStatus) {
            Logger.error(
                `active status of user is not available. Please seed user status first`,
            )
            return
        }
        if (!roleSupperAdmin) {
            Logger.error(
                `role super_admin of user is not available. Please seed user role first`,
            )
            return
        }

        const userSeedSupperAdminData: InsertUserDto[] = userSuperAdminData.map(
            (user) => ({
                ...user,
                statusId: userSupperAdminStatus.id,
                roleId: roleSupperAdmin.id,
            }),
        )

        const saveSupperAdminPromises = userSeedSupperAdminData.map((user) =>
            this.saveOneUser(user),
        )
        Logger.debug('user______start__seeding__user_super_admin')
        await Promise.all(saveSupperAdminPromises)
        Logger.log('user______end__seeding__user_supper_admin')
        // =============================================
        // get active status of user and role admin
        const [userAdminStatus, roleAdmin] = await Promise.all([
            this.userStatusRepository.getUserStatusByStatusType(
                UserStatusEnum.ACTIVE,
            ),
            this.roleRepository.getRoleByName('ADMIN'),
        ])
        if (!userAdminStatus) {
            Logger.error(
                `active status of user is not available. Please seed user status first`,
            )
            return
        }
        if (!roleAdmin) {
            Logger.error(
                `role super_admin of user is not available. Please seed user role first`,
            )
            return
        }
        const userSeedAdminData: InsertUserDto[] = userAdminData.map(
            (user) => ({
                ...user,
                statusId: userAdminStatus.id,
                roleId: roleAdmin.id,
            }),
        )
        const saveAdminPromises = userSeedAdminData.map((user) =>
            this.saveOneUser(user),
        )

        Logger.debug('user______start__seeding__user_admin')
        await Promise.all(saveAdminPromises)
        Logger.log('user______end__seeding__user_admin')
        //
        // // get active status and role normally user
        const [userNormallyStatus, roleUserNomally] = await Promise.all([
            this.userStatusRepository.getUserStatusByStatusType(
                UserStatusEnum.ACTIVE,
            ),
            this.roleRepository.getRoleByName('USER'),
        ])
        if (!userNormallyStatus) {
            Logger.error(
                `active status is not available. Please seed seller status first`,
            )
            return
        }
        if (!roleUserNomally) {
            Logger.error(`role is not available. Please seed seller role first`)
            return
        }

        const normallySeedData: InsertUserDto[] = userNomallyData.map(
            (user) => ({
                ...user,
                statusId: userNormallyStatus.id,
                roleId: roleUserNomally.id,
            }),
        )
        const saveUserNormallyPromises = normallySeedData.map((user) =>
            this.saveOneUser(user),
        )

        Logger.debug('user______start__seeding__user_normally')
        await Promise.all(saveUserNormallyPromises)
        Logger.log('user______end__seeding__user_normally')

        // // get active status and role shareholder user
        const [userShareholderStatus, roleShareholderNomally] =
            await Promise.all([
                this.userStatusRepository.getUserStatusByStatusType(
                    UserStatusEnum.ACTIVE,
                ),
                this.roleRepository.getRoleByName('SHAREHOLDER'),
            ])
        if (!userShareholderStatus) {
            Logger.error(
                `active status is not available. Please seed seller status first`,
            )
            return
        }
        if (!roleShareholderNomally) {
            Logger.error(`role is not available. Please seed seller role first`)
            return
        }

        const shareholderSeedData: InsertUserDto[] = userShareholderData.map(
            (user) => ({
                ...user,
                statusId: userShareholderStatus.id,
                roleId: roleShareholderNomally.id,
            }),
        )
        const saveUserSharedholderPromises = shareholderSeedData.map((user) =>
            this.saveOneUser(user),
        )

        Logger.debug('user______start__seeding__user_shareholder')
        await Promise.all(saveUserSharedholderPromises)
        Logger.log('user______start__seeding__user_shareholder')
    }
}
