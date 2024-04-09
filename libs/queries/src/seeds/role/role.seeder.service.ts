import { Injectable, Logger } from '@nestjs/common'
import { RoleRepository } from '@repositories/role.repository'
import { InsertRoleDto, roleData } from '@seeds/role/data'
import { Role } from '@entities/role.entity'
import { CompanyRepository } from '@repositories/company.repository'

@Injectable()
export class RoleSeederService {
    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly companyRepository: CompanyRepository,
    ) {}

    async saveOneRole(role: InsertRoleDto): Promise<Role> {
        const existedRole = await this.roleRepository.findOne({
            where: {
                roleName: role.roleName,
            },
        })
        if (existedRole) {
            Logger.error(
                `Duplicate role with name: ${existedRole.roleName} role already exists`,
            )
            return
        }

        const createdRole = await this.roleRepository.create(role)
        await createdRole.save()
        Logger.log('role______inserted__role__id: ' + createdRole.id)
        return createdRole
    }
    async seedRole() {
        // ========end check Role=======
        // test demo seed data for role with company
        const companyNameDemo = 'cty TTM1'
        const company = await this.companyRepository.findOne({
            where: {
                companyName: companyNameDemo,
            },
        })
        if (!company) {
            Logger.error(`companyName'plan is not available. `)
            return
        }
        const roleSeedData: InsertRoleDto[] = roleData.map((role) => ({
            ...role,
            companyId: company.id,
        }))
        const savePromises = roleSeedData.map((role) => this.saveOneRole(role))

        Logger.debug('role______start__seeding__roles')
        await Promise.all(savePromises)
        Logger.log('role______end__seeding__roles')
    }
}
