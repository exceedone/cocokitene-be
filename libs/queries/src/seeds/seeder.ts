import { Injectable, Logger } from '@nestjs/common'
import { PlanSeederService } from '@seeds/plan/plan.seeder.service'
import { CompanyStatusSeederService } from '@seeds/company-status/company-status.seeder.service'
import { CompanySeederService } from '@seeds/company/company.seeder.service'
import { PermissionSeederService } from '@seeds/permission/permission.seeder.service'
import { RoleSeederService } from '@seeds/role/role.seeder.service'
import { UserSeederService } from '@seeds/user/user.seeder.service'
import { UserStatusSeederService } from '@seeds/user-status/user-status.seeder.service'
import { RolePermissionSeederService } from '@seeds/role-permission/role-permission.seeder.service'
import { UserRoleSeederService } from '@seeds/user-role/user-role.seeder.service'
import { SystemAdminSeederService } from '@seeds/system-admin/system-admin.seeder.service'
import { ElectionSeederService } from '@seeds/election/election.seeder.service'

@Injectable()
export class Seeder {
    constructor(
        private readonly planSeederService: PlanSeederService,
        private readonly companyStatusSeederService: CompanyStatusSeederService,
        private readonly companySeederService: CompanySeederService,
        private readonly permissionSeederService: PermissionSeederService,
        private readonly roleSeederService: RoleSeederService,
        private readonly userSeederService: UserSeederService,
        private readonly userStatusSeederService: UserStatusSeederService,
        private readonly rolePermissionSeederService: RolePermissionSeederService,
        private readonly userRoleSeederService: UserRoleSeederService,
        private readonly systemAdminSeederService: SystemAdminSeederService,
        private readonly electionSeederService: ElectionSeederService,
    ) {}
    async seed() {
        Logger.log('START_SEEDING__DATA')
        await this.seedElection()
        await this.seedPlan()
        await this.seedCompanyStatus()
        // await this.seedCompany()
        await this.seedPermission()
        // await this.seedRole()
        // await this.seedRolePermission()
        await this.seedUserStatus()
        // await this.seedUser()
        // await this.seedUserRole()
        await this.seedSystemAdmin()
        Logger.log('END___SEEDING__DATA')
    }

    async seedElection() {
        await this.electionSeederService.seedElection()
    }
    async seedPlan() {
        await this.planSeederService.seedPlan()
    }
    async seedCompanyStatus() {
        await this.companyStatusSeederService.seedCompanyStatus()
    }
    async seedCompany() {
        await this.companySeederService.seedCompany()
    }
    async seedPermission() {
        await this.permissionSeederService.seedPermission()
    }
    async seedRole() {
        await this.roleSeederService.seedRole()
    }
    async seedUserStatus() {
        await this.userStatusSeederService.seedUserStatus()
    }
    async seedUser() {
        await this.userSeederService.seedUser()
    }
    async seedRolePermission() {
        await this.rolePermissionSeederService.seedRolePermission()
    }
    async seedUserRole() {
        await this.userRoleSeederService.seedUserRole()
    }
    async seedSystemAdmin() {
        await this.systemAdminSeederService.seedSystemAdmin()
    }
}
