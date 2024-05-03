import { Global, Module } from '@nestjs/common'
import { CompanyStatusRepository } from '@repositories/company-status.repository'
import { CompanyRepository } from '@repositories/company.repository'
import { MeetingFileRepository } from '@repositories/meeting-file.repository'
import { MeetingRepository } from '@repositories/meeting.repository'
import { PlanRepository } from '@repositories/plan.repository'
import { ProposalFileRepository } from '@repositories/proposal-file.repository'
import { ProposalRepository } from '@repositories/proposal.repository'
import { RoleRepository } from '@repositories/role.repository'
import { SystemAdminRepository } from '@repositories/system-admin.repository'
import { UserMeetingRepository } from '@repositories/user-meeting.repository'
import { UserRoleRepository } from '@repositories/user-role.repository'
import { UserStatusRepository } from '@repositories/user-status.repository'
import { UserRepository } from '@repositories/user.repository'
import { VotingRepository } from '@repositories/voting.repository'
import { ShareholderRepository } from '@repositories/shareholder.repository'
import { TypeOrmExModule } from '@shares/modules'
import { PermissionRepository } from '@repositories/permission.repository'
import { RolePermissionRepository } from '@repositories/role-permission.repository'
import { TransactionRepository } from '@repositories/transaction.repository'
import { FileProposalTransactionRepository } from '@repositories/file-proposal-transaction.repository'
import { ParticipantMeetingTransactionRepository } from '@repositories/participant-meeting-transaction.repository'
import { ProposalTransactionRepository } from '@repositories/proposal-transaction.repository'
import { VotingTransactionRepository } from '@repositories/voting-transaction.repository'
import { FileMeetingTransactionRepository } from '@repositories/file-meeting-transaction.repository'
import { VotingCandidateRepository } from '@repositories/voting-candidate.repository'
import { ElectionRepository } from '@repositories/election.repository'
import { CandidateRepository } from '@repositories/candidate.repository'
import { MeetingRoleMtgRepository } from '@repositories/meeting-role-mtg.repository'
import { RoleMtgRepository } from '@repositories/role-mtg.repository'

const commonRepositories = [
    UserRepository,
    UserStatusRepository,
    RoleRepository,
    UserRoleRepository,
    MeetingRepository,
    UserMeetingRepository,
    MeetingFileRepository,
    ProposalRepository,
    VotingRepository,
    SystemAdminRepository,
    CompanyRepository,
    PlanRepository,
    CompanyStatusRepository,
    PlanRepository,
    ProposalFileRepository,
    PermissionRepository,
    RolePermissionRepository,
    ShareholderRepository,
    FileProposalTransactionRepository,
    TransactionRepository,
    ParticipantMeetingTransactionRepository,
    ProposalTransactionRepository,
    VotingTransactionRepository,
    FileMeetingTransactionRepository,
    VotingCandidateRepository,
    ElectionRepository,
    CandidateRepository,
    RoleMtgRepository,
    MeetingRoleMtgRepository,
]

@Global()
@Module({
    imports: [TypeOrmExModule.forCustomRepository(commonRepositories)],
    exports: [TypeOrmExModule],
})
export class GlobalRepository {}
