import { Injectable } from '@nestjs/common'
import { Permission } from '@entities/permission.entity'
import { PermissionRepository } from '@repositories/permission.repository'
import { GetAllPermissionDto } from '@dtos/permissions.dto'
import { PermissionEnum } from '@shares/constants'

@Injectable()
export class PermissionService {
    constructor(private readonly permissionRepository: PermissionRepository) {}

    async getAllNormalPermissions(
        getAllPermissionDto: GetAllPermissionDto,
    ): Promise<Permission[]> {
        const normalPermissions =
            await this.permissionRepository.getAllPermissions(
                getAllPermissionDto,
            )
        const [permissionBasic, permissionSupperAdmin] = await Promise.all([
            this.permissionRepository.getPermissionByPermissionName(
                PermissionEnum.BASIC_PERMISSION,
            ),
            this.permissionRepository.getPermissionByPermissionName(
                PermissionEnum.SUPER_ADMIN_PERMISSION,
            ),
        ])

        const filteredNormalPermissions = normalPermissions.filter(
            (permission) => {
                return (
                    permission.id !== permissionBasic.id &&
                    permission.id !== permissionSupperAdmin.id
                )
            },
        )

        return filteredNormalPermissions
    }
    async getAllInternalPermissions(
        getAllPermissionDto: GetAllPermissionDto,
    ): Promise<Permission[]> {
        const internalPermissions =
            await this.permissionRepository.getAllPermissions(
                getAllPermissionDto,
            )

        return internalPermissions
    }

    async getAllPermissionsBase(): Promise<Permission[]> {
        const permissions = await Promise.all(
            [
                PermissionEnum.SHAREHOLDERS_MTG,
                PermissionEnum.BASIC_PERMISSION,
                PermissionEnum.DETAIL_MEETING,
            ].map((permissionName) =>
                this.permissionRepository.getPermissionByPermissionName(
                    permissionName,
                ),
            ),
        )

        return permissions
    }

    async getPermissionsBaseForRoleShareholder(): Promise<Permission[]> {
        const permissions = await Promise.all(
            [PermissionEnum.LIST_SHAREHOLDERS, PermissionEnum.LIST_ACCOUNT].map(
                (permissionName) =>
                    this.permissionRepository.getPermissionByPermissionName(
                        permissionName,
                    ),
            ),
        )

        return permissions
    }

    async getPermissionsBaseForRoleBoard(): Promise<Permission[]> {
        const permissions = await Promise.all(
            [
                PermissionEnum.LIST_ACCOUNT,
                PermissionEnum.DETAIL_ACCOUNT,
                PermissionEnum.LIST_SHAREHOLDERS,
                PermissionEnum.BOARD_MEETING,
                PermissionEnum.DETAIL_BOARD_MEETING,
            ].map((permissionName) =>
                this.permissionRepository.getPermissionByPermissionName(
                    permissionName,
                ),
            ),
        )

        return permissions
    }
}
